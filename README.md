# XMS — Enterprise Multi-Tenant Hotel Management Platform

## Umumiy tavsif

XMS (eXtensible Management System) — zamonaviy enterprise darajadagi **SaaS** mehmonxona boshqaruv platformasi. Bitta dasturiy ta'minot orqali **yuzlab mustaqil mehmonxona kompaniyalari**, minglab foydalanuvchilar va xonalar bilan ishlash imkonini beradi.

**Asosiy imkoniyatlar:**
- Multi-Tenant arxitektura (Super Admin → Kompaniya → Mehmonxona → Filial)
- Cheksiz dinamik rollar va ruxsatlar (RBAC)
- To'liq dinamik xona boshqaruvi (kategoriyalar, feature, amenity, siyosatlar)
- To'liq bronlash sikli (band qilish → check-in → check-out → tozalash)
- Ko'p valyutali to'lov tizimi (naqd, karta, bank o'tkazmasi)
- Hisobotlar tizimi (daromad, bandlik, mijozlar, xodimlar)
- Audit logging (har bir amal yozib boriladi)
- Notification tizimi
- Barcha sozlamalar admin panel orqali dinamik boshqariladi

---

## Texnologik stek

| Qatlam | Texnologiya |
|--------|-------------|
| Backend Framework | **FastAPI** (async) |
| ORM | **SQLAlchemy 2.0** (async) |
| Database | **PostgreSQL** |
| Migratsiya | **Alembic** |
| Autentifikatsiya | **JWT** (Access + Refresh token) |
| Parol xeshlash | **bcrypt** (passlib orqali) |
| Validatsiya | **Pydantic v2** |
| Test | **Pytest** + pytest-asyncio + httpx |
| Hujjatlashtirish | **Swagger/OpenAPI** (avtomatik) |

---

## Arxitektura

Loyiha **Clean Architecture** va **Domain-Driven Design (DDD)** tamoyillari asosida qurilgan:

```
┌─────────────────────────────────────────────────┐
│  API Layer (app/api/v1/)                        │
│  REST endpointlar, routerlar, validatsiya       │
├─────────────────────────────────────────────────┤
│  Domain Layer (app/domain/)                     │
│  ┌─────────────┬─────────────┬───────────────┐  │
│  │ Models      │ Schemas     │ Services      │  │
│  │ (ORM)       │ (Pydantic)  │ (Biznes log.) │  │
│  ├─────────────┴─────────────┴───────────────┤  │
│  │ Repositories (Ma'lumotlar bazasi abstrak.) │  │
│  └───────────────────────────────────────────┘  │
├─────────────────────────────────────────────────┤
│  Core Layer (app/core/)                         │
│  Config, Security, Database engine              │
├─────────────────────────────────────────────────┤
│  Infrastructure (app/infrastructure/)           │
│  Middleware (Auth, Multi-Tenant)                │
└─────────────────────────────────────────────────┘
```

### Design Pattern'lar

| Pattern | Qo'llanilishi |
|---------|---------------|
| **Repository Pattern** | `app/domain/repositories/` — ma'lumotlar bazasi murojaatlarini abstraktlashtiradi, generic `BaseRepository[T]` asosida |
| **Unit of Work** | Repository'lar orqali — barcha o'zgarishlar `session.commit()` orqali atomik tarzda amalga oshiriladi |
| **Dependency Injection** | `app/api/deps.py` — FastAPI `Depends()` orqali sessiya, joriy foydalanuvchi va ruxsatlar inject qilinadi |
| **Service Layer** | `app/domain/services/` — biznes logika alohida qatlamda, controller'lardan mustaqil |
| **SOLID** | Har bir sinf va modul aniq bir vazifaga ega, o'zaro bog'liqlik interfeyslar orqali |

---

## Loyiha strukturasi (faylma-fayl)

```
XMS/
├── app/                                    # Asosiy dastur kodi
│   ├── main.py                             # FastAPI ilovasi, routerlarni ro'yxatdan o'tkazish
│   │
│   ├── core/                               # Yadro modullar
│   │   ├── config.py                       # Pydantic Settings — .env dan konfiguratsiya
│   │   ├── database.py                     # SQLAlchemy async engine, session, Base
│   │   └── security.py                     # JWT token yaratish/tekshirish, bcrypt parol
│   │
│   ├── api/                                # REST API qatlami
│   │   ├── deps.py                         # Dependency Injection: get_current_user, require_permission
│   │   └── v1/                             # API versiya 1
│   │       ├── auth.py                     # POST /auth/login, /auth/register, /auth/refresh, GET /auth/me
│   │       ├── companies.py                # Company, Hotel, Branch, Building, Floor CRUD
│   │       ├── users.py                    # Role, Permission CRUD, role↔permission, user↔role bog'lash
│   │       ├── customers.py                # Customer CRUD, hujjat qo'shish (passport/ID)
│   │       ├── rooms.py                    # Xona CRUD, kategoriya, type, feature, amenity, policy, status, checklist
│   │       ├── bookings.py                 # Booking yaratish, check-in, check-out, xizmat qo'shish
│   │       │                               # Payment method, Payment CRUD, Invoice yaratish
│   │       ├── cleaning_employees.py       # Cleaning task CRUD (status almashuvi avtomatik), Employee CRUD
│   │       ├── reports.py                  # Daromad (kunlik/oylik), bandlik, mijozlar, xodimlar hisoboti
│   │       └── admin.py                    # Audit log, System settings, Notification, Foydalanuvchilar ro'yxati
│   │
│   ├── domain/                             # Domain qatlami (DDD)
│   │   ├── models/                         # SQLAlchemy ORM modellari (27 ta jadval)
│   │   │   ├── base.py                     # TimestampMixin: created_at, updated_at, deleted_at
│   │   │   ├── company.py                  # Company, Hotel, Branch, Building, Floor
│   │   │   ├── user.py                     # User, Role, Permission, user_roles, role_permissions
│   │   │   ├── customer.py                 # Customer, CustomerDocument
│   │   │   ├── room.py                     # Room, RoomCategory, RoomType, RoomFeature, RoomAmenity,
│   │   │   │                               # RoomPolicy, RoomStatus, RoomChecklistTemplate, RoomChecklistItem
│   │   │   ├── booking.py                  # Booking, BookingRoom, BookingService, BookingStatus
│   │   │   ├── service.py                  # Service, ServiceCategory
│   │   │   ├── payment.py                  # Payment, PaymentMethod, Invoice, InvoiceItem
│   │   │   ├── cleaning.py                 # CleaningTask
│   │   │   ├── audit.py                    # AuditLog
│   │   │   ├── notification.py             # Notification, NotificationTemplate
│   │   │   └── misc.py                     # Employee, SystemSetting
│   │   │
│   │   ├── schemas/                        # Pydantic sxemalar (validatsiya, serializatsiya)
│   │   │   ├── company.py                  # Company, Hotel, Branch, Building, Floor schemalari
│   │   │   ├── user.py                     # Role, Permission, User role assign schemalari
│   │   │   ├── customer.py                 # Customer, CustomerDocument schemalari
│   │   │   ├── room.py                     # Xona, kategoriya, type, feature, amenity, status schemalari
│   │   │   ├── booking.py                  # Booking, CheckIn/CheckOut request schemalari
│   │   │   ├── service.py                  # Service, Payment, Invoice, PaymentMethod schemalari
│   │   │   └── misc.py                     # CleaningTask, Employee schemalari
│   │   │
│   │   ├── repositories/                   # Repository Pattern
│   │   │   ├── base.py                     # Generic BaseRepository[T] — CRUD, filter, pagination
│   │   │   ├── company.py                  # CompanyRepository, HotelRepository, BranchRepository, ...
│   │   │   ├── user.py                     # UserRepository, RoleRepository, PermissionRepository
│   │   │   ├── customer.py                 # CustomerRepository, CustomerDocumentRepository
│   │   │   ├── room.py                     # RoomRepository, RoomCategoryRepository, ...
│   │   │   ├── booking.py                  # BookingRepository, BookingRoomRepository, ...
│   │   │   ├── service_payment.py          # ServiceRepository, PaymentRepository, InvoiceRepository, ...
│   │   │   └── misc.py                     # CleaningTaskRepository, EmployeeRepository, AuditLog, ...
│   │   │
│   │   └── services/                       # Biznes logika (Service Layer)
│   │       ├── auth.py                     # AuthService: login, register, token refresh, ruxsat tekshirish
│   │       ├── booking.py                  # BookingServiceLogic: bron yaratish, check-in, check-out
│   │       └── misc.py                     # AuditService, NotificationService
│   │
│   └── infrastructure/                     # Infratuzilma
│       ├── middleware/
│       │   └── auth.py                     # AuthMiddleware (global darajada har so'rovni tekshiradi)
│       └── utils/                          # Kelajakdagi yordamchi utilitalar
│
├── alembic/                                # Database migratsiyalari
│   ├── env.py                              # Alembic konfiguratsiyasi (async rejimda)
│   ├── script.py.mako                      # Migratsiya shabloni
│   └── versions/                           # Migratsiya fayllari
│
├── tests/                                  # Testlar (12 ta test, hammasi green ✅)
│   ├── conftest.py                         # Test fixture'lari (SQLite in-memory)
│   └── test_api.py                         # API integratsion testlari
│
├── .env                                    # Muhit o'zgaruvchilari
├── .env.example                            # Muhit o'zgaruvchilari namunasi
├── requirements.txt                        # Python bog'liqliklari
├── pyproject.toml                          # Python loyiha sozlamalari
├── promt.md                                # Loyiha talablari (texnik spetsifikatsiya)
└── README.md                               # Ushbu fayl
```

---

## Ma'lumotlar bazasi sxemasi

Loyihada **27 ta jadval** mavjud:

### Multi-Tenant ierarxiyasi
```
companies (1) ────< (many) hotels
hotels     (1) ────< (many) branches
hotels     (1) ────< (many) buildings
buildings  (1) ────< (many) floors
```

### Foydalanuvchilar va ruxsatlar (RBAC)
```
users      (many) >───< (many) roles
roles      (many) >───< (many) permissions
                └── user_roles (bog'lovchi jadval)
                └── role_permissions (bog'lovchi jadval)
```

### Mijozlar
```
customers  (1) ────< (many) customer_documents
```

### Xonalar (dinamik konfiguratsiya)
```
rooms          ──FK──> room_categories
rooms          ──FK──> room_types
rooms          ──FK──> room_statuses
room_features  ── mustaqil jadval (dinamik)
room_amenities ── mustaqil jadval (dinamik)
room_policies  ── mustaqil jadval (dinamik)
room_checklist_templates (1) ────< (many) room_checklist_items
```

### Bronlash
```
bookings        ──FK──> customers, booking_statuses
booking_rooms   ──FK──> bookings, rooms
booking_services──FK──> bookings, services
```

### Xizmatlar va to'lovlar
```
services         ──FK──> service_categories
payments         ──FK──> bookings, payment_methods, invoices
invoices         ──FK──> bookings, customers
invoice_items    ──FK──> invoices
payment_methods  ── mustaqil jadval (dinamik)
```

### Boshqa jadvallar
```
cleaning_tasks   ──FK──> rooms, bookings, users
employees        ──FK──> companies, hotels, branches, users
audit_logs       ── har bir amal yoziladi
notifications    ──FK──> users
notification_templates ── mustaqil jadval
system_settings  ── global/platform sozlamalari
```

---

## API Endpoint'lar

Barcha endpointlar `/api/v1/` prefiksi ostida. Swagger hujjatlari: `http://localhost:8000/docs`

### Auth
| Method | Endpoint | Tavsif | Auth |
|--------|----------|--------|------|
| POST | `/auth/register` | Foydalanuvchi ro'yxatdan o'tkazish | Yo'q |
| POST | `/auth/login` | Login qilish, token olish | Yo'q |
| POST | `/auth/refresh` | Refresh token yangilash | Yo'q |
| GET | `/auth/me` | Joriy foydalanuvchi ma'lumoti | Ha |

### Companies & Hotels
| Method | Endpoint | Tavsif | Auth |
|--------|----------|--------|------|
| GET/POST | `/companies` | Kompaniyalar ro'yxati / yaratish | Super Admin |
| GET/PUT/DELETE | `/companies/{id}` | Kompaniya ko'rish/tahrirlash/o'chirish | Super Admin |
| GET/POST | `/hotels` | Mehmonxonalar ro'yxati / yaratish | Ha |
| GET/PUT/DELETE | `/hotels/{id}` | Mehmonxona ko'rish/tahrirlash/o'chirish | Ha |
| GET/POST/PUT | `/branches` | Filiallar CRUD | Ha |
| GET/POST | `/buildings` | Binolar CRUD | Ha |
| GET/POST | `/floors` | Qavatlar CRUD | Ha |

### Rollar va Ruxsatlar (RBAC)
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET/POST/PUT | `/roles` | Rollarni boshqarish |
| GET/POST | `/permissions` | Ruxsatlarni boshqarish |
| POST | `/roles/assign-permissions` | Rolga ruxsat biriktirish |
| GET | `/roles/{id}/permissions` | Rol ruxsatlarini ko'rish |
| POST | `/roles/users/assign-roles` | Foydalanuvchiga rol biriktirish |

### Mijozlar
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET/POST | `/customers` | Mijozlar ro'yxati / yaratish |
| GET/PUT/DELETE | `/customers/{id}` | Mijoz ko'rish/tahrirlash/o'chirish |
| POST | `/customer-documents` | Hujjat qo'shish (passport/ID) |
| GET | `/customer-documents/customer/{id}` | Mijoz hujjatlari |

### Xonalar (dinamik konfiguratsiya)
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET/POST | `/rooms` | Xonalar ro'yxati / yaratish |
| GET/PUT/DELETE | `/rooms/{id}` | Xona ko'rish/tahrirlash/o'chirish |
| GET/POST | `/room-categories` | Xona kategoriyalari |
| GET/POST | `/room-types` | Xona tiplari |
| GET/POST | `/room-features` | Xona xususiyatlari (Air Conditioner, WiFi, ...) |
| GET/POST | `/room-amenities` | Xona qulayliklari |
| GET/POST | `/room-policies` | Xona siyosatlari |
| GET/POST | `/room-statuses` | Xona statuslari (Available, Occupied, ...) |
| GET/POST | `/room-checklists/templates` | Tekshiruv shablonlari |
| POST | `/room-checklists/items` | Tekshiruv bandlari |

### Bronlash
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET/POST | `/bookings` | Bronlar ro'yxati / yaratish |
| GET/PUT | `/bookings/{id}` | Bron ko'rish/tahrirlash |
| POST | `/bookings/check-in` | Check-in qilish |
| POST | `/bookings/check-out` | Check-out qilish |
| POST | `/bookings/services/add` | Bron'ga xizmat qo'shish |
| GET | `/bookings/statuses` | Bron statuslari ro'yxati |

### Xizmatlar va To'lovlar
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET/POST/PUT | `/services` | Xizmatlar (Laundry, Breakfast, SPA...) |
| GET/POST | `/services/categories` | Xizmat kategoriyalari |
| GET/POST | `/payments/methods` | To'lov usullari (Uzcard, Humo, Visa...) |
| GET/POST | `/payments` | To'lovlar |
| GET/POST | `/invoices` | Invoice'lar |
| GET | `/invoices/{id}` | Invoice detallari |
| POST | `/invoices/items` | Invoice bandi qo'shish |

### Tozalash va Xodimlar
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET/POST/PUT | `/cleaning/tasks` | Tozalash vazifalari |
| GET/POST/PUT | `/employees` | Xodimlar |

### Hisobotlar
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/reports/revenue/daily` | Kunlik daromad |
| GET | `/reports/revenue/monthly` | Oylik daromad |
| GET | `/reports/occupancy` | Bandlik hisoboti |
| GET | `/reports/customers` | Mijozlar hisoboti |
| GET | `/reports/employees` | Xodimlar samaradorligi |

### Admin
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/admin/audit-logs` | Audit log (super admin) |
| GET/POST | `/admin/settings` | Tizim sozlamalari |
| GET | `/admin/users` | Barcha foydalanuvchilar (super admin) |
| GET | `/admin/notifications` | Notification'lar |

---

## Multi-Tenant ierarxiyasi

```
Super Admin (eng yuqori daraja)
│
├── Company: "Grand Plaza Group"
│   ├── Hotel: "Grand Plaza Tashkent"
│   │   ├── Branch: "Filial 1"
│   │   ├── Branch: "Filial 2"
│   │   ├── Building: "A korpus"
│   │   │   ├── Floor: "1-qavat"
│   │   │   │   ├── Room: "101"
│   │   │   │   └── Room: "102"
│   │   │   └── Floor: "2-qavat"
│   │   └── Building: "B korpus"
│   │
│   ├── Hotel: "Grand Plaza Samarkand"
│   └── Hotel: "Grand Plaza Bukhara"
│
├── Company: "Hilton Group"
│   └── Hotel: "Hilton Tashkent"
│
└── ...
```

Har bir kompaniya administratori faqat **o'z kompaniyasi** ma'lumotlarini ko'ra oladi. Kompaniyalar o'rtasida to'liq ma'lumot izolyatsiyasi ta'minlangan.

---

## Asosiy biznes jarayonlari

### Check-In jarayoni
```
POST /api/v1/bookings/check-in
{
  "booking_id": 1,
  "payment_method_id": 1,
  "amount": 150000
}
```
1. Bron topiladi
2. `actual_check_in` = joriy vaqt
3. Bron statusi → "Checked In"
4. Xona statusi → "Occupied"

### Check-Out jarayoni
```
POST /api/v1/bookings/check-out
{
  "booking_id": 1
}
```
1. Bron topiladi
2. `actual_check_out` = joriy vaqt
3. Bron statusi → "Checked Out"
4. Xona statusi → **"Cleaning Required"**
5. **Avtomatik yangi Cleaning Task yaratiladi**

### Tozalash ish jarayoni
```
New → Accepted → In Progress → Completed
```
Cleaning task `Completed` bo'lganda **xona avtomatik** `"Available"` statusiga o'tadi.

---

## RBAC (Role-Based Access Control)

Tizim **dinamik** RBAC ga asoslangan — hech qanday rol yoki ruxsat kodda qattiq belgilanmagan. Admin panel orqali cheksiz yangi rollar va ruxsatlar yaratish mumkin.

### Misol:
```
Rol: "Reception Manager"
  ├── Permission: "create_booking"
  ├── Permission: "edit_booking"
  ├── Permission: "check_in"
  ├── Permission: "check_out"
  └── Permission: "view_reports"

Rol: "Cleaner"
  ├── Permission: "view_cleaning_tasks"
  ├── Permission: "accept_cleaning_task"
  └── Permission: "complete_cleaning_task"
```

### Kodda ruxsat tekshirish:
```python
# app/api/deps.py
def require_permission(permission_slug: str):
    async def permission_checker(current_user=Depends(get_current_user), ...):
        if current_user.is_super_admin:
            return True
        if permission_slug not in user_permissions:
            raise HTTPException(status_code=403)
        return True
    return permission_checker

# Endpoint'da qo'llash:
@router.post("/bookings")
async def create_booking(
    data: BookingCreate,
    _=Depends(require_permission("create_booking"))
):
    ...
```

---

## O'rnatish va ishga tushirish

### Talablar
- **Python 3.12+**
- **PostgreSQL** (mahalliy yoki Docker orqali)

### 1. PostgreSQL bazasini yaratish
```bash
createdb xms_db
```

### 2. Virtual environment
```bash
cd XMS
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 3. `.env` faylini sozlash
```bash
cp .env.example .env
# .env faylida DATABASE_URL ni o'z PostgreSQL manzilingizga o'zgartiring
```

Standart `.env` (mahalliy PostgreSQL uchun):
```
DATABASE_URL=postgresql+asyncpg://username@localhost:5432/xms_db
DATABASE_URL_SYNC=postgresql://username@localhost:5432/xms_db
JWT_SECRET_KEY=o-z-g-a-r-t-i-r-i-n-g
```

### 4. Jadval'larni yaratish
Loyiha ishga tushganda **avtomatik** barcha jadvallar yaratiladi. Qo'lda yaratish uchun:
```python
from app.core.database import engine, Base
# Barcha model importlari kerak
await engine.begin() as conn:
    await conn.run_sync(Base.metadata.create_all)
```

### 5. Serverni ishga tushirish
```bash
uvicorn app.main:app --reload --port 8000
```

### 6. Swagger UI
```
http://localhost:8000/docs
```

### 7. Super Admin yaratish
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@xms.com",
    "password": "Admin123!",
    "full_name": "Super Admin",
    "is_super_admin": true
  }'
```

Super Admin bo'lgandan keyin barcha endpoint'larga kirish, kompaniyalar yaratish va boshqa barcha amallarni bajarish mumkin.

---

## Testlar

Testlar `aiosqlite` orqali (in-memory SQLite), PostgreSQL kerak emas:

```bash
# Barcha testlarni ishga tushirish
pytest tests/ -v

# Alohida test
pytest tests/test_api.py::test_booking_flow -v
```

### Test qamrovi (12 ta test):
| Test | Tekshiriladigan narsa |
|------|----------------------|
| `test_health_check` | API ishlab turibdimi |
| `test_login_invalid_credentials` | Noto'g'ri login qaytarilishi |
| `test_register_user` | Foydalanuvchi ro'yxatdan o'tishi |
| `test_login_success` | Token olish |
| `test_protected_routes_without_auth` | Auth'siz yo'l qo'yilmasligi |
| `test_create_company_as_super_admin` | Super Admin kompaniya yarata olishi |
| `test_create_hotel` | Mehmonxona yaratish |
| `test_customer_crud` | Mijoz CRUD operatsiyalari |
| `test_room_management` | Xona yaratish va tahrirlash |
| `test_roles_and_permissions` | Rol va ruxsatlar dinamik boshqaruvi |
| `test_dynamic_room_features` | Dinamik xona xususiyatlari |
| `test_booking_flow` | To'liq bron yaratish jarayoni |

---

## Dinamik konfiguratsiya

Tizimning quyidagi elementlari **admin panel orqali dinamik boshqariladi** — kod'ga o'zgartirish kiritish shart emas:

| Konfiguratsiya elementi | API Endpoint |
|-------------------------|--------------|
| Xona statuslari | `POST /room-statuses` |
| Xona kategoriyalari | `POST /room-categories` |
| Xona xususiyatlari | `POST /room-features` |
| Xona qulayliklari | `POST /room-amenities` |
| Xona siyosatlari | `POST /room-policies` |
| Tekshiruv shablonlari | `POST /room-checklists/templates` |
| Foydalanuvchi rollari | `POST /roles` |
| Ruxsatlar | `POST /permissions` |
| Xizmatlar | `POST /services` |
| Xizmat kategoriyalari | `POST /services/categories` |
| To'lov usullari | `POST /payments/methods` |
| Bron statuslari | `POST /bookings/statuses` |
| Notification shablonlari | `POST /notification-templates` |
| Tizim sozlamalari | `POST /admin/settings` |

---

## Notification tizimi

Har bir muhim hodisa avtomatik notification yaratadi:

| Hodisa | Notification type |
|--------|------------------|
| Yangi bron | `new_booking` |
| Check-in | `check_in` |
| Check-out | `check_out` |
| Yangi tozalash vazifasi | `cleaning_required` |
| Tozalash yakunlandi | `cleaning_completed` |
| To'lov qabul qilindi | `payment_received` |
| Hisobot tayyor | `report_ready` |

Notification'lar foydalanuvchiga in-app ko'rinishida yuboriladi. Email va Telegram kanallari kelajakda qo'shiladi.

---

## Xavfsizlik

- **JWT autentifikatsiya**: Access token (30 daqiqa) + Refresh token (7 kun)
- **bcrypt** parol xeshlash
- **CORS** sozlangan
- **Multi-Tenant ma'lumot izolyatsiyasi**: har bir so'rov kompaniya ID siga qarab filtrlanadi
- **Audit log**: har bir muhim amal saqlanadi, o'chirib bo'lmaydi
- **Ruxsat tekshiruvi**: har bir endpoint uchun kerakli permission slug tekshiriladi

---

## Kelajakdagi integratsiyalar (tayyorlanmoqda)

Loyiha quyidagi tizimlar bilan integratsiyaga **tayyor arxitektura** ga ega:

- Kameralar va Face Recognition tizimlari
- Access Control (eshik qulflash) tizimlari
- Buxgalteriya va ERP tizimlari
- SMS provayderlar
- To'lov shlyuzlari (Payme, Click, Stripe)
- Telegram bot xabarnomalari
- PDF Invoice generatsiyasi

---

## Litsenziya

Proprietary. Barcha huquqlar himoyalangan.
