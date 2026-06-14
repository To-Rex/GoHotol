# O'zgarishlar logi — 2026-06-14

## Backend o'zgarishlari

### 1. User tahrirlash endpointi qo'shildi
**Fayl**: `app/api/v1/admin.py:136`

```
PUT /api/v1/admin/users/{user_id}
```

- `full_name`, `email`, `phone`, `username`, `is_super_admin`, `is_active` maydonlarini tahrirlaydi
- `password` berilsa, bcrypt bilan xeshlab yangilanadi (bo'sh qoldirilsa o'zgarmaydi)

### 2. Employee o'chirish endpointi qo'shildi
**Fayl**: `app/api/v1/cleaning_employees.py`

```
DELETE /api/v1/employees/{employee_id}
```

- Soft-delete: `is_active = false` qilinadi

### 3. Mehmonxona yaratilganda avtomatik default filial yaratish
**Fayl**: `app/api/v1/companies.py:106`

`POST /hotels` — mehmonxona yaratilganda avtomatik shu nomli default filial yaratiladi:
```python
branch = Branch(
    hotel_id=hotel.id,
    name=data.name,
    address=data.address,
    email=data.email,
    description=f"Default branch for {data.name}",
)
```

### 4. `company_id` filtrlari optional qilindi
**Fayllar**:
- `app/api/v1/companies.py:101` — `GET /hotels` da `company_id` endi majburiy emas
- `app/api/v1/cleaning_employees.py:20` — `GET /cleaning/tasks` da `company_id` endi majburiy emas
- `app/api/v1/cleaning_employees.py:104` — `GET /employees` da `company_id` endi majburiy emas

Filter logikasi: `company_id=None` bo'lsa barcha yozuvlar qaytadi.

---

## Frontend o'zgarishlari

### 1. Branches sahifasi qo'shildi
**Fayl**: `src/pages/Branches.tsx`

- Mehonxona tanlash dropdown → filiallar ro'yxati avtomatik yangilanadi
- Filial CRUD (yaratish, tahrirlash, status o'zgartirish)
- Modal forma: nom, manzil, email, telefon, ish vaqti (time picker), izoh

### 2. Hotels sahifasida filiallar ko'rinishi
**Fayl**: `src/pages/Hotels.tsx`

- Har bir mehmonxona qatorda **expand tugmasi** (▶/▼)
- Ochilganda filiallar: nomi, manzili, ish vaqti, statusi ko'rinadi
- Filial statusini shu yerda Active/Inactive qilish mumkin
- Branches ustunida filiallar soni ko'rsatiladi
- Backend'dan `/branches?hotel_id=X` orqali yuklanadi

### 3. Users sahifasi — to'liq qayta ishlandi
**Fayl**: `src/pages/Users.tsx`

- **2 ta tab**: System Users | Employees
- **System Users tab**:
  - Create User tugmasi → modal: Full Name, Username, Password, Email, Phone, Super Admin checkbox
  - Yaratilgandan keyin yashil oynada username + parol ko'rsatiladi
  - Edit tugmasi → modal: Full Name, Username, New Password (bo'sh qoldirilsa o'zgarmaydi), Email, Phone, Super Admin, Active checkbox
  - Status Active/Inactive toggle
- **Employees tab**:
  - Add Employee tugmasi → 3 bosqichli modal:
    1. Hotel & Branch (Company → Hotel → Branch, default branch avtomatik tanlanadi)
    2. Personal Info (Full Name, Position/Role dropdown, Department, Email, Phone)
    3. Login Account (checkbox — belgilansa username + parol generatsiya qilinadi, user yaratilgach avtomatik rol biriktiriladi)
  - Edit tugmasi → xodim ma'lumotlarini tahrirlash
  - Delete tugmasi (🗑️) → tasdiqlash so'raydi, soft-delete
  - Jadval: Employee, Position·Dept, Hotel·Branch, Contact, Status
- **Position — dinamik rolar**:
  - Hardcoded `POSITIONS` massivi olib tashlandi
  - Position dropdown endi `/api/v1/roles` dan olinadi
  - Rolga permission'lar `/roles` sahifasida biriktiriladi
  - "Create system account" tanlansa, user yaratilgach avtomatik rol biriktiriladi

### 4. `company_id=1` hardcoded filtrlari olib tashlandi
**Fayllar**: `Hotels.tsx`, `Users.tsx`, `Branches.tsx`

Barcha `api.get('/...', { params: { company_id: 1 } })` → `api.get('/...', { params: {} })` qilindi.

---

## Yangi tip qo'shilgan fayllar

| Fayl | Yangi interfeys |
|------|----------------|
| `src/types/index.ts` | `Branch`, `Employee` |

---

## Sidebar yangilanishi

| Qo'shilgan | Ikona |
|-----------|-------|
| Branches | `GitBranch` |

---

## API endpoint'lar xulosasi

| Method | Endpoint | O'zgarish |
|--------|----------|-----------|
| `PUT` | `/admin/users/{id}` | **Yangi** — user tahrirlash |
| `DELETE` | `/employees/{id}` | **Yangi** — xodim o'chirish |
| `POST` | `/hotels` | Avtomatik default branch yaratish qo'shildi |
| `GET` | `/hotels` | `company_id` optional bo'ldi |
| `GET` | `/employees` | `company_id` optional bo'ldi |
| `GET` | `/cleaning/tasks` | `company_id` optional bo'ldi |
