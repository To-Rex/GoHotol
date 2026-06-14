import uuid
from datetime import date
from sqlalchemy import String, Boolean, Integer, Integer, Text, Date, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.domain.models.base import TimestampMixin


class Customer(Base, TimestampMixin):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    hotel_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("hotels.id", ondelete="SET NULL"), nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    middle_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    nationality: Mapped[str | None] = mapped_column(String(100), nullable=True)
    date_of_birth: Mapped[date | None] = mapped_column(Date, nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    registration_type: Mapped[str] = mapped_column(String(50), default="manual")
    is_blacklisted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    documents: Mapped[list["CustomerDocument"]] = relationship("CustomerDocument", back_populates="customer", lazy="selectin")
    bookings: Mapped[list["Booking"]] = relationship("Booking", back_populates="customer", lazy="selectin")


class CustomerDocument(Base, TimestampMixin):
    __tablename__ = "customer_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type: Mapped[str] = mapped_column(String(50), nullable=False)
    document_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    issuing_country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    issue_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    expiry_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    document_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    customer: Mapped["Customer"] = relationship("Customer", back_populates="documents")
