import uuid
from decimal import Decimal
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Integer, Text, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.domain.models.base import TimestampMixin


class PaymentMethod(Base, TimestampMixin):
    __tablename__ = "payment_methods"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="payment_method", lazy="selectin")


class Payment(Base, TimestampMixin):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    payment_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id: Mapped[int] = mapped_column(Integer, ForeignKey("bookings.id", ondelete="RESTRICT"), nullable=False, index=True)
    invoice_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True)
    payment_method_id: Mapped[int] = mapped_column(Integer, ForeignKey("payment_methods.id", ondelete="RESTRICT"), nullable=False, index=True)
    amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="UZS")
    exchange_rate: Mapped[Decimal] = mapped_column(Numeric(10, 4), default=1.0000)
    transaction_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    paid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="completed")
    receipt_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_by_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="payments")
    payment_method: Mapped["PaymentMethod"] = relationship("PaymentMethod", back_populates="payments")
    invoice: Mapped["Invoice | None"] = relationship("Invoice", back_populates="payments")


class Invoice(Base, TimestampMixin):
    __tablename__ = "invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    invoice_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id: Mapped[int] = mapped_column(Integer, ForeignKey("bookings.id", ondelete="RESTRICT"), nullable=False, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False)
    invoice_type: Mapped[str] = mapped_column(String(50), default="standard")
    subtotal: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    balance_due: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="UZS")
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    pdf_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="issued")
    created_by_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="invoices")
    items: Mapped[list["InvoiceItem"]] = relationship("InvoiceItem", back_populates="invoice", lazy="selectin")
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="invoice", lazy="selectin")


class InvoiceItem(Base, TimestampMixin):
    __tablename__ = "invoice_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    invoice_id: Mapped[int] = mapped_column(Integer, ForeignKey("invoices.id", ondelete="CASCADE"), nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0)

    invoice: Mapped["Invoice"] = relationship("Invoice", back_populates="items")
