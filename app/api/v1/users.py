from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, get_super_admin, require_permission
from app.domain.schemas.user import (
    RoleCreate, RoleUpdate, RoleOut,
    PermissionCreate, PermissionOut,
    RolePermissionAssign, UserRoleAssign,
)
from app.domain.repositories.user import UserRepository, RoleRepository, PermissionRepository
from app.domain.models.user import Role, Permission

router = APIRouter(prefix="/roles", tags=["Roles & Permissions"])
perm_router = APIRouter(prefix="/permissions", tags=["Permissions"])


@router.get("", response_model=List[RoleOut])
async def list_roles(

    company_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_roles"))
    ):
    repo = RoleRepository(db)
    filters = {}
    if company_id:
        filters["company_id"] = company_id
    return await repo.get_all(filters=filters)


@router.post("", response_model=RoleOut)
async def create_role(

    data: RoleCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("create_role"))
    ):
    repo = RoleRepository(db)
    role = Role(**data.model_dump())
    return await repo.create(role)


@router.put("/{role_id}", response_model=RoleOut)
async def update_role(
role_id: int, data: RoleUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("edit_role"))
    ):
    repo = RoleRepository(db)
    role = await repo.get_by_id(role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(role, key, value)
    return await repo.update(role)


@router.post("/assign-permissions")
async def assign_permissions_to_role(

    data: RolePermissionAssign,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("assign_permissions"))
    ):
    repo = RoleRepository(db)
    await repo.assign_permissions(data.role_id, data.permission_ids)
    return {"message": "Permissions assigned"}


@router.get("/{role_id}/permissions")
async def get_role_permissions(
role_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_roles"))
    ):
    repo = RoleRepository(db)
    return await repo.get_role_permissions(role_id)


@perm_router.get("", response_model=List[PermissionOut])
async def list_permissions(

    module: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_roles"))
    ):
    repo = PermissionRepository(db)
    filters = {}
    if module:
        filters["module"] = module
    return await repo.get_all(filters=filters)


@perm_router.post("", response_model=PermissionOut)
async def create_permission(

    data: PermissionCreate,
    db: AsyncSession = Depends(get_db),
    super_admin=Depends(get_super_admin),

    _: bool = Depends(require_permission("create_role"))
    ):
    repo = PermissionRepository(db)
    perm = Permission(**data.model_dump())
    return await repo.create(perm)


@router.post("/users/assign-roles")
async def assign_roles_to_user(

    data: UserRoleAssign,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("assign_permissions"))
    ):
    from app.domain.models.user import user_roles
    await db.execute(user_roles.delete().where(user_roles.c.user_id == data.user_id))
    for role_id in data.role_ids:
        await db.execute(user_roles.insert().values(user_id=data.user_id, role_id=role_id))
    await db.flush()
    return {"message": "Roles assigned"}
