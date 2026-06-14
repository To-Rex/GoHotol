from typing import TypeVar, Generic, Optional, Sequence, Any
from sqlalchemy import select, func, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import Base

T = TypeVar("T", bound=Base)


class BaseRepository(Generic[T]):
    model: type[T]

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, id: int) -> Optional[T]:
        result = await self.session.execute(
            select(self.model).where(self.model.id == id)
        )
        return result.scalar_one_or_none()

    async def get_by_uuid(self, uuid: str) -> Optional[T]:
        result = await self.session.execute(
            select(self.model).where(self.model.uuid == uuid)
        )
        return result.scalar_one_or_none()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[dict] = None,
    ) -> Sequence[T]:
        query = select(self.model)
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.where(getattr(self.model, key) == value)
        query = query.offset(skip).limit(limit).order_by(self.model.id.desc())
        result = await self.session.execute(query)
        return result.scalars().all()

    async def count(self, filters: Optional[dict] = None) -> int:
        query = select(func.count(self.model.id))
        if filters:
            for key, value in filters.items():
                if hasattr(self.model, key):
                    query = query.where(getattr(self.model, key) == value)
        result = await self.session.execute(query)
        return result.scalar() or 0

    async def create(self, obj: T) -> T:
        self.session.add(obj)
        await self.session.flush()
        return obj

    async def create_all(self, objects: list[T]) -> list[T]:
        self.session.add_all(objects)
        await self.session.flush()
        return objects

    async def update(self, obj: T) -> T:
        await self.session.flush()
        await self.session.refresh(obj)
        return obj

    async def delete(self, obj: T) -> None:
        await self.session.delete(obj)
        await self.session.flush()

    async def soft_delete(self, id: int) -> None:
        await self.session.execute(
            update(self.model).where(self.model.id == id).values(deleted_at=func.now())
        )
        await self.session.flush()
