from sqlalchemy.ext.asyncio import AsyncSession
from app.domain.models.booking import Booking, BookingRoom, BookingService, BookingStatus
from app.domain.repositories.base import BaseRepository


class BookingRepository(BaseRepository[Booking]):
    model = Booking


class BookingRoomRepository(BaseRepository[BookingRoom]):
    model = BookingRoom


class BookingServiceRepository(BaseRepository[BookingService]):
    model = BookingService


class BookingStatusRepository(BaseRepository[BookingStatus]):
    model = BookingStatus
