from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.api.deps import get_current_user
from app.domain.schemas.company import (
    LoginRequest, TokenResponse, RefreshTokenRequest,
    UserCreate, UserOut,
)
from app.domain.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=TokenResponse)
async def login(data: LoginRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.login(data.username, data.password)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.refresh_token(data.refresh_token)


@router.post("/register", response_model=UserOut)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    return await service.register_user(data.model_dump())


@router.get("/me", response_model=UserOut)
async def get_me(current_user=Depends(get_current_user)):
    return current_user
