import uuid
from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import String, Boolean, Integer, Integer, Text, Date, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.domain.models.base import TimestampMixin


class BookingStatus(Base, TimestampMixin):
    __tablename__ = "booking_statuses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Booking(Base, TimestampMixin):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    booking_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    hotel_id: Mapped[int] = mapped_column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True)
    branch_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id", ondelete="RESTRICT"), nullable=False, index=True)
    status_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("booking_statuses.id", ondelete="SET NULL"), nullable=True, index=True)
    booking_type: Mapped[str] = mapped_column(String(50), default="reservation")
    group_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    check_in_date: Mapped[date] = mapped_column(Date, nullable=False)
    check_out_date: Mapped[date] = mapped_column(Date, nullable=False)
    actual_check_in: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    actual_check_out: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    guest_count: Mapped[int] = mapped_column(Integer, default=1)
    special_requests: Mapped[str | None] = mapped_column(Text, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_group_booking: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    tax_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    discount_amount: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    currency: Mapped[str] = mapped_column(String(10), default="UZS")
    created_by_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="bookings")
    status: Mapped["BookingStatus | None"] = relationship("BookingStatus")
    rooms: Mapped[list["BookingRoom"]] = relationship("BookingRoom", back_populates="booking", lazy="selectin")
    services: Mapped[list["BookingService"]] = relationship("BookingService", back_populates="booking", lazy="selectin")
    payments: Mapped[list["Payment"]] = relationship("Payment", back_populates="booking", lazy="selectin")
    invoices: Mapped[list["Invoice"]] = relationship("Invoice", back_populates="booking", lazy="selectin")


class BookingRoom(Base, TimestampMixin):
    __tablename__ = "booking_rooms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    booking_id: Mapped[int] = mapped_column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    room_id: Mapped[int] = mapped_column(Integer, ForeignKey("rooms.id", ondelete="RESTRICT"), nullable=False, index=True)
    room_rate: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    extra_bed: Mapped[bool] = mapped_column(Boolean, default=False)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="rooms")
    room: Mapped["Room"] = relationship("Room", back_populates="bookings")


class BookingService(Base, TimestampMixin):
    __tablename__ = "booking_services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    booking_id: Mapped[int] = mapped_column(Integer, ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id: Mapped[int] = mapped_column(Integer, ForeignKey("services.id", ondelete="RESTRICT"), nullable=False, index=True)
    quantity: Mapped[int] = mapped_column(Integer, default=1)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    total_price: Mapped[Decimal] = mapped_column(Numeric(14, 2), default=0, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    booking: Mapped["Booking"] = relationship("Booking", back_populates="services")
    service: Mapped["Service"] = relationship("Service", back_populates="booking_services")
