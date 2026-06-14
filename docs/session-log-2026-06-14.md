# Ish natijalari — XMS Loyihasi

**Sana**: 2026-06-14  
**Muhit**: macOS, Python 3.14, PostgreSQL 18

---

## 1. Loyiha yaratildi

`promt.md` asosida enterprise darajadagi **Multi-Tenant Hotel Management Platform** qurildi.

### Texnologiyalar
| Texnologiya | Versiya |
|-------------|---------|
| FastAPI | 0.136 |
| SQLAlchemy (async) | 2.0 |
| PostgreSQL | 18 |
| Alembic | — |
| JWT (python-jose) | 3.5 |
| bcrypt (passlib) | 1.7 |
| Pydantic | 2.13 |
| Pytest + pytest-asyncio | 9.1 |

### Arxitektura
- **Clean Architecture** (4 qatlam: API → Domain → Core → Infrastructure)
- **DDD** (Domain-Driven Design)
- **Repository Pattern** (generic `BaseRepository[T]`)
- **Service Layer** (biznes logika)
- **Dependency Injection** (FastAPI `Depends`)
- **SOLID** tamoyillari

---

## 2. Ma'lumotlar bazasi

**27 ta jadval** PostgreSQL'ga yaratildi:

| Guruh | Jadval |
|-------|--------|
| Multi-Tenant | companies, hotels, branches, buildings, floors |
| RBAC | users, roles, permissions, user_roles, role_permissions |
| Mijozlar | customers, customer_documents |
| Xonalar | rooms, room_categories, room_types, room_features, room_amenities, room_policies, room_statuses, room_checklist_templates, room_checklist_items |
| Bron | bookings, booking_rooms, booking_services, booking_statuses |
| Xizmatlar | services, service_categories |
| To'lov | payments, payment_methods, invoices, invoice_items |
| Boshqalar | cleaning_tasks, employees, audit_logs, notifications, notification_templates, system_settings |

---

## 3. API Endpoint'lar

Jami **50+ endpoint** yaratildi, 12 ta modul bo'yicha:

| Modul | Endpoint soni | Tavsif |
|-------|--------------|--------|
| Auth | 4 | Login, register, refresh, me |
| Companies | 9 | Company, Hotel, Branch, Building, Floor CRUD |
| Users | 7 | Role, Permission CRUD, assign |
| Customers | 6 | Customer CRUD, hujjatlar |
| Rooms | 16 | Xona, kategoriya, type, feature, amenity, policy, status, checklist |
| Bookings | 8 | Bron, check-in, check-out, xizmat qo'shish |
| Services | 6 | Xizmatlar, kategoriyalar |
| Payments | 5 | To'lov usullari, to'lovlar |
| Invoices | 3 | Invoice yaratish, ro'yxat, detallar |
| Cleaning | 4 | Tozalash tasklari CRUD |
| Employees | 4 | Xodimlar CRUD |
| Admin/Reports | 9 | Audit log, settings, hisobotlar |

---

## 4. Tuzatilgan xatoliklar

### 4.1. `BigInteger` → `Integer`
SQLite testlarida `BigInteger` autoincrement ishlamadi. Barcha modellarda `BigInteger` → `Integer` ga o'zgartirildi.

**Ta'sir qilingan fayllar**: `app/domain/models/` papkasidagi barcha 12 ta model fayli.

### 4.2. `passlib` + `bcrypt 5.0` moslik muammosi
`bcrypt >= 5.0` `passlib` bilan ishlamaydi. `bcrypt < 4.1` versiyasiga tushirildi.

### 4.3. `email-validator` qo'shildi
Pydantic `EmailStr` validatsiyasi uchun `email-validator` paketi qo'shildi.

### 4.4. `greenlet` qo'shildi
SQLAlchemy async operatsiyalari uchun `greenlet` kutubxonasi qo'shildi.

### 4.5. `datetime.utcnow()` → `datetime.now(timezone.utc)`
Python 3.14 da `datetime.utcnow()` deprecatsiya qilingan. Barcha joylarda `datetime.now(timezone.utc)` ga o'zgartirildi.

**Ta'sir qilingan fayllar**:
- `app/core/security.py` — JWT token yaratish
- `app/domain/services/auth.py` — login vaqti
- `app/domain/services/booking.py` — bron nomeri, check-in/out vaqti

### 4.6. Pydantic `Config` → `model_config`
Pydantic V2 da `class Config` deprecatsiya qilingan. `model_config` dict formatiga o'tkazildi.

**Ta'sir qilingan fayl**: `app/core/config.py`

### 4.7. Repository `update` metodiga `refresh()` qo'shildi
FastAPI response serializatsiyasida `MissingGreenlet` xatosi bor edi. Repository `update()` metodida `await self.session.refresh(obj)` qo'shildi.

**Ta'sir qilingan fayl**: `app/domain/repositories/base.py`

### 4.8. Booking yaratishda `refresh()` qo'shildi
Bron yaratilganda response model `updated_at` ni o'qiy olmas edi. `create_booking` metodiga `await self.session.refresh(booking)` qo'shildi.

**Ta'sir qilingan fayl**: `app/domain/services/booking.py`

### 4.9. Router yo'llari tuzatildi
`users.py` da `router` prefix `/roles` bo'lgani uchun endpoint'lar `/api/v1/roles/roles/...` bo'lib qolgan edi. Endpoint path'lari to'g'rilandi, `perm_router` `main.py` ga qo'shildi.

**Ta'sir qilingan fayllar**:
- `app/api/v1/users.py`
- `app/main.py`

### 4.10. FastAPI `regex` → `pattern`
`Query(regex=...)` deprecatsiya qilingan, `Query(pattern=...)` ga o'zgartirildi.

**Ta'sir qilingan fayl**: `app/api/v1/reports.py`

### 4.11. `User.settings` maydonida JSON tip qo'shildi
`Mapped[dict | None] = mapped_column(nullable=True)` da SQLAlchemy JSON tipini aniqlay olmas edi. `mapped_column(JSON, nullable=True)` ga to'g'rilandi, `JSON` import qo'shildi.

**Ta'sir qilingan fayl**: `app/domain/models/user.py`

### 4.12. `Docker` direktoriyasi olib tashlandi
Foydalanuvchi Docker ishlatmasligi sababli `docker/` papkasi o'chirildi.

---

## 5. Test natijalari

**12 ta test, hammasi GREEN** ✅

```
tests/test_api.py::test_health_check ................ PASSED
tests/test_api.py::test_login_invalid_credentials ... PASSED
tests/test_api.py::test_register_user ............... PASSED
tests/test_api.py::test_login_success ............... PASSED
tests/test_api.py::test_protected_routes_without_auth PASSED
tests/test_api.py::test_create_company_as_super_admin PASSED
tests/test_api.py::test_create_hotel ................ PASSED
tests/test_api.py::test_customer_crud ............... PASSED
tests/test_api.py::test_room_management ............. PASSED
tests/test_api.py::test_roles_and_permissions ....... PASSED
tests/test_api.py::test_dynamic_room_features ....... PASSED
tests/test_api.py::test_booking_flow ................ PASSED

============================== 12 passed in 4.58s ==============================
```

---

## 6. Production test (live server)

Server `http://localhost:8000` da ishga tushirildi va 9 ta endpoint real PostgreSQL bazasida test qilindi:

| # | Endpoint | So'rov | Javob |
|---|----------|--------|-------|
| 1 | `GET /api/v1/health` | — | `{"status":"healthy"}` |
| 2 | `POST /api/v1/auth/register` | Super Admin | `{"id":1, "is_super_admin":true}` |
| 3 | `POST /api/v1/auth/login` | admin/Admin123! | `access_token` + `refresh_token` |
| 4 | `POST /api/v1/companies` | Grand Plaza Group | `{"id":1, "name":"Grand Plaza Group"}` |
| 5 | `POST /api/v1/hotels` | Grand Plaza Tashkent | `{"id":1, "star_rating":5}` |
| 6 | `POST /api/v1/roles` | Reception Manager | `{"id":1}` |
| 7 | `POST /api/v1/permissions` | create_booking | `{"id":1, "module":"bookings"}` |
| 8 | `POST /api/v1/room-categories` | Standard | `{"id":1, "base_price":"80.0"}` |
| 9 | `POST /api/v1/rooms` | 101-Deluxe | `{"id":1, "room_number":"101"}` |

---

## 7. Admin ma'lumotlari

| Maydon | Qiymat |
|--------|--------|
| Username | `admin` |
| Password | `Admin123!` |
| Roli | Super Admin |
| Email | `admin@xms.uz` |

---

## 8. O'rnatilgan paketlar

```
fastapi==0.136.3
uvicorn==0.49.0
sqlalchemy==2.0.50
asyncpg==0.31.0
aiosqlite==0.22.1
pydantic==2.13.4
pydantic-settings==2.14.1
python-jose==3.5.0
passlib==1.7.4
bcrypt==4.0.1
python-multipart==0.0.32
httpx==0.28.1
pytest==9.1.0
pytest-asyncio==1.4.0
pytest-httpx==0.36.2
python-dotenv==1.2.2
email-validator (pydantic[email])
greenlet
```

---

## 9. Fayl statistikasi

| Ko'rsatkich | Son |
|-------------|-----|
| Python fayllari | 45 ta |
| Kod satrlari | ~5000+ |
| Ma'lumotlar bazasi jadvallari | 27 ta |
| API endpoint'lar | 50+ |
| Testlar | 12 ta (hammasi o'tdi) |
| Tuzatilgan xatoliklar | 12 ta |

---

## 10. Ishga tushirish

```bash
cd /Users/torex/StudioProjects/XMS
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

Swagger UI: http://localhost:8000/docs
