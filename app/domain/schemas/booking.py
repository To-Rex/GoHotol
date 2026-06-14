from datetime import datetime, date
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class BookingStatusCreate(BaseModel):
    company_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    is_default: bool = False


class BookingCreate(BaseModel):
    company_id: int
    hotel_id: int
    branch_id: Optional[int] = None
    customer_id: int
    status_id: Optional[int] = None
    booking_type: str = "reservation"
    group_name: Optional[str] = None
    check_in_date: date
    check_out_date: date
    guest_count: int = 1
    special_requests: Optional[str] = None
    notes: Optional[str] = None
    is_group_booking: bool = False
    currency: str = "UZS"
    room_ids: list[int] = []
    service_item_ids: Optional[list[dict]] = None


class BookingUpdate(BaseModel):
    status_id: Optional[int] = None
    check_in_date: Optional[date] = None
    check_out_date: Optional[date] = None
    guest_count: Optional[int] = None
    special_requests: Optional[str] = None
    notes: Optional[str] = None


class BookingRoomOut(BaseModel):
    id: int
    booking_id: int
    room_id: int
    room_rate: Decimal
    extra_bed: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BookingServiceOut(BaseModel):
    id: int
    booking_id: int
    service_id: int
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class BookingOut(BaseModel):
    id: int
    uuid: str
    booking_number: str
    company_id: int
    hotel_id: int
    branch_id: Optional[int] = None
    customer_id: int
    status_id: Optional[int] = None
    booking_type: str
    group_name: Optional[str] = None
    check_in_date: date
    check_out_date: date
    actual_check_in: Optional[datetime] = None
    actual_check_out: Optional[datetime] = None
    guest_count: int
    special_requests: Optional[str] = None
    notes: Optional[str] = None
    is_group_booking: bool
    total_amount: Decimal
    paid_amount: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    currency: str
    created_by_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CheckInRequest(BaseModel):
    booking_id: int
    payment_method_id: int
    amount: Decimal


class CheckOutRequest(BaseModel):
    booking_id: int
    additional_charges: Optional[list[dict]] = None


class BookingServiceAdd(BaseModel):
    booking_id: int
    service_id: int
    quantity: int = 1
    notes: Optional[str] = None
