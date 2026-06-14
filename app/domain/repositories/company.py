from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.models.company import Company, Hotel, Branch, Building, Floor
from app.domain.repositories.base import BaseRepository


class CompanyRepository(BaseRepository[Company]):
    model = Company

    async def get_by_slug(self, slug: str) -> Company | None:
        from sqlalchemy import select
        result = await self.session.execute(
            select(Company).where(Company.slug == slug)
        )
        return result.scalar_one_or_none()


class HotelRepository(BaseRepository[Hotel]):
    model = Hotel

    async def get_by_slug(self, slug: str) -> Hotel | None:
        from sqlalchemy import select
        result = await self.session.execute(
            select(Hotel).where(Hotel.slug == slug)
        )
        return result.scalar_one_or_none()


class BranchRepository(BaseRepository[Branch]):
    model = Branch


class BuildingRepository(BaseRepository[Building]):
    model = Building


class FloorRepository(BaseRepository[Floor]):
    model = Floor
