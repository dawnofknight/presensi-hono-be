# Presensi Backend API

Backend API for Presensi Employee App using Hono framework.

## Tech Stack

- **Hono** - Lightweight web framework
- **Prisma** - ORM for PostgreSQL
- **TypeScript** - Type safety
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

## Local Development

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL and JWT secret

# Generate Prisma Client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database (optional)
npm run db:seed

# Start dev server
npm run dev
```

Server runs on `http://localhost:3001`

## Deploy to Vercel

### Prerequisites

1. PostgreSQL database (Vercel Postgres, Supabase, or Neon)
2. Vercel account

### Steps

1. Push code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. Deploy to Vercel:

   - Go to https://vercel.com/new
   - Import your repository
   - Add environment variables:
     - `DATABASE_URL` - Your PostgreSQL connection string
     - `JWT_SECRET` - Secure random string
   - Deploy!

3. Run migrations on production database:

```bash
DATABASE_URL="your-prod-db-url" npx prisma migrate deploy
DATABASE_URL="your-prod-db-url" npx prisma db seed
```

## API Endpoints

### Auth

- `POST /api/auth/login` - Login

### Attendance (requires auth)

- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/user` - Get user attendance history
- `POST /api/attendance/checkin` - Check-in
- `PUT /api/attendance/checkout/:id` - Check-out

### Admin (requires admin role)

- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/attendances` - All attendances
- `GET /api/admin/employees` - All employees
- `GET /api/admin/settings` - Get settings
- `POST /api/admin/settings` - Update settings

### User (requires auth)

- `POST /api/user/change-password` - Change password

## Environment Variables

| Variable       | Description                          |
| -------------- | ------------------------------------ |
| `DATABASE_URL` | PostgreSQL connection string         |
| `JWT_SECRET`   | Secret key for JWT tokens            |
| `NODE_ENV`     | Environment (development/production) |
| `PORT`         | Server port (default: 3001)          |
