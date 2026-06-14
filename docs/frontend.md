# Frontend — Super Admin Panel

**Yaratilgan sana**: 2026-06-14  
**Framework**: React 18 + TypeScript + Vite

## Texnologiyalar

| Paket | Versiya | Vazifasi |
|-------|---------|----------|
| React | 18 | UI framework |
| TypeScript | 5.x | Type-safe development |
| Vite | 8.x | Build tool & dev server |
| Tailwind CSS v4 | 4.x | Utility-first CSS |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client (auto-refresh token) |
| Lucide React | 0.x | Minimalistik ikonkalar |

## Struktura

```
AdminFrontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx          # Chap menyu navigatsiyasi
│   │   │   ├── Header.tsx           # Yuqori bar (status + logout)
│   │   │   └── Layout.tsx           # Asosiy layout wrapper
│   │   └── ui/
│   │       ├── Badge.tsx            # Status badge komponenti
│   │       ├── Modal.tsx            # Modal oyna (ESC yopish)
│   │       └── Spinner.tsx          # Loading animatsiyasi
│   ├── pages/
│   │   ├── Login.tsx                # Super admin login
│   │   ├── Dashboard.tsx            # Statistika kartalari
│   │   ├── Companies.tsx            # Kompaniyalar CRUD + qidiruv
│   │   ├── Hotels.tsx               # Mehmonxonalar CRUD
│   │   ├── Users.tsx                # Foydalanuvchilar ro'yxati
│   │   ├── Roles.tsx                # Rollar + Permission'lar
│   │   ├── AuditLogs.tsx            # Audit log jadvali
│   │   ├── Settings.tsx             # Tizim sozlamalari
│   │   └── Notifications.tsx        # Bildirishnomalar
│   ├── hooks/
│   │   └── useAuth.ts               # Auth hook (login, logout, user)
│   ├── lib/
│   │   └── api.ts                   # Axios instance (JWT auto-refresh)
│   ├── types/
│   │   └── index.ts                 # TypeScript interfeyslar
│   ├── App.tsx                      # Router + ProtectedRoute
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Tailwind import
├── vite.config.ts                   # Vite config + API proxy
├── tsconfig.json
└── package.json
```

## Ishlash prinsipi

1. **Login**: Super admin `username` va `password` bilan kiradi
2. **Token**: JWT `access_token` + `refresh_token` localStorage'da saqlanadi
3. **Auto-refresh**: 401 xatolik bo'lsa, axios interceptor refresh token orqali yangi access token oladi
4. **ProtectedRoute**: Har bir sahifa `useAuth()` hook orqali super admin ekanligini tekshiradi
5. **API proxy**: Vite dev server `/api` so'rovlarni `http://localhost:8000` ga proxy qiladi

## Ishlatish

```bash
cd AdminFrontend
npm install
npm run dev        # http://localhost:3000
npm run build      # Production build → dist/
```

## Backend bilan bog'liqlik

Frontend **mustaqil** ishlaydi — backend ga hech qanday o'zgartirish kiritilmadi.  
Faqat `vite.config.ts` da API proxy sozlangan:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true,
    },
  },
}
```

Backend `:8000` portda, frontend `:3000` portda ishlaydi.
