from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, require_permission
from app.domain.schemas.booking import (
    BookingCreate, BookingUpdate, BookingOut,
    CheckInRequest, CheckOutRequest, BookingServiceAdd,
    BookingStatusCreate,
)
from app.domain.schemas.service import (
    ServiceCategoryCreate, ServiceCategoryOut,
    ServiceCreate, ServiceUpdate, ServiceOut,
    PaymentMethodCreate, PaymentMethodOut,
    PaymentCreate, PaymentOut,
    InvoiceCreate, InvoiceOut, InvoiceItemCreate,
)
from app.domain.repositories.booking import BookingRepository, BookingStatusRepository
from app.domain.repositories.service_payment import (
    ServiceRepository, ServiceCategoryRepository,
    PaymentRepository, PaymentMethodRepository,
    InvoiceRepository, InvoiceItemRepository,
)
from app.domain.models.booking import Booking, BookingStatus, BookingService
from app.domain.models.service import Service, ServiceCategory
from app.domain.models.payment import Payment, PaymentMethod, Invoice, InvoiceItem
from app.domain.services.booking import BookingServiceLogic

router = APIRouter(prefix="/bookings", tags=["Bookings"])
service_router = APIRouter(prefix="/services", tags=["Services"])
payment_router = APIRouter(prefix="/payments", tags=["Payments"])
invoice_router = APIRouter(prefix="/invoices", tags=["Invoices"])


# --- Booking Endpoints ---

@router.get("", response_model=List[BookingOut])
async def list_bookings(

    company_id: int = Query(...),
    hotel_id: int | None = Query(None),
    status_id: int | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_bookings"))
    ):
    repo = BookingRepository(db)
    filters = {"company_id": company_id}
    if hotel_id:
        filters["hotel_id"] = hotel_id
    if status_id:
        filters["status_id"] = status_id
    return await repo.get_all(skip=skip, limit=limit, filters=filters)


@router.post("", response_model=BookingOut)
async def create_booking(

    data: BookingCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("create_booking"))
    ):
    service = BookingServiceLogic(db)
    return await service.create_booking(data.model_dump(), current_user.id)


@router.get("/{booking_id}", response_model=BookingOut)
async def get_booking(
booking_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_bookings"))
    ):
    repo = BookingRepository(db)
    booking = await repo.get_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    return booking


@router.put("/{booking_id}", response_model=BookingOut)
async def update_booking(
booking_id: int, data: BookingUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("edit_booking"))
    ):
    repo = BookingRepository(db)
    booking = await repo.get_by_id(booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(booking, key, value)
    return await repo.update(booking)


@router.post("/check-in")
async def check_in(

    data: CheckInRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("check_in"))
    ):
    service = BookingServiceLogic(db)
    booking = await service.check_in(data.booking_id, data.payment_method_id, data.amount, current_user.id)
    return {"message": "Check-in completed", "booking_id": booking.id}


@router.post("/check-out")
async def check_out(

    data: CheckOutRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("check_out"))
    ):
    service = BookingServiceLogic(db)
    booking = await service.check_out(data.booking_id)
    return {"message": "Check-out completed, cleaning tasks created", "booking_id": booking.id}


@router.post("/services/add")
async def add_booking_service(

    data: BookingServiceAdd,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("create_booking"))
    ):
    service_repo = ServiceRepository(db)
    service = await service_repo.get_by_id(data.service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    booking_service = BookingService(
        booking_id=data.booking_id,
        service_id=data.service_id,
        quantity=data.quantity,
        unit_price=service.price,
        total_price=service.price * data.quantity,
        notes=data.notes,
    )
    db.add(booking_service)
    await db.flush()
    return {"message": "Service added to booking"}


@router.get("/statuses")
async def list_booking_statuses(

    company_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_bookings"))
    ):
    repo = BookingStatusRepository(db)
    filters = {}
    if company_id:
        filters["company_id"] = company_id
    return await repo.get_all(filters=filters)


# --- Service Endpoints ---

@service_router.post("/categories", response_model=ServiceCategoryOut)
async def create_service_category(
data: ServiceCategoryCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("create_service"))
    ):
    repo = ServiceCategoryRepository(db)
    cat = ServiceCategory(**data.model_dump())
    return await repo.create(cat)


@service_router.get("/categories", response_model=List[ServiceCategoryOut])
async def list_service_categories(
company_id: int | None = Query(None), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_services"))
    ):
    repo = ServiceCategoryRepository(db)
    filters = {}
    if company_id:
        filters["company_id"] = company_id
    return await repo.get_all(filters=filters)


@service_router.get("", response_model=List[ServiceOut])
async def list_services(
company_id: int | None = Query(None), hotel_id: int | None = Query(None), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_services"))
    ):
    repo = ServiceRepository(db)
    filters = {"is_active": True}
    if company_id:
        filters["company_id"] = company_id
    if hotel_id:
        filters["hotel_id"] = hotel_id
    return await repo.get_all(filters=filters)


@service_router.post("", response_model=ServiceOut)
async def create_service(
data: ServiceCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("create_service"))
    ):
    repo = ServiceRepository(db)
    service = Service(**data.model_dump())
    return await repo.create(service)


@service_router.put("/{service_id}", response_model=ServiceOut)
async def update_service(
service_id: int, data: ServiceUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("edit_service"))
    ):
    repo = ServiceRepository(db)
    service = await repo.get_by_id(service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(service, key, value)
    return await repo.update(service)


# --- Payment Endpoints ---

@payment_router.get("/methods", response_model=List[PaymentMethodOut])
async def list_payment_methods(
company_id: int | None = Query(None), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("manage_payment_methods"))
    ):
    repo = PaymentMethodRepository(db)
    filters = {"is_active": True}
    if company_id:
        filters["company_id"] = company_id
    return await repo.get_all(filters=filters)


@payment_router.post("/methods", response_model=PaymentMethodOut)
async def create_payment_method(
data: PaymentMethodCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("manage_payment_methods"))
    ):
    repo = PaymentMethodRepository(db)
    method = PaymentMethod(**data.model_dump())
    return await repo.create(method)


@payment_router.post("", response_model=PaymentOut)
async def create_payment(
data: PaymentCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("create_payment"))
    ):
    import uuid
    from datetime import datetime
    repo = PaymentRepository(db)
    payment_number = f"PAY-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
    payment = Payment(
        payment_number=payment_number,
        paid_at=datetime.utcnow(),
        created_by_id=current_user.id,
        **data.model_dump(),
    )
    return await repo.create(payment)


@payment_router.get("", response_model=List[PaymentOut])
async def list_payments(
booking_id: int = Query(...), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_payments"))
    ):
    repo = PaymentRepository(db)
    return await repo.get_all(filters={"booking_id": booking_id})


# --- Invoice Endpoints ---

@invoice_router.post("", response_model=InvoiceOut)
async def create_invoice(
data: InvoiceCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("create_invoice"))
    ):
    import uuid
    from datetime import datetime
    repo = InvoiceRepository(db)
    invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
    invoice = Invoice(
        invoice_number=invoice_number,
        issued_at=datetime.utcnow(),
        created_by_id=current_user.id,
        **data.model_dump(),
    )
    return await repo.create(invoice)


@invoice_router.get("", response_model=List[InvoiceOut])
async def list_invoices(
booking_id: int = Query(...), db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_invoices"))
    ):
    repo = InvoiceRepository(db)
    return await repo.get_all(filters={"booking_id": booking_id})


@invoice_router.get("/{invoice_id}", response_model=InvoiceOut)
async def get_invoice(
invoice_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_invoices"))
    ):
    repo = InvoiceRepository(db)
    invoice = await repo.get_by_id(invoice_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice


@invoice_router.post("/items")
async def add_invoice_item(
data: InvoiceItemCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("create_invoice"))
    ):
    item = InvoiceItem(**data.model_dump())
    item.total_price = item.unit_price * item.quantity
    item.tax_amount = item.total_price * (item.tax_rate / 100)
    db.add(item)
    await db.flush()
    return {"message": "Invoice item added", "id": item.id}
