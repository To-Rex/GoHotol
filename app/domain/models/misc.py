import uuid
from sqlalchemy import String, Boolean, Integer, Integer, Text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.domain.models.base import TimestampMixin


class Employee(Base, TimestampMixin):
    __tablename__ = "employees"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    hotel_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("hotels.id", ondelete="SET NULL"), nullable=True, index=True)
    branch_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    position: Mapped[str | None] = mapped_column(String(255), nullable=True)
    department: Mapped[str | None] = mapped_column(String(255), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    salary: Mapped[str | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active")
    joined_at: Mapped[str | None] = mapped_column(nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class SystemSetting(Base, TimestampMixin):
    __tablename__ = "system_settings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    hotel_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=True, index=True)
    key: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    value: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
