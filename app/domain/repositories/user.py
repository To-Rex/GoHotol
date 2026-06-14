from sqlalchemy import select, or_
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.models.user import User, Role, Permission, role_permissions, user_roles
from app.domain.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    async def get_by_username(self, username: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.username == username)
        )
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.session.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()

    async def get_permissions(self, user_id: int) -> list[str]:
        result = await self.session.execute(
            select(Permission.slug)
            .join(role_permissions, role_permissions.c.permission_id == Permission.id)
            .join(user_roles, user_roles.c.role_id == role_permissions.c.role_id)
            .where(user_roles.c.user_id == user_id)
            .where(Permission.is_active == True)
            .distinct()
        )
        return [row[0] for row in result.all()]


class RoleRepository(BaseRepository[Role]):
    model = Role

    async def assign_permissions(self, role_id: int, permission_ids: list[int]) -> None:
        await self.session.execute(
            role_permissions.delete().where(role_permissions.c.role_id == role_id)
        )
        for perm_id in permission_ids:
            await self.session.execute(
                role_permissions.insert().values(role_id=role_id, permission_id=perm_id)
            )
        await self.session.flush()

    async def get_role_permissions(self, role_id: int) -> list[dict]:
        result = await self.session.execute(
            select(Permission)
            .join(role_permissions, role_permissions.c.permission_id == Permission.id)
            .where(role_permissions.c.role_id == role_id)
        )
        return [
            {"id": p.id, "name": p.name, "slug": p.slug, "module": p.module}
            for p in result.scalars().all()
        ]


class PermissionRepository(BaseRepository[Permission]):
    model = Permission
