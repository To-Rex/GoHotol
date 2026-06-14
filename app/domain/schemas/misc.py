from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class CleaningTaskCreate(BaseModel):
    company_id: int
    hotel_id: int
    room_id: int
    booking_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    priority: str = "normal"


class CleaningTaskUpdate(BaseModel):
    status: Optional[str] = None
    assigned_to_id: Optional[int] = None
    priority: Optional[str] = None
    notes: Optional[str] = None
    photos: Optional[list] = None
    checklist_results: Optional[dict] = None


class CleaningTaskOut(BaseModel):
    id: int
    uuid: str
    task_number: str
    company_id: int
    hotel_id: int
    room_id: int
    booking_id: Optional[int] = None
    assigned_to_id: Optional[int] = None
    status: str
    priority: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    notes: Optional[str] = None
    photos: Optional[list] = None
    checklist_results: Optional[dict] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EmployeeCreate(BaseModel):
    company_id: int
    user_id: Optional[int] = None
    hotel_id: Optional[int] = None
    branch_id: Optional[int] = None
    full_name: str = Field(..., max_length=255)
    position: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    salary: Optional[dict] = None
    status: str = "active"
    joined_at: Optional[str] = None
    notes: Optional[str] = None


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    position: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    salary: Optional[dict] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class EmployeeOut(BaseModel):
    id: int
    uuid: str
    company_id: int
    user_id: Optional[int] = None
    hotel_id: Optional[int] = None
    branch_id: Optional[int] = None
    full_name: str
    position: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    salary: Optional[dict] = None
    status: str
    joined_at: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
