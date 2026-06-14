import uuid
from decimal import Decimal
from sqlalchemy import String, Boolean, Integer, Integer, Text, Float, ForeignKey, JSON, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.domain.models.base import TimestampMixin

room_features = None
room_amenities = None


class RoomCategory(Base, TimestampMixin):
    __tablename__ = "room_categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    hotel_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    base_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    max_guests: Mapped[int] = mapped_column(Integer, default=2)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    room_types: Mapped[list["RoomType"]] = relationship("RoomType", back_populates="category", lazy="selectin")
    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="category", lazy="selectin")


class RoomType(Base, TimestampMixin):
    __tablename__ = "room_types"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    category_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("room_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    price_modifier: Mapped[Decimal] = mapped_column(Numeric(5, 2), default=1.00)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    category: Mapped["RoomCategory | None"] = relationship("RoomCategory", back_populates="room_types")
    rooms: Mapped[list["Room"]] = relationship("Room", back_populates="room_type", lazy="selectin")


class RoomFeature(Base, TimestampMixin):
    __tablename__ = "room_features"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    icon: Mapped[str | None] = mapped_column(String(100), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class RoomAmenity(Base, TimestampMixin):
    __tablename__ = "room_amenities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class RoomPolicy(Base, TimestampMixin):
    __tablename__ = "room_policies"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class RoomStatus(Base, TimestampMixin):
    __tablename__ = "room_statuses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False)
    color: Mapped[str] = mapped_column(String(20), default="#808080")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Room(Base, TimestampMixin):
    __tablename__ = "rooms"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    hotel_id: Mapped[int] = mapped_column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True)
    floor_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("floors.id", ondelete="SET NULL"), nullable=True, index=True)
    category_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("room_categories.id", ondelete="SET NULL"), nullable=True, index=True)
    room_type_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("room_types.id", ondelete="SET NULL"), nullable=True, index=True)
    status_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("room_statuses.id", ondelete="SET NULL"), nullable=True, index=True)
    room_number: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    base_price: Mapped[Decimal] = mapped_column(Numeric(12, 2), default=0, nullable=False)
    size_sqm: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_guests: Mapped[int] = mapped_column(Integer, default=2)
    bed_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    bed_count: Mapped[int] = mapped_column(Integer, default=1)
    floor_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    phone_extension: Mapped[str | None] = mapped_column(String(20), nullable=True)
    feature_ids: Mapped[list | None] = mapped_column(JSON, nullable=True)
    amenity_ids: Mapped[list | None] = mapped_column(JSON, nullable=True)
    policy_ids: Mapped[list | None] = mapped_column(JSON, nullable=True)
    photos: Mapped[list | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    hotel: Mapped["Hotel"] = relationship("Hotel", back_populates="rooms")
    floor: Mapped["Floor | None"] = relationship("Floor", back_populates="rooms")
    category: Mapped["RoomCategory | None"] = relationship("RoomCategory", back_populates="rooms")
    room_type: Mapped["RoomType | None"] = relationship("RoomType", back_populates="rooms")
    status: Mapped["RoomStatus | None"] = relationship("RoomStatus")
    bookings: Mapped[list["BookingRoom"]] = relationship("BookingRoom", back_populates="room", lazy="selectin")


class RoomChecklistTemplate(Base, TimestampMixin):
    __tablename__ = "room_checklist_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    room_category_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("room_categories.id", ondelete="SET NULL"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    items: Mapped[list["RoomChecklistItem"]] = relationship("RoomChecklistItem", back_populates="template", lazy="selectin")


class RoomChecklistItem(Base, TimestampMixin):
    __tablename__ = "room_checklist_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    template_id: Mapped[int] = mapped_column(Integer, ForeignKey("room_checklist_templates.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    template: Mapped["RoomChecklistTemplate"] = relationship("RoomChecklistTemplate", back_populates="items")
