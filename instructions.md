# HelpDesk Ticket System

A simple internal helpdesk tool for raising and managing support tickets.

---

## Features

- User login with JWT authentication
- Create and view your own tickets
- Comment on tickets
- Admin panel: view all tickets, update status
- Email notifications via Power Automate webhook
- Seeded with real-looking users from DummyJSON

---

## Tech Stack

| Layer      | Technology                     |
|------------|-------------------------------|
| Frontend   | React + TypeScript + MUI       |
| Backend    | Node.js + Express              |
| Database   | Supabase (PostgreSQL, free)    |
| Auth       | JWT (jsonwebtoken + bcryptjs)  |
| Email      | Power Automate (HTTP webhook)  |
| Hosting FE | Vercel / Netlify               |
| Hosting BE | Render / Railway               |

---

## Project Structure

```
helpdesk/
├── frontend/
│   ├── public/index.html
│   ├── src/
│   │   ├── api/client.js         # Axios instance with JWT interceptor
│   │   ├── context/AuthContext.js # Global user/auth state
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── StatusBadge.js
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── MyTickets.js
│   │   │   ├── CreateTicket.js
│   │   │   ├── TicketDetail.js
│   │   │   └── AdminPanel.js
│   │   ├── App.js
│   │   └── index.js
│   ├── vercel.json
│   └── package.json
│
└── backend/
    ├── db/
    │   ├── supabase.js           # Supabase client
    │   └── schema.sql            # Run this in Supabase SQL editor
    ├── middleware/
    │   └── auth.js               # JWT + admin guard
    ├── routes/
    │   ├── auth.js               # Login + seed endpoint
    │   ├── tickets.js            # CRUD for tickets
    │   └── comments.js           # Add comments
    ├── index.js                  # Express entry point
    ├── render.yaml               # Render deployment config
    └── package.json
```

---

## Step-by-step Setup

### 1. Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → create a free project
2. Open **SQL Editor** → paste the contents of `backend/db/schema.sql` → Run
3. Go to **Project Settings → API**:
   - Copy **Project URL** → `SUPABASE_URL`
   - Copy **service_role** key (not anon) → `SUPABASE_SERVICE_KEY`

---

### 2. Backend (Local)

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_URL, SUPABASE_SERVICE_KEY, JWT_SECRET (any random string)
npm install
npm run dev
# Server runs on http://localhost:4000
```

**Seed users** (run once after starting the server):

```bash
curl -X POST http://localhost:4000/api/auth/seed
```

This pulls 10 users from DummyJSON and inserts them. The **first user becomes admin**. All passwords are set to `password123`.

Copy the admin email from the response, then log in with it.

---

### 3. Frontend (Local)

```bash
cd frontend
cp .env.example .env
# REACT_APP_API_URL=http://localhost:4000
npm install
npm start
# App runs on http://localhost:3000
```

---

### 4. Power Automate (Email Notifications)

1. Go to [make.powerautomate.com](https://make.powerautomate.com)
2. Create a new flow → trigger: **"When an HTTP request is received"**
3. Set method to POST, save to get the webhook URL
4. Add action: **Send an email (V2)** using your Outlook/Office365 account
5. Map these fields from the request body:
   - `To` → `userEmail`
   - `Subject` → `Ticket Update: ` + `ticketTitle`
   - `Body` → `Hi ` + `userName` + `, your ticket status changed to ` + `newStatus`
6. Copy the webhook URL → paste into `.env` as `POWER_AUTOMATE_WEBHOOK_URL`

The backend calls this webhook automatically when an admin updates a ticket's status.

---

## Deployment

### Backend → Render

1. Push your `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com) → New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `node index.js`
5. Add environment variables from your `.env`

### Frontend → Vercel

1. Push your `frontend/` folder to a GitHub repo (can be same repo, different folder)
2. Go to [vercel.com](https://vercel.com) → New Project → connect repo
3. Set **Root Directory** to `frontend`
4. Add environment variable: `REACT_APP_API_URL` = your Render backend URL
5. Deploy

---

## API Reference

| Method | Endpoint              | Auth     | Description                  |
|--------|-----------------------|----------|------------------------------|
| POST   | /api/auth/login       | None     | Login, returns JWT           |
| POST   | /api/auth/seed        | None     | Seed 10 users from DummyJSON |
| GET    | /api/tickets          | User     | Get own tickets (admin: all) |
| GET    | /api/tickets/:id      | User     | Get ticket + comments        |
| POST   | /api/tickets          | User     | Create a ticket              |
| PATCH  | /api/tickets/:id      | Admin    | Update ticket status         |
| POST   | /api/comments         | User     | Add comment to a ticket      |

---

## Ticket Statuses

| Status      | Meaning                        |
|-------------|-------------------------------|
| open        | Newly submitted, awaiting help |
| in_progress | Admin is working on it         |
| closed      | Resolved, no new comments      |

---

## Default Credentials (after seeding)

- All passwords: `password123`
- Admin: first user from the seed response (check terminal output)
- Users: the remaining 9 users

---

## Notes for Beginners

- The backend uses **no ORM** — just the Supabase JS client with simple query builder calls
- Auth is handled with a single JWT middleware function — no library magic
- The frontend stores the token in `localStorage` and attaches it to every request via an Axios interceptor
- Power Automate is entirely optional — the app works fine without it; the webhook call is non-blocking and won't crash the server if it fails
