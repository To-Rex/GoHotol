from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import hash_password, verify_password, create_tokens, decode_token
from app.domain.models.user import User
from app.domain.repositories.user import UserRepository, RoleRepository, PermissionRepository


class AuthService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.user_repo = UserRepository(session)
        self.role_repo = RoleRepository(session)
        self.perm_repo = PermissionRepository(session)

    async def login(self, username: str, password: str) -> dict:
        user = await self.user_repo.get_by_username(username)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

        access_token, refresh_token = create_tokens(
            user_id=user.id, company_id=user.company_id
        )
        user.refresh_token = refresh_token
        user.last_login_at = datetime.now(timezone.utc).isoformat()
        await self.session.flush()

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    async def refresh_token(self, refresh_token: str) -> dict:
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        user_id = int(payload.get("sub"))
        user = await self.user_repo.get_by_id(user_id)
        if not user or user.refresh_token != refresh_token:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        access_token, new_refresh = create_tokens(user_id=user.id, company_id=user.company_id)
        user.refresh_token = new_refresh
        await self.session.flush()

        return {
            "access_token": access_token,
            "refresh_token": new_refresh,
            "token_type": "bearer",
        }

    async def register_user(self, data: dict) -> User:
        existing = await self.user_repo.get_by_username(data["username"])
        if existing:
            raise HTTPException(status_code=400, detail="Username already exists")
        existing = await self.user_repo.get_by_email(data["email"])
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")

        user = User(
            username=data["username"],
            email=data["email"],
            hashed_password=hash_password(data["password"]),
            full_name=data["full_name"],
            phone=data.get("phone"),
            company_id=data.get("company_id"),
            hotel_id=data.get("hotel_id"),
            branch_id=data.get("branch_id"),
            is_super_admin=data.get("is_super_admin", False),
        )
        self.session.add(user)
        await self.session.flush()
        return user

    async def get_user_permissions(self, user_id: int) -> list[str]:
        return await self.user_repo.get_permissions(user_id)

    async def has_permission(self, user_id: int, permission_slug: str) -> bool:
        perms = await self.get_user_permissions(user_id)
        return permission_slug in perms
