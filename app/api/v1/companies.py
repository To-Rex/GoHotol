from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, get_super_admin, require_permission
from app.domain.schemas.company import (
    CompanyCreate, CompanyUpdate, CompanyOut,
    HotelCreate, HotelUpdate, HotelOut,
    BranchCreate, BranchUpdate, BranchOut,
    BuildingCreate, BuildingOut,
    FloorCreate, FloorOut,
)
from app.domain.repositories.company import (
    CompanyRepository, HotelRepository, BranchRepository,
    BuildingRepository, FloorRepository,
)
from app.domain.models.company import Company, Hotel, Branch, Building, Floor

router = APIRouter(prefix="/companies", tags=["Companies"])


@router.get("", response_model=List[CompanyOut])
async def list_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    super_admin=Depends(get_super_admin),
    _: bool = Depends(require_permission("view_companies")),
):
    repo = CompanyRepository(db)
    return await repo.get_all(skip=skip, limit=limit)


@router.post("", response_model=CompanyOut)
async def create_company(
    data: CompanyCreate,
    db: AsyncSession = Depends(get_db),
    super_admin=Depends(get_super_admin),
    _: bool = Depends(require_permission("create_company")),
):
    repo = CompanyRepository(db)
    existing = await repo.get_by_slug(data.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Company slug already exists")
    company = Company(**data.model_dump())
    return await repo.create(company)


@router.get("/{company_id}", response_model=CompanyOut)
async def get_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_companies")),
):
    repo = CompanyRepository(db)
    company = await repo.get_by_id(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@router.put("/{company_id}", response_model=CompanyOut)
async def update_company(
    company_id: int,
    data: CompanyUpdate,
    db: AsyncSession = Depends(get_db),
    super_admin=Depends(get_super_admin),
    _: bool = Depends(require_permission("edit_company")),
):
    repo = CompanyRepository(db)
    company = await repo.get_by_id(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(company, key, value)
    return await repo.update(company)


@router.delete("/{company_id}")
async def deactivate_company(
    company_id: int,
    db: AsyncSession = Depends(get_db),
    super_admin=Depends(get_super_admin),
    _: bool = Depends(require_permission("delete_company")),
):
    repo = CompanyRepository(db)
    company = await repo.get_by_id(company_id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    company.is_active = False
    await repo.update(company)
    return {"message": "Company deactivated"}


hotel_router = APIRouter(prefix="/hotels", tags=["Hotels"])


@hotel_router.get("", response_model=List[HotelOut])
async def list_hotels(
    company_id: int | None = Query(None, description="Company ID filter"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_hotels")),
):
    repo = HotelRepository(db)
    filters = {}
    if company_id:
        filters["company_id"] = company_id
    return await repo.get_all(skip=skip, limit=limit, filters=filters)


@hotel_router.post("", response_model=HotelOut)
async def create_hotel(
    data: HotelCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("create_hotel")),
):
    repo = HotelRepository(db)
    existing = await repo.get_by_slug(data.slug)
    if existing:
        raise HTTPException(status_code=400, detail="Hotel slug already exists")
    hotel = Hotel(**data.model_dump())
    await repo.create(hotel)

    branch = Branch(
        hotel_id=hotel.id,
        name=data.name,
        address=data.address,
        email=data.email,
        description=f"Default branch for {data.name}",
    )
    branch_repo = BranchRepository(db)
    await branch_repo.create(branch)

    return hotel


@hotel_router.get("/{hotel_id}", response_model=HotelOut)
async def get_hotel(
    hotel_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_hotels")),
):
    repo = HotelRepository(db)
    hotel = await repo.get_by_id(hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return hotel


@hotel_router.put("/{hotel_id}", response_model=HotelOut)
async def update_hotel(
    hotel_id: int,
    data: HotelUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("edit_hotel")),
):
    repo = HotelRepository(db)
    hotel = await repo.get_by_id(hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(hotel, key, value)
    return await repo.update(hotel)


@hotel_router.delete("/{hotel_id}")
async def deactivate_hotel(
    hotel_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("delete_hotel")),
):
    repo = HotelRepository(db)
    hotel = await repo.get_by_id(hotel_id)
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    hotel.is_active = False
    await repo.update(hotel)
    return {"message": "Hotel deactivated"}


branch_router = APIRouter(prefix="/branches", tags=["Branches"])


@branch_router.post("", response_model=BranchOut)
async def create_branch(
    data: BranchCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("create_branch")),
):
    repo = BranchRepository(db)
    branch = Branch(**data.model_dump())
    return await repo.create(branch)


@branch_router.get("", response_model=List[BranchOut])
async def list_branches(
    hotel_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_branches")),
):
    repo = BranchRepository(db)
    return await repo.get_all(filters={"hotel_id": hotel_id})


@branch_router.get("/{branch_id}", response_model=BranchOut)
async def get_branch(branch_id: int, db: AsyncSession = Depends(get_db),
                     current_user=Depends(get_current_user),
                     _: bool = Depends(require_permission("view_branches"))):
    repo = BranchRepository(db)
    branch = await repo.get_by_id(branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch


@branch_router.put("/{branch_id}", response_model=BranchOut)
async def update_branch(branch_id: int, data: BranchUpdate, db: AsyncSession = Depends(get_db),
                        current_user=Depends(get_current_user),
                        _: bool = Depends(require_permission("edit_branch"))):
    repo = BranchRepository(db)
    branch = await repo.get_by_id(branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(branch, key, value)
    return await repo.update(branch)


@branch_router.delete("/{branch_id}")
async def delete_branch(branch_id: int, db: AsyncSession = Depends(get_db),
                        current_user=Depends(get_current_user),
                        _: bool = Depends(require_permission("delete_branch"))):
    repo = BranchRepository(db)
    branch = await repo.get_by_id(branch_id)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    branch.is_active = False
    await repo.update(branch)
    return {"message": "Branch deleted"}


building_router = APIRouter(prefix="/buildings", tags=["Buildings"])


@building_router.post("", response_model=BuildingOut)
async def create_building(data: BuildingCreate, db: AsyncSession = Depends(get_db),
                          current_user=Depends(get_current_user)):
    repo = BuildingRepository(db)
    building = Building(**data.model_dump())
    return await repo.create(building)


@building_router.get("", response_model=List[BuildingOut])
async def list_buildings(hotel_id: int = Query(...), db: AsyncSession = Depends(get_db),
                         current_user=Depends(get_current_user)):
    repo = BuildingRepository(db)
    return await repo.get_all(filters={"hotel_id": hotel_id})


floor_router = APIRouter(prefix="/floors", tags=["Floors"])


@floor_router.post("", response_model=FloorOut)
async def create_floor(data: FloorCreate, db: AsyncSession = Depends(get_db),
                       current_user=Depends(get_current_user)):
    repo = FloorRepository(db)
    floor = Floor(**data.model_dump())
    return await repo.create(floor)


@floor_router.get("", response_model=List[FloorOut])
async def list_floors(building_id: int = Query(...), db: AsyncSession = Depends(get_db),
                      current_user=Depends(get_current_user)):
    repo = FloorRepository(db)
    return await repo.get_all(filters={"building_id": building_id})
