from typing import List
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user, require_permission
from app.domain.schemas.misc import (
    CleaningTaskCreate, CleaningTaskUpdate, CleaningTaskOut,
    EmployeeCreate, EmployeeUpdate, EmployeeOut,
)
from app.domain.repositories.misc import CleaningTaskRepository, EmployeeRepository
from app.domain.models.cleaning import CleaningTask
from app.domain.models.misc import Employee

router = APIRouter(prefix="/cleaning", tags=["Cleaning"])
emp_router = APIRouter(prefix="/employees", tags=["Employees"])


@router.get("/tasks", response_model=List[CleaningTaskOut])
async def list_cleaning_tasks(

    company_id: int | None = Query(None),
    hotel_id: int | None = Query(None),
    status: str | None = Query(None),
    assigned_to_id: int | None = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_cleaning_tasks"))
    ):
    repo = CleaningTaskRepository(db)
    filters: dict = {"is_active": True}
    if company_id:
        filters["company_id"] = company_id
    if hotel_id:
        filters["hotel_id"] = hotel_id
    if status:
        filters["status"] = status
    if assigned_to_id:
        filters["assigned_to_id"] = assigned_to_id
    return await repo.get_all(skip=skip, limit=limit, filters=filters)


@router.post("/tasks", response_model=CleaningTaskOut)
async def create_cleaning_task(

    data: CleaningTaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_cleaning_tasks"))
    ):
    import uuid
    from datetime import datetime
    repo = CleaningTaskRepository(db)
    task_number = f"CLN-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"
    task = CleaningTask(task_number=task_number, **data.model_dump())
    return await repo.create(task)


@router.get("/tasks/{task_id}", response_model=CleaningTaskOut)
async def get_cleaning_task(
task_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_cleaning_tasks"))
    ):
    repo = CleaningTaskRepository(db)
    task = await repo.get_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Cleaning task not found")
    return task


@router.put("/tasks/{task_id}", response_model=CleaningTaskOut)
async def update_cleaning_task(

    task_id: int,
    data: CleaningTaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("accept_cleaning_task"))
    ):
    from datetime import datetime
    repo = CleaningTaskRepository(db)
    task = await repo.get_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Cleaning task not found")

    update_data = data.model_dump(exclude_unset=True)
    if "status" in update_data:
        if update_data["status"] == "in_progress" and task.status == "accepted":
            update_data["started_at"] = datetime.utcnow()
        elif update_data["status"] == "completed":
            update_data["completed_at"] = datetime.utcnow()

            from app.domain.repositories.room import RoomRepository, RoomStatusRepository
            from sqlalchemy import select
            from app.domain.models.room import RoomStatus
            room_repo = RoomRepository(db)
            room = await room_repo.get_by_id(task.room_id)
            if room:
                result = await db.execute(
                    select(RoomStatus).where(RoomStatus.slug == "available", RoomStatus.is_active == True)
                )
                available_status = result.scalar_one_or_none()
                if available_status:
                    room.status_id = available_status.id
                    await db.flush()

    for key, value in update_data.items():
        setattr(task, key, value)
    return await repo.update(task)


@emp_router.get("", response_model=List[EmployeeOut])
async def list_employees(

    company_id: int | None = Query(None),
    hotel_id: int | None = Query(None),
    branch_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_employees"))
    ):
    repo = EmployeeRepository(db)
    filters: dict = {"is_active": True}
    if company_id:
        filters["company_id"] = company_id
    if hotel_id:
        filters["hotel_id"] = hotel_id
    if branch_id:
        filters["branch_id"] = branch_id
    return await repo.get_all(filters=filters)


@emp_router.post("", response_model=EmployeeOut)
async def create_employee(
data: EmployeeCreate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("create_employee"))
    ):
    repo = EmployeeRepository(db)
    emp = Employee(**data.model_dump())
    return await repo.create(emp)


@emp_router.get("/{employee_id}", response_model=EmployeeOut)
async def get_employee(
employee_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("view_employees"))
    ):
    repo = EmployeeRepository(db)
    emp = await repo.get_by_id(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp


@emp_router.put("/{employee_id}", response_model=EmployeeOut)
async def update_employee(
employee_id: int, data: EmployeeUpdate, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user),
    _: bool = Depends(require_permission("edit_employee"))
    ):
    repo = EmployeeRepository(db)
    emp = await repo.get_by_id(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(emp, key, value)
    return await repo.update(emp)


@emp_router.delete("/{employee_id}")
async def delete_employee(

    employee_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("delete_employee"))
    ):
    repo = EmployeeRepository(db)
    emp = await repo.get_by_id(employee_id)
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    emp.is_active = False
    await repo.update(emp)
    return {"message": "Employee deleted"}
