from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, require_permission
from app.domain.schemas.customer import (
    CustomerCreate, CustomerUpdate, CustomerOut,
    CustomerDocumentCreate, CustomerDocumentOut,
)
from app.domain.repositories.customer import CustomerRepository, CustomerDocumentRepository
from app.domain.models.customer import Customer, CustomerDocument

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=List[CustomerOut])
async def list_customers(

    company_id: int = Query(...),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    search: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_customers"))
    ):
    repo = CustomerRepository(db)
    return await repo.get_all(skip=skip, limit=limit, filters={"company_id": company_id, "is_active": True})


@router.post("", response_model=CustomerOut)
async def create_customer(

    data: CustomerCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("create_customer"))
    ):
    repo = CustomerRepository(db)
    customer = Customer(**data.model_dump())
    return await repo.create(customer)


@router.get("/{customer_id}", response_model=CustomerOut)
async def get_customer(

    customer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_customers"))
    ):
    repo = CustomerRepository(db)
    customer = await repo.get_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer


@router.put("/{customer_id}", response_model=CustomerOut)
async def update_customer(

    customer_id: int,
    data: CustomerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("edit_customer"))
    ):
    repo = CustomerRepository(db)
    customer = await repo.get_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(customer, key, value)
    return await repo.update(customer)


@router.delete("/{customer_id}")
async def deactivate_customer(

    customer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("delete_customer"))
    ):
    repo = CustomerRepository(db)
    customer = await repo.get_by_id(customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    customer.is_active = False
    await repo.update(customer)
    return {"message": "Customer deactivated"}


doc_router = APIRouter(prefix="/customer-documents", tags=["Customer Documents"])


@doc_router.post("", response_model=CustomerDocumentOut)
async def create_document(

    data: CustomerDocumentCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("create_customer"))
    ):
    repo = CustomerDocumentRepository(db)
    doc = CustomerDocument(**data.model_dump())
    return await repo.create(doc)


@doc_router.get("/customer/{customer_id}", response_model=List[CustomerDocumentOut])
async def get_customer_documents(

    customer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_customers"))
    ):
    repo = CustomerDocumentRepository(db)
    return await repo.get_all(filters={"customer_id": customer_id})
