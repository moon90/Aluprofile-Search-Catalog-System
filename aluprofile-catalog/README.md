# Aluprofile Catalog (Node.js + React)

This monorepo contains:
- `apps/backend`: NestJS API + Prisma/PostgreSQL
- `apps/frontend`: React + Vite web client

## Requirements
- Node.js 20+
- PostgreSQL

## 1. Backend setup
From `aluprofile-catalog/apps/backend`:

```bash
npm install
```

Set `.env` values:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/aluprofile?schema=public"
CLERK_SECRET_KEY=
CLERK_BOOTSTRAP_ADMIN_USER_IDS=
SENTRY_DSN=
SENTRY_TRACES_SAMPLE_RATE=0.1
```

Run Prisma and start API:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```

API base: `http://localhost:3000/api`

Main routes:
- `GET /api/health`
- `GET /api/auth/me` (Clerk token check)
- `GET /api/public/overview`
- `GET /api/public/profiles`
- `GET /api/public/profiles/:id`
- `GET /api/admin/reference-data` (Clerk role/permission protected)
- `CRUD /api/admin/suppliers` (Clerk role/permission protected)
- `CRUD /api/admin/applications` (Clerk role/permission protected)
- `CRUD /api/admin/cross-sections` (Clerk role/permission protected)
- `CRUD /api/admin/profiles` (Clerk role/permission protected)
- `POST /api/admin/uploads` (Clerk role/permission protected, multipart `file`)
- `GET/POST/DELETE /api/admin/user-access` (Admin only; role/permission management)

## 2. Frontend setup
From `aluprofile-catalog/apps/frontend`:

```bash
npm install
```

Optional `.env`:

```env
VITE_API_BASE=http://localhost:3000/api
VITE_CLERK_PUBLISHABLE_KEY=
VITE_SENTRY_DSN=
VITE_SENTRY_TRACES_SAMPLE_RATE=0.1
```

Run:

```bash
npm run dev
```

Frontend default URL: `http://localhost:5173`

## Notes
- Public pages include overview, filterable profile list, and profile detail.
- App roles are `ADMIN`, `MANAGER`, `USER` with permission-based route protection.
- `ADMIN` can manage all user roles and permissions from the admin panel.
- Set `CLERK_BOOTSTRAP_ADMIN_USER_IDS` once to grant initial admin access by Clerk user ID.
- UI stack uses Tailwind CSS + shadcn-style local components.
- Sentry is initialized in frontend and backend when DSN variables are set.
- i18n-ready structure is included with EN/DE text dictionary in the frontend.
