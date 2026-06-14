import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, Integer, Integer, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.domain.models.base import TimestampMixin


class CleaningTask(Base, TimestampMixin):
    __tablename__ = "cleaning_tasks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    task_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    hotel_id: Mapped[int] = mapped_column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False, index=True)
    room_id: Mapped[int] = mapped_column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    assigned_to_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(50), default="new")
    priority: Mapped[str] = mapped_column(String(20), default="normal")
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    photos: Mapped[list | None] = mapped_column(JSON, nullable=True)
    checklist_results: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    assigned_to: Mapped["User | None"] = relationship("User", foreign_keys=[assigned_to_id])
