from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    username: str
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., min_length=1, max_length=255)
    phone: Optional[str] = None
    company_id: Optional[int] = None
    hotel_id: Optional[int] = None
    branch_id: Optional[int] = None
    is_super_admin: bool = False


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    hotel_id: Optional[int] = None
    branch_id: Optional[int] = None
    is_active: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    uuid: str
    username: str
    email: str
    full_name: str
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    company_id: Optional[int] = None
    hotel_id: Optional[int] = None
    branch_id: Optional[int] = None
    is_super_admin: bool
    is_active: bool
    is_verified: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CompanyCreate(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    timezone: str = "UTC"
    subscription_plan: Optional[str] = None


class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    is_active: Optional[bool] = None
    subscription_plan: Optional[str] = None


class CompanyOut(BaseModel):
    id: int
    uuid: str
    name: str
    slug: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    timezone: str
    is_active: bool
    subscription_plan: Optional[str] = None
    subscription_expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class HotelCreate(BaseModel):
    company_id: int
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    star_rating: Optional[int] = None
    check_in_time: str = "14:00"
    check_out_time: str = "12:00"
    timezone: str = "UTC"


class HotelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    is_active: Optional[bool] = None
    star_rating: Optional[int] = None


class HotelOut(BaseModel):
    id: int
    uuid: str
    company_id: int
    name: str
    slug: str
    description: Optional[str] = None
    logo_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    city: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    star_rating: Optional[int] = None
    check_in_time: str
    check_out_time: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BranchCreate(BaseModel):
    hotel_id: int
    name: str = Field(..., max_length=255)
    address: Optional[str] = None
    contact_numbers: Optional[list] = None
    email: Optional[EmailStr] = None
    working_hours_start: Optional[str] = None
    working_hours_end: Optional[str] = None
    manager_id: Optional[int] = None
    description: Optional[str] = None


class BranchUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    contact_numbers: Optional[list] = None
    email: Optional[EmailStr] = None
    working_hours_start: Optional[str] = None
    working_hours_end: Optional[str] = None
    manager_id: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class BranchOut(BaseModel):
    id: int
    uuid: str
    hotel_id: int
    name: str
    address: Optional[str] = None
    contact_numbers: Optional[list] = None
    email: Optional[str] = None
    working_hours_start: Optional[str] = None
    working_hours_end: Optional[str] = None
    manager_id: Optional[int] = None
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BuildingCreate(BaseModel):
    hotel_id: int
    name: str = Field(..., max_length=255)
    description: Optional[str] = None


class BuildingOut(BaseModel):
    id: int
    uuid: str
    hotel_id: int
    name: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FloorCreate(BaseModel):
    building_id: int
    number: str
    name: Optional[str] = None
    description: Optional[str] = None


class FloorOut(BaseModel):
    id: int
    uuid: str
    building_id: int
    number: str
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
