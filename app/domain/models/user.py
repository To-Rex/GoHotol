import uuid
from sqlalchemy import String, Boolean, Integer, Integer, Text, ForeignKey, Table, Column, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.domain.models.base import TimestampMixin

user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)

role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="SET NULL"), nullable=True, index=True)
    hotel_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("hotels.id", ondelete="SET NULL"), nullable=True, index=True)
    branch_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("branches.id", ondelete="SET NULL"), nullable=True, index=True)
    username: Mapped[str] = mapped_column(String(150), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    is_super_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    last_login_at: Mapped[str | None] = mapped_column(nullable=True)
    refresh_token: Mapped[str | None] = mapped_column(String(500), nullable=True)
    settings: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    company: Mapped["Company | None"] = relationship("Company", back_populates="users", foreign_keys=[company_id])
    roles: Mapped[list["Role"]] = relationship("Role", secondary=user_roles, back_populates="users", lazy="selectin")


class Role(Base, TimestampMixin):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    company_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("companies.id", ondelete="CASCADE"), nullable=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    users: Mapped[list["User"]] = relationship("User", secondary=user_roles, back_populates="roles", lazy="selectin")
    permissions: Mapped[list["Permission"]] = relationship("Permission", secondary=role_permissions, back_populates="roles", lazy="selectin")


class Permission(Base, TimestampMixin):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    uuid: Mapped[str] = mapped_column(String(36), default=lambda: str(uuid.uuid4()), unique=True, nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    module: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    roles: Mapped[list["Role"]] = relationship("Role", secondary=role_permissions, back_populates="permissions", lazy="selectin")
