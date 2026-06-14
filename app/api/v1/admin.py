from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, get_super_admin, require_permission
from app.domain.repositories.misc import AuditLogRepository, SystemSettingRepository, NotificationRepository
from app.domain.repositories.user import UserRepository
from app.domain.models.misc import SystemSetting
from app.domain.services.misc import AuditService, NotificationService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/audit-logs")
async def get_audit_logs(

    company_id: int | None = Query(None),
    entity_type: str | None = Query(None),
    action: str | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    super_admin=Depends(get_super_admin),

    _: bool = Depends(require_permission("view_reports"))
    ):
    repo = AuditLogRepository(db)
    filters = {}
    if company_id:
        filters["company_id"] = company_id
    if entity_type:
        filters["entity_type"] = entity_type
    if action:
        filters["action"] = action
    logs = await repo.get_all(skip=skip, limit=limit, filters=filters)
    return [
        {
            "id": log.id,
            "uuid": log.uuid,
            "action": log.action,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "user_id": log.user_id,
            "company_id": log.company_id,
            "old_values": log.old_values,
            "new_values": log.new_values,
            "ip_address": log.ip_address,
            "details": log.details,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]


@router.get("/settings")
async def get_settings(

    company_id: int | None = Query(None),
    hotel_id: int | None = Query(None),
    key: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_reports"))
    ):
    repo = SystemSettingRepository(db)
    filters = {"is_active": True}
    if company_id is not None:
        filters["company_id"] = company_id
    if hotel_id is not None:
        filters["hotel_id"] = hotel_id
    settings = await repo.get_all(filters=filters)
    if key:
        settings = [s for s in settings if s.key == key]
    return [
        {"id": s.id, "uuid": s.uuid, "key": s.key, "value": s.value, "description": s.description}
        for s in settings
    ]


@router.post("/settings")
async def create_setting(

    key: str = Query(...),
    value: str = Query(...),
    company_id: int | None = Query(None),
    hotel_id: int | None = Query(None),
    description: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("manage_settings"))
    ):
    import json
    repo = SystemSettingRepository(db)
    try:
        parsed_value = json.loads(value)
    except json.JSONDecodeError:
        parsed_value = {"value": value}

    setting = SystemSetting(
        key=key,
        value=parsed_value,
        company_id=company_id,
        hotel_id=hotel_id,
        description=description,
    )
    await repo.create(setting)
    return {"message": "Setting created", "id": setting.id}


@router.get("/users")
async def list_all_users(

    company_id: int | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    super_admin=Depends(get_super_admin),

    _: bool = Depends(require_permission("view_users"))
    ):
    repo = UserRepository(db)
    filters = {}
    if company_id:
        filters["company_id"] = company_id
    users = await repo.get_all(skip=skip, limit=limit, filters=filters)
    return [
        {
            "id": u.id,
            "uuid": u.uuid,
            "username": u.username,
            "email": u.email,
            "full_name": u.full_name,
            "company_id": u.company_id,
            "hotel_id": u.hotel_id,
            "branch_id": u.branch_id,
            "phone": u.phone,
            "is_super_admin": u.is_super_admin,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.put("/users/{user_id}")
async def update_user(

    user_id: int,
    data: dict,
    db: AsyncSession = Depends(get_db),
    super_admin=Depends(get_super_admin),

    _: bool = Depends(require_permission("edit_user"))
    ):
    from app.core.security import hash_password

    repo = UserRepository(db)
    user = await repo.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if "password" in data and data["password"]:
        user.hashed_password = hash_password(data.pop("password"))

    for key, value in data.items():
        if hasattr(user, key) and value is not None:
            setattr(user, key, value)
    await repo.update(user)
    return {"message": "User updated"}


@router.get("/notifications")
async def get_notifications(

    user_id: int = Query(...),
    is_read: bool | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_reports"))
    ):
    repo = NotificationRepository(db)
    filters = {"user_id": user_id}
    if is_read is not None:
        filters["is_read"] = is_read
    notifications = await repo.get_all(skip=skip, limit=limit, filters=filters)
    return [
        {
            "id": n.id,
            "title": n.title,
            "message": n.message,
            "notification_type": n.notification_type,
            "is_read": n.is_read,
            "created_at": n.created_at.isoformat() if n.created_at else None,
        }
        for n in notifications
    ]
