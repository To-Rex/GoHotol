from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import auth, companies, users, customers, rooms, bookings, cleaning_employees, reports, admin, seed


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(companies.router, prefix="/api/v1")
app.include_router(companies.hotel_router, prefix="/api/v1")
app.include_router(companies.branch_router, prefix="/api/v1")
app.include_router(companies.building_router, prefix="/api/v1")
app.include_router(companies.floor_router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(users.perm_router, prefix="/api/v1")
app.include_router(customers.router, prefix="/api/v1")
app.include_router(customers.doc_router, prefix="/api/v1")
app.include_router(rooms.router, prefix="/api/v1")
app.include_router(rooms.cat_router, prefix="/api/v1")
app.include_router(rooms.type_router, prefix="/api/v1")
app.include_router(rooms.feature_router, prefix="/api/v1")
app.include_router(rooms.amenity_router, prefix="/api/v1")
app.include_router(rooms.policy_router, prefix="/api/v1")
app.include_router(rooms.status_router, prefix="/api/v1")
app.include_router(rooms.checklist_router, prefix="/api/v1")
app.include_router(bookings.router, prefix="/api/v1")
app.include_router(bookings.service_router, prefix="/api/v1")
app.include_router(bookings.payment_router, prefix="/api/v1")
app.include_router(bookings.invoice_router, prefix="/api/v1")
app.include_router(cleaning_employees.router, prefix="/api/v1")
app.include_router(cleaning_employees.emp_router, prefix="/api/v1")
app.include_router(reports.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")
app.include_router(seed.router, prefix="/api/v1")


@app.get("/api/v1/health")
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }
