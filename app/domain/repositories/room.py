from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.models.room import (
    Room, RoomCategory, RoomType, RoomFeature, RoomAmenity,
    RoomPolicy, RoomStatus, RoomChecklistTemplate, RoomChecklistItem,
)
from app.domain.repositories.base import BaseRepository


class RoomRepository(BaseRepository[Room]):
    model = Room


class RoomCategoryRepository(BaseRepository[RoomCategory]):
    model = RoomCategory


class RoomTypeRepository(BaseRepository[RoomType]):
    model = RoomType


class RoomFeatureRepository(BaseRepository[RoomFeature]):
    model = RoomFeature


class RoomAmenityRepository(BaseRepository[RoomAmenity]):
    model = RoomAmenity


class RoomPolicyRepository(BaseRepository[RoomPolicy]):
    model = RoomPolicy


class RoomStatusRepository(BaseRepository[RoomStatus]):
    model = RoomStatus


class RoomChecklistTemplateRepository(BaseRepository[RoomChecklistTemplate]):
    model = RoomChecklistTemplate


class RoomChecklistItemRepository(BaseRepository[RoomChecklistItem]):
    model = RoomChecklistItem
