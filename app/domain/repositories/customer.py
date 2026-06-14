from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.models.customer import Customer, CustomerDocument
from app.domain.repositories.base import BaseRepository


class CustomerRepository(BaseRepository[Customer]):
    model = Customer


class CustomerDocumentRepository(BaseRepository[CustomerDocument]):
    model = CustomerDocument
