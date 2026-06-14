from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, require_permission
from app.domain.schemas.room import (
    RoomCategoryCreate, RoomCategoryUpdate, RoomCategoryOut,
    RoomTypeCreate, RoomTypeOut,
    RoomFeatureCreate, RoomFeatureOut,
    RoomAmenityCreate, RoomAmenityOut,
    RoomPolicyCreate, RoomPolicyOut,
    RoomStatusCreate, RoomStatusOut,
    RoomCreate, RoomUpdate, RoomOut,
    RoomChecklistTemplateCreate, RoomChecklistItemCreate,
    RoomChecklistTemplateOut, RoomChecklistItemOut,
)
from app.domain.repositories.room import (
    RoomRepository, RoomCategoryRepository, RoomTypeRepository,
    RoomFeatureRepository, RoomAmenityRepository, RoomPolicyRepository,
    RoomStatusRepository, RoomChecklistTemplateRepository, RoomChecklistItemRepository,
)
from app.domain.models.room import (
    Room, RoomCategory, RoomType, RoomFeature, RoomAmenity,
    RoomPolicy, RoomStatus, RoomChecklistTemplate, RoomChecklistItem,
)

router = APIRouter(prefix="/rooms", tags=["Rooms"])
cat_router = APIRouter(prefix="/room-categories", tags=["Room Categories"])
type_router = APIRouter(prefix="/room-types", tags=["Room Types"])
feature_router = APIRouter(prefix="/room-features", tags=["Room Features"])
amenity_router = APIRouter(prefix="/room-amenities", tags=["Room Amenities"])
policy_router = APIRouter(prefix="/room-policies", tags=["Room Policies"])
status_router = APIRouter(prefix="/room-statuses", tags=["Room Statuses"])
checklist_router = APIRouter(prefix="/room-checklists", tags=["Room Checklists"])


@router.get("", response_model=List[RoomOut])
async def list_rooms(

    hotel_id: int = Query(...),
    floor_id: int | None = Query(None),
    category_id: int | None = Query(None),
    status_id: int | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_rooms"))
    ):
    repo = RoomRepository(db)
    filters = {"hotel_id": hotel_id, "is_active": True}
    if floor_id:
        filters["floor_id"] = floor_id
    if category_id:
        filters["category_id"] = category_id
    if status_id:
        filters["status_id"] = status_id
    return await repo.get_all(skip=skip, limit=limit, filters=filters)


@router.post("", response_model=RoomOut)
async def create_room(

    data: RoomCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("create_room"))
    ):
    repo = RoomRepository(db)
    room = Room(**data.model_dump())
    return await repo.create(room)


@router.get("/{room_id}", response_model=RoomOut)
async def get_room(
room_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_rooms"))
    ):
    repo = RoomRepository(db)
    room = await repo.get_by_id(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.put("/{room_id}", response_model=RoomOut)
async def update_room(
room_id: int, data: RoomUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("edit_room"))
    ):
    repo = RoomRepository(db)
    room = await repo.get_by_id(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(room, key, value)
    return await repo.update(room)


@router.delete("/{room_id}")
async def deactivate_room(
room_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("delete_room"))
    ):
    repo = RoomRepository(db)
    room = await repo.get_by_id(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    room.is_active = False
    await repo.update(room)
    return {"message": "Room deactivated"}


@cat_router.get("", response_model=List[RoomCategoryOut])
async def list_categories(

    company_id: int | None = Query(None),
    hotel_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_rooms"))
    ):
    repo = RoomCategoryRepository(db)
    filters = {}
    if company_id:
        filters["company_id"] = company_id
    if hotel_id:
        filters["hotel_id"] = hotel_id
    return await repo.get_all(filters=filters)


@cat_router.post("", response_model=RoomCategoryOut)
async def create_category(
data: RoomCategoryCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("create_room"))
    ):
    repo = RoomCategoryRepository(db)
    cat = RoomCategory(**data.model_dump())
    return await repo.create(cat)


@cat_router.put("/{category_id}", response_model=RoomCategoryOut)
async def update_category(
category_id: int, data: RoomCategoryUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("edit_room"))
    ):
    repo = RoomCategoryRepository(db)
    cat = await repo.get_by_id(category_id)
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(cat, key, value)
    return await repo.update(cat)


@type_router.get("", response_model=List[RoomTypeOut])
async def list_types(
company_id: int | None = Query(None), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_rooms"))
    ):
    repo = RoomTypeRepository(db)
    filters = {}
    if company_id:
        filters["company_id"] = company_id
    return await repo.get_all(filters=filters)


@type_router.post("", response_model=RoomTypeOut)
async def create_type(
data: RoomTypeCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("create_room"))
    ):
    repo = RoomTypeRepository(db)
    rt = RoomType(**data.model_dump())
    return await repo.create(rt)


@feature_router.get("", response_model=List[RoomFeatureOut])
async def list_features(
company_id: int | None = Query(None), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_rooms"))
    ):
    repo = RoomFeatureRepository(db)
    filters = {}
    if company_id:
        filters["company_id"] = company_id
    return await repo.get_all(filters=filters)


@feature_router.post("", response_model=RoomFeatureOut)
async def create_feature(
data: RoomFeatureCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("manage_room_features"))
    ):
    repo = RoomFeatureRepository(db)
    feature = RoomFeature(**data.model_dump())
    return await repo.create(feature)


@amenity_router.get("", response_model=List[RoomAmenityOut])
async def list_amenities(
company_id: int | None = Query(None), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_rooms"))
    ):
    repo = RoomAmenityRepository(db)
    filters = {"is_active": True}
    if company_id:
        filters["company_id"] = company_id
    return await repo.get_all(filters=filters)


@amenity_router.post("", response_model=RoomAmenityOut)
async def create_amenity(
data: RoomAmenityCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("manage_room_amenities"))
    ):
    repo = RoomAmenityRepository(db)
    amenity = RoomAmenity(**data.model_dump())
    return await repo.create(amenity)


@policy_router.get("", response_model=List[RoomPolicyOut])
async def list_policies(
company_id: int | None = Query(None), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_rooms"))
    ):
    repo = RoomPolicyRepository(db)
    filters = {"is_active": True}
    if company_id:
        filters["company_id"] = company_id
    return await repo.get_all(filters=filters)


@policy_router.post("", response_model=RoomPolicyOut)
async def create_policy(
data: RoomPolicyCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("manage_room_amenities"))
    ):
    repo = RoomPolicyRepository(db)
    policy = RoomPolicy(**data.model_dump())
    return await repo.create(policy)


@status_router.get("", response_model=List[RoomStatusOut])
async def list_statuses(
company_id: int | None = Query(None), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_rooms"))
    ):
    repo = RoomStatusRepository(db)
    filters = {"is_active": True}
    if company_id:
        filters["company_id"] = company_id
    return await repo.get_all(filters=filters)


@status_router.post("", response_model=RoomStatusOut)
async def create_status(
data: RoomStatusCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("manage_room_statuses"))
    ):
    repo = RoomStatusRepository(db)
    status = RoomStatus(**data.model_dump())
    return await repo.create(status)


@checklist_router.get("/templates", response_model=List[RoomChecklistTemplateOut])
async def list_checklist_templates(
company_id: int | None = Query(None), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_rooms"))
    ):
    repo = RoomChecklistTemplateRepository(db)
    filters = {"is_active": True}
    if company_id:
        filters["company_id"] = company_id
    return await repo.get_all(filters=filters)


@checklist_router.post("/templates", response_model=RoomChecklistTemplateOut)
async def create_checklist_template(
data: RoomChecklistTemplateCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("manage_room_amenities"))
    ):
    repo = RoomChecklistTemplateRepository(db)
    template = RoomChecklistTemplate(**data.model_dump())
    return await repo.create(template)


@checklist_router.post("/items", response_model=RoomChecklistItemOut)
async def create_checklist_item(
data: RoomChecklistItemCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("manage_room_amenities"))
    ):
    repo = RoomChecklistItemRepository(db)
    item = RoomChecklistItem(**data.model_dump())
    return await repo.create(item)
