from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.models.booking import Booking, BookingRoom, BookingService, BookingStatus
from app.domain.models.room import Room, RoomStatus
from app.domain.models.cleaning import CleaningTask
from app.domain.repositories.booking import (
    BookingRepository, BookingRoomRepository, BookingServiceRepository,
)
from app.domain.repositories.room import RoomRepository, RoomStatusRepository
from app.domain.repositories.misc import CleaningTaskRepository


class BookingServiceLogic:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.booking_repo = BookingRepository(session)
        self.booking_room_repo = BookingRoomRepository(session)
        self.booking_service_repo = BookingServiceRepository(session)
        self.room_repo = RoomRepository(session)
        self.room_status_repo = RoomStatusRepository(session)

    async def create_booking(self, data: dict, user_id: int) -> Booking:
        import uuid
        booking_number = f"BKG-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"

        booking = Booking(
            booking_number=booking_number,
            company_id=data["company_id"],
            hotel_id=data["hotel_id"],
            branch_id=data.get("branch_id"),
            customer_id=data["customer_id"],
            status_id=data.get("status_id"),
            booking_type=data.get("booking_type", "reservation"),
            group_name=data.get("group_name"),
            check_in_date=data["check_in_date"],
            check_out_date=data["check_out_date"],
            guest_count=data.get("guest_count", 1),
            special_requests=data.get("special_requests"),
            notes=data.get("notes"),
            is_group_booking=data.get("is_group_booking", False),
            currency=data.get("currency", "UZS"),
            created_by_id=user_id,
        )

        self.session.add(booking)
        await self.session.flush()

        room_ids = data.get("room_ids", [])
        total_amount = 0
        for room_id in room_ids:
            room = await self.room_repo.get_by_id(room_id)
            if not room:
                raise HTTPException(status_code=404, detail=f"Room {room_id} not found")
            booking_room = BookingRoom(
                booking_id=booking.id,
                room_id=room.id,
                room_rate=room.base_price,
            )
            self.session.add(booking_room)
            total_amount += room.base_price

        booking.total_amount = total_amount
        await self.session.flush()
        await self.session.refresh(booking)
        return booking

    async def check_in(self, booking_id: int, payment_method_id: int, amount: float, user_id: int) -> Booking:
        booking = await self.booking_repo.get_by_id(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        booking.actual_check_in = datetime.utcnow()
        booking.status_id = await self._get_status_id("checked_in")
        await self.session.flush()

        for booking_room in booking.rooms:
            room = await self.room_repo.get_by_id(booking_room.room_id)
            if room:
                occupied_status = await self._get_room_status("occupied")
                if occupied_status:
                    room.status_id = occupied_status.id
                    await self.session.flush()

        return booking

    async def check_out(self, booking_id: int) -> Booking:
        booking = await self.booking_repo.get_by_id(booking_id)
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")

        booking.actual_check_out = datetime.utcnow()
        booking.status_id = await self._get_status_id("checked_out")
        await self.session.flush()

        cleaning_repo = CleaningTaskRepository(self.session)
        for booking_room in booking.rooms:
            room = await self.room_repo.get_by_id(booking_room.room_id)
            if room:
                cleaning_status = await self._get_room_status("cleaning_required")
                if cleaning_status:
                    room.status_id = cleaning_status.id
                    await self.session.flush()

                task_number = f"CLN-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
                task = CleaningTask(
                    task_number=task_number,
                    company_id=booking.company_id,
                    hotel_id=booking.hotel_id,
                    room_id=booking_room.room_id,
                    booking_id=booking.id,
                    status="new",
                )
                self.session.add(task)

        await self.session.flush()
        return booking

    async def _get_status_id(self, slug: str) -> Optional[int]:
        from sqlalchemy import select
        result = await self.session.execute(
            select(BookingStatus).where(BookingStatus.slug == slug, BookingStatus.is_active == True)
        )
        status = result.scalar_one_or_none()
        return status.id if status else None

    async def _get_room_status(self, slug: str) -> Optional[RoomStatus]:
        from sqlalchemy import select
        result = await self.session.execute(
            select(RoomStatus).where(RoomStatus.slug == slug, RoomStatus.is_active == True)
        )
        return result.scalar_one_or_none()
