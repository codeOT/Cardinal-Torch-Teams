# Team Center

Collaboration dashboard for departments: tasks, daily logs, activity feed, and comments. Built with Next.js, MongoDB, and JWT session auth.

## Setup

1. Copy environment variables:

```bash
cp .env.example .env.local
```

2. Configure `.env.local`:

- `MONGODB_URI` — local or Atlas connection string, **or** use `MONGODB_USER`, `MONGODB_PASSWORD`, and `MONGODB_HOST` (recommended for Atlas if the password has special characters)
- `AUTH_SECRET` — long random string (32+ characters)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME` — initial admin account for seeding

3. Test the database connection:

```bash
npm run db:test
```

If you see `bad auth : Authentication failed`, fix credentials in [MongoDB Atlas](https://cloud.mongodb.com) → **Database Access** (user/password) and **Network Access** (allow your IP), then copy a new connection string.

4. Install dependencies and seed the database:

```bash
npm install
npm run seed
```

5. Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Admins sign in and land on **`/admin`** to manage departments. Team members can **Sign up** at `/signup` (requires at least one department).

## Admin panel (`/admin`)

After signing in as an admin, you are taken to `/admin` where you can add departments. Use **Departments** in the sidebar to browse the workspace. Departments you create appear on the home page for all users.

Re-run `npm run seed` only on a fresh database — it wipes all data and recreates the single admin user from your env vars.

If admin login does not work after changing `.env.local`, run:

```bash
npm run ensure-admin
```

Then sign out and sign in again. `ADMIN_PASSWORD` must be at least 6 characters (`npm run seed` uses the same rule).

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run seed` — reset database and create admin user (requires `ADMIN_EMAIL` and `ADMIN_PASSWORD`)
