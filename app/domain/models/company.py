import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.domain.models.base import TimestampMixin


class Company(Base, TimestampMixin):
    __tablename__ = "companies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    website: Mapped[str | None] = mapped_column(String(255), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    timezone: Mapped[str] = mapped_column(String(100), default="UTC")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    subscription_plan: Mapped[str | None] = mapped_column(String(100), nullable=True)
    subscription_expires_at: Mapped[datetime | None] = mapped_column(nullable=True)
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    hotels: Mapped[list["Hotel"]] = relationship("Hotel", back_populates="company", lazy="selectin")
    users: Mapped[list["User"]] = relationship("User", back_populates="company", lazy="selectin")


class Hotel(Base, TimestampMixin):
    __tablename__ = "hotels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    logo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    country: Mapped[str | None] = mapped_column(String(100), nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    latitude: Mapped[float | None] = mapped_column(nullable=True)
    longitude: Mapped[float | None] = mapped_column(nullable=True)
    star_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    check_in_time: Mapped[str] = mapped_column(String(10), default="14:00")
    check_out_time: Mapped[str] = mapped_column(String(10), default="12:00")
    timezone: Mapped[str] = mapped_column(String(100), default="UTC")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    company: Mapped["Company"] = relationship("Company", back_populates="hotels")
    branches: Mapped[list["Branch"]] = relationship("Branch", back_populates="hotel", lazy="selectin")
    buildings: Mapped[list["Building"]] = relationship("Building", back_populates="hotel", lazy="selectin")
    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="hotel", lazy="selectin")


class Branch(Base, TimestampMixin):
    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    hotel_id: Mapped[int] = mapped_column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    contact_numbers: Mapped[list | None] = mapped_column(JSON, nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    working_hours_start: Mapped[str | None] = mapped_column(String(10), nullable=True)
    working_hours_end: Mapped[str | None] = mapped_column(String(10), nullable=True)
    manager_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="branches")
    manager: Mapped["User | None"] = relationship("User", foreign_keys=[manager_id])


class Building(Base, TimestampMixin):
    __tablename__ = "buildings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    hotel_id: Mapped[int] = mapped_column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="buildings")
    floors: Mapped[list["Floor"]] = relationship("Floor", back_populates="building", lazy="selectin")


class Floor(Base, TimestampMixin):
    __tablename__ = "floors"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    building_id: Mapped[int] = mapped_column(Integer, ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False, index=True)
    number: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    building: Mapped["Building"] = relationship("Building", back_populates="floors")
    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="floor", lazy="selectin")
