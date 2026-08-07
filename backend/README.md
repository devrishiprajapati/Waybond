# WayBond Backend

Separate Express + PostgreSQL backend for WayBond.

## Start

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate -- --name initial_schema
npm run dev
```

The API runs at `http://localhost:3002`. The connection string is in `backend/.env`.

## API

- `GET/POST/PUT/DELETE /api/trips`
- `GET/POST /api/heroSlides`
- `GET/POST/DELETE /api/testimonials`
- `GET/POST /api/users`
- `GET/PUT /api/community-galleries`
