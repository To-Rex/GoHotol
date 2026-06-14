from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class RoomCategoryCreate(BaseModel):
    company_id: Optional[int] = None
    hotel_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    base_price: Decimal = Decimal("0")
    max_guests: int = 2


class RoomCategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Optional[Decimal] = None
    max_guests: Optional[int] = None
    is_active: Optional[bool] = None


class RoomCategoryOut(BaseModel):
    id: int
    uuid: str
    company_id: Optional[int] = None
    hotel_id: Optional[int] = None
    name: str
    slug: str
    description: Optional[str] = None
    base_price: Decimal
    max_guests: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RoomTypeCreate(BaseModel):
    category_id: Optional[int] = None
    company_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    price_modifier: Decimal = Decimal("1.00")


class RoomTypeOut(BaseModel):
    id: int
    uuid: str
    category_id: Optional[int] = None
    company_id: Optional[int] = None
    name: str
    slug: str
    description: Optional[str] = None
    price_modifier: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RoomFeatureCreate(BaseModel):
    company_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    icon: Optional[str] = None
    description: Optional[str] = None


class RoomFeatureOut(BaseModel):
    id: int
    uuid: str
    company_id: Optional[int] = None
    name: str
    slug: str
    icon: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RoomAmenityCreate(BaseModel):
    company_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None


class RoomAmenityOut(BaseModel):
    id: int
    uuid: str
    name: str
    slug: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RoomPolicyCreate(BaseModel):
    company_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    description: Optional[str] = None


class RoomPolicyOut(BaseModel):
    id: int
    uuid: str
    name: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RoomStatusCreate(BaseModel):
    company_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    color: str = "#808080"
    description: Optional[str] = None
    is_default: bool = False


class RoomStatusOut(BaseModel):
    id: int
    uuid: str
    name: str
    slug: str
    color: str
    description: Optional[str] = None
    is_default: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RoomCreate(BaseModel):
    hotel_id: int
    floor_id: Optional[int] = None
    category_id: Optional[int] = None
    room_type_id: Optional[int] = None
    status_id: Optional[int] = None
    room_number: str = Field(..., max_length=50)
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Decimal = Decimal("0")
    size_sqm: Optional[float] = None
    max_guests: int = 2
    bed_type: Optional[str] = None
    bed_count: int = 1
    floor_number: Optional[int] = None
    phone_extension: Optional[str] = None
    feature_ids: Optional[list] = None
    amenity_ids: Optional[list] = None
    policy_ids: Optional[list] = None
    photos: Optional[list] = None


class RoomUpdate(BaseModel):
    room_number: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    room_type_id: Optional[int] = None
    status_id: Optional[int] = None
    base_price: Optional[Decimal] = None
    size_sqm: Optional[float] = None
    max_guests: Optional[int] = None
    bed_type: Optional[str] = None
    bed_count: Optional[int] = None
    feature_ids: Optional[list] = None
    amenity_ids: Optional[list] = None
    policy_ids: Optional[list] = None
    photos: Optional[list] = None
    is_active: Optional[bool] = None


class RoomOut(BaseModel):
    id: int
    uuid: str
    hotel_id: int
    floor_id: Optional[int] = None
    category_id: Optional[int] = None
    room_type_id: Optional[int] = None
    status_id: Optional[int] = None
    room_number: str
    name: Optional[str] = None
    description: Optional[str] = None
    base_price: Decimal
    size_sqm: Optional[float] = None
    max_guests: int
    bed_type: Optional[str] = None
    bed_count: int
    floor_number: Optional[int] = None
    phone_extension: Optional[str] = None
    feature_ids: Optional[list] = None
    amenity_ids: Optional[list] = None
    policy_ids: Optional[list] = None
    photos: Optional[list] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RoomChecklistTemplateCreate(BaseModel):
    company_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    room_category_id: Optional[int] = None


class RoomChecklistItemCreate(BaseModel):
    template_id: int
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    sort_order: int = 0
    is_required: bool = True


class RoomChecklistTemplateOut(BaseModel):
    id: int
    uuid: str
    name: str
    description: Optional[str] = None
    room_category_id: Optional[int] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RoomChecklistItemOut(BaseModel):
    id: int
    uuid: str
    template_id: int
    name: str
    description: Optional[str] = None
    sort_order: int
    is_required: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
