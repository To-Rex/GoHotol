import uuid
from decimal import Decimal
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Integer, Text, DateTime, ForeignKey, Numeric, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.domain.models.base import TimestampMixin


class ServiceCategory(Base, TimestampMixin):
    __tablename__ = "service_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    services: Mapped[list["Service"]] = relationship("Service", back_populates="category", lazy="selectin")


class Service(Base, TimestampMixin):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    hotel_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=True, index=True)
    category_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("service_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    tax_rate: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    category: Mapped["ServiceCategory | None"] = relationship("ServiceCategory", back_populates="services")
    booking_services: Mapped[list["BookingService"]] = relationship("BookingService", back_populates="service", lazy="selectin")
