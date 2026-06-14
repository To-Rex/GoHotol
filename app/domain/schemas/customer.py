from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class CustomerCreate(BaseModel):
    company_id: int
    hotel_id: Optional[int] = None
    full_name: str = Field(..., max_length=255)
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    registration_type: str = "manual"


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    is_blacklisted: Optional[bool] = None
    is_active: Optional[bool] = None


class CustomerOut(BaseModel):
    id: int
    uuid: str
    company_id: int
    hotel_id: Optional[int] = None
    full_name: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    middle_name: Optional[str] = None
    nationality: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    photo_url: Optional[str] = None
    notes: Optional[str] = None
    registration_type: str
    is_blacklisted: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CustomerDocumentCreate(BaseModel):
    customer_id: int
    document_type: str
    document_number: Optional[str] = None
    issuing_country: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    document_image_url: Optional[str] = None


class CustomerDocumentOut(BaseModel):
    id: int
    uuid: str
    customer_id: int
    document_type: str
    document_number: Optional[str] = None
    issuing_country: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    document_image_url: Optional[str] = None
    is_verified: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
