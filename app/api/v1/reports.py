from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.api.deps import get_current_user, require_permission
from app.domain.models.booking import Booking
from app.domain.models.payment import Payment
from app.domain.models.customer import Customer
from app.domain.models.cleaning import CleaningTask
from datetime import datetime, timedelta

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/revenue/daily")
async def daily_revenue(

    company_id: int = Query(...),
    hotel_id: int | None = Query(None),
    date: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_reports"))
    ):
    from sqlalchemy import cast, Date
    target_date = date if date else datetime.utcnow().strftime("%Y-%m-%d")

    result = await db.execute(
        select(func.sum(Payment.amount), func.count(Payment.id.distinct()))
        .where(cast(Payment.paid_at, Date) == target_date)
        .where(Payment.company_id == company_id)
        .where(Payment.status == "completed")
    )
    total, count = result.one()
    return {
        "date": target_date,
        "total_revenue": float(total or 0),
        "transaction_count": count,
    }


@router.get("/revenue/monthly")
async def monthly_revenue(

    company_id: int = Query(...),
    hotel_id: int | None = Query(None),
    year: int = Query(default_factory=lambda: datetime.utcnow().year),
    month: int = Query(default_factory=lambda: datetime.utcnow().month),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_reports"))
    ):
    result = await db.execute(
        select(func.sum(Payment.amount), func.count(Payment.id.distinct()))
        .where(func.extract("year", Payment.paid_at) == year)
        .where(func.extract("month", Payment.paid_at) == month)
        .where(Payment.company_id == company_id)
        .where(Payment.status == "completed")
    )
    total, count = result.one()
    return {
        "year": year,
        "month": month,
        "total_revenue": float(total or 0),
        "transaction_count": count,
    }


@router.get("/occupancy")
async def occupancy_report(

    company_id: int = Query(...),
    hotel_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_reports"))
    ):
    from app.domain.models.room import Room

    total_rooms = await db.scalar(
        select(func.count(Room.id)).where(Room.hotel_id == hotel_id, Room.is_active == True)
    ) or 0

    occupied_query = select(func.count(Booking.id)).where(
        Booking.hotel_id == hotel_id,
        Booking.company_id == company_id,
        Booking.actual_check_in.isnot(None),
        Booking.actual_check_out.is_(None),
    )
    occupied_rooms = await db.scalar(occupied_query) or 0

    return {
        "total_rooms": total_rooms,
        "occupied_rooms": occupied_rooms,
        "available_rooms": total_rooms - occupied_rooms,
        "occupancy_rate": round((occupied_rooms / total_rooms * 100), 2) if total_rooms > 0 else 0,
    }


@router.get("/customers")
async def customer_report(

    company_id: int = Query(...),
    period: str = Query("month", pattern="^(day|week|month|year)$"),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_reports"))
    ):
    now = datetime.utcnow()
    if period == "day":
        start_date = now.replace(hour=0, minute=0, second=0)
    elif period == "week":
        start_date = now - timedelta(days=7)
    elif period == "month":
        start_date = now - timedelta(days=30)
    else:
        start_date = now - timedelta(days=365)

    new_customers = await db.scalar(
        select(func.count(Customer.id)).where(
            Customer.company_id == company_id,
            Customer.created_at >= start_date,
            Customer.is_active == True,
        )
    ) or 0

    total_customers = await db.scalar(
        select(func.count(Customer.id)).where(
            Customer.company_id == company_id,
            Customer.is_active == True,
        )
    ) or 0

    return {
        "period": period,
        "new_customers": new_customers,
        "total_customers": total_customers,
    }


@router.get("/employees")
async def employee_performance(

    company_id: int = Query(...),
    hotel_id: int | None = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),

    _: bool = Depends(require_permission("view_reports"))
    ):
    from datetime import timedelta

    start_date = datetime.utcnow() - timedelta(days=30)
    tasks_query = select(
        CleaningTask.assigned_to_id,
        func.count(CleaningTask.id).label("total_tasks"),
        func.count().filter(CleaningTask.status == "completed").label("completed_tasks"),
    ).where(
        CleaningTask.company_id == company_id,
        CleaningTask.created_at >= start_date,
    ).group_by(CleaningTask.assigned_to_id)

    result = await db.execute(tasks_query)
    performance = []
    for row in result:
        if row.assigned_to_id:
            performance.append({
                "user_id": row.assigned_to_id,
                "total_tasks": row.total_tasks,
                "completed_tasks": row.completed_tasks,
                "completion_rate": round((row.completed_tasks / row.total_tasks * 100), 2) if row.total_tasks > 0 else 0,
            })

    return {"period_days": 30, "performance": performance}
