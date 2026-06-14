from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.models.service import Service, ServiceCategory
from app.domain.models.payment import Payment, PaymentMethod, Invoice, InvoiceItem
from app.domain.repositories.base import BaseRepository


class ServiceRepository(BaseRepository[Service]):
    model = Service


class ServiceCategoryRepository(BaseRepository[ServiceCategory]):
    model = ServiceCategory


class PaymentRepository(BaseRepository[Payment]):
    model = Payment


class PaymentMethodRepository(BaseRepository[PaymentMethod]):
    model = PaymentMethod


class InvoiceRepository(BaseRepository[Invoice]):
    model = Invoice


class InvoiceItemRepository(BaseRepository[InvoiceItem]):
    model = InvoiceItem
