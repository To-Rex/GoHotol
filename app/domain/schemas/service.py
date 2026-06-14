from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class ServiceCategoryCreate(BaseModel):
    company_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None


class ServiceCategoryOut(BaseModel):
    id: int
    uuid: str
    company_id: Optional[int] = None
    name: str
    slug: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ServiceCreate(BaseModel):
    company_id: Optional[int] = None
    hotel_id: Optional[int] = None
    category_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None
    price: Decimal = Decimal("0")
    tax_rate: Decimal = Decimal("0")


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = None
    is_active: Optional[bool] = None


class ServiceOut(BaseModel):
    id: int
    uuid: str
    company_id: Optional[int] = None
    hotel_id: Optional[int] = None
    category_id: Optional[int] = None
    name: str
    slug: str
    description: Optional[str] = None
    price: Decimal
    tax_rate: Decimal
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaymentMethodCreate(BaseModel):
    company_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    slug: str = Field(..., max_length=100)
    description: Optional[str] = None


class PaymentMethodOut(BaseModel):
    id: int
    uuid: str
    name: str
    slug: str
    description: Optional[str] = None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PaymentCreate(BaseModel):
    company_id: int
    booking_id: int
    invoice_id: Optional[int] = None
    payment_method_id: int
    amount: Decimal
    currency: str = "UZS"
    transaction_id: Optional[str] = None
    notes: Optional[str] = None
    status: str = "completed"


class PaymentOut(BaseModel):
    id: int
    uuid: str
    payment_number: str
    company_id: int
    booking_id: int
    invoice_id: Optional[int] = None
    payment_method_id: int
    amount: Decimal
    currency: str
    transaction_id: Optional[str] = None
    paid_at: datetime
    notes: Optional[str] = None
    status: str
    receipt_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class InvoiceCreate(BaseModel):
    company_id: int
    booking_id: int
    customer_id: int
    invoice_type: str = "standard"
    currency: str = "UZS"
    notes: Optional[str] = None


class InvoiceItemCreate(BaseModel):
    invoice_id: int
    description: str
    quantity: int = 1
    unit_price: Decimal
    tax_rate: Decimal = Decimal("0")


class InvoiceOut(BaseModel):
    id: int
    uuid: str
    invoice_number: str
    company_id: int
    booking_id: int
    customer_id: int
    invoice_type: str
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    paid_amount: Decimal
    balance_due: Decimal
    currency: str
    issued_at: datetime
    due_at: Optional[datetime] = None
    pdf_url: Optional[str] = None
    notes: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
