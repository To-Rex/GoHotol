from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class RoleCreate(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    company_id: Optional[int] = None
    is_system: bool = False


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class RoleOut(BaseModel):
    id: int
    uuid: str
    company_id: Optional[int] = None
    name: str
    slug: str
    description: Optional[str] = None
    is_system: bool
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PermissionCreate(BaseModel):
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    module: str = Field(..., max_length=100)
    description: Optional[str] = None


class PermissionOut(BaseModel):
    id: int
    uuid: str
    name: str
    slug: str
    module: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RolePermissionAssign(BaseModel):
    role_id: int
    permission_ids: list[int]


class UserRoleAssign(BaseModel):
    user_id: int
    role_ids: list[int]
