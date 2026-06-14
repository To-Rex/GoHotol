from fastapi import Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.domain.repositories.user import UserRepository

security = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
):
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    token = credentials.credentials
    payload = decode_token(token)
    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    user_id = int(payload.get("sub"))
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return user


async def get_current_company_id(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    if not credentials:
        return None
    payload = decode_token(credentials.credentials)
    if payload:
        return payload.get("company_id")
    return None


def require_permission(permission_slug: str):
    async def permission_checker(
        request: Request,
        current_user=Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ):
        user_repo = UserRepository(db)
        perms = await user_repo.get_permissions(current_user.id)
        if current_user.is_super_admin:
            return True
        if permission_slug not in perms:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return True
    return permission_checker


async def get_super_admin(
    current_user=Depends(get_current_user),
):
    if not current_user.is_super_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Super admin access required")
    return current_user
