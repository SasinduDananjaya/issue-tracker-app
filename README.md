# 🛠️ Issuely - Issue Tracker App

## 🚀 Live Demo

```
https://issue-tracker-app-fe.vercel.app
```

A full-stack issue tracking application for managing and monitoring issues. Built with a RESTful Node.js backend and a React + TypeScript frontend.

---

## 💻 Tech Stack

### Backend

| Layer            | Technology                    |
| ---------------- | ----------------------------- |
| Runtime          | Node.js                       |
| Framework        | Express.js                    |
| ORM              | Prisma                        |
| Authentication   | JWT (Access + Refresh tokens) |
| Validation       | Zod                           |
| Password Hashing | bcryptjs                      |
| Security         | Helmet, CORS                  |

### Frontend

| Layer             | Technology           |
| ----------------- | -------------------- |
| Framework         | React + TypeScript   |
| Build Tool        | Vite                 |
| Routing           | React Router DOM     |
| Server State      | TanStack React Query |
| Client State      | Zustand              |
| Styling           | Tailwind CSS         |
| Component Library | shadcn/ui + Radix UI |
| Animations        | Framer Motion        |
| Forms             | React Hook Form      |
| Drag & Drop       | dnd-kit              |
| Notifications     | Sonner               |
| Icons             | Lucide React         |

### Database

- **PostgreSQL** — hosted on Supabase

---

## ✨ Features

### Core Features

- **Authentication** - Register, login, logout with JWT access/refresh token rotation (HTTP-only cookies)
- **Issue Management** - Create, view, edit and delete issues with title, description, due date and assignee
- **Issue Status Tracking** - `OPEN`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`
- **Priority & Severity Levels** - `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- **Kanban Board** - Drag-and-drop issue cards across status columns
- **List View** - Paginated table view of all issues
- **Filtering & Search** - Filter by status, priority, severity, assignee, creator and due date range
- **Activity Log** - Paginated audit trail of all issue changes
- **Status Summary Cards** - Live count of issues per status

### Extra Features

- **Deployed on Vercel** - Frontend and backend deployed and publicly accessible
- **TypeScript Frontend** - TypeScript React frontend
- **Zustand State Management** - Lightweight global state for auth and filter state
- **Reusable Component Design** - Shared `StatusBadge`, `PriorityBadge`, `SeverityBadge`, `UserAvatar`, `Pagination` and `ConfirmDialog` components used throughout the app
- **Soft Deletes** - Issues are soft-deleted (retaining history) rather than permanently removed

---

## Setup Instructions

### Prerequisites

- Node.js
- PostgreSQL database (or a [Supabase](https://supabase.com) project)

### 1. Clone the Repository

```bash
git clone https://github.com/SasinduDananjaya/issue-tracker-app.git
cd issue-tracker-app
```

### 2. Install Dependencies

**Backend:**

```bash
cd backend
npm install
```

**Frontend:**

```bash
cd ../frontend
npm install
```

### 3. Configure Environment Variables

**Backend - create `backend/.env`:**

```env
PORT=YOUR_BE_PORT_NUMBER
NODE_ENV=development
FRONTEND_URL=http://localhost:YOUR_FE_PORT_NUMBER

JWT_SECRET=your_jwt_secret_here
ACCESS_TOKEN_EXPIRY=a_short_time
REFRESH_TOKEN_EXPIRY_DAYS=num_of_days

DATABASE_URL=your_postgresql_connection_pooling_url
DIRECT_URL=your_postgresql_direct_url
```

**Frontend - create `frontend/.env`:**

```env
VITE_BACKEND_BASE_URL=http://localhost:YOUR_BE_PORT_NUMBER/api
```

### 4. Generate Prisma Client & Run Migrations

```bash
cd backend
npx prisma migrate dev
npx prisma generate
```

### 5. Run the Application

**Backend** (from `backend/`):

```bash
npm run dev
```

**Frontend** (from `frontend/`):

```bash
npm run dev
```

The frontend will be available at `http://localhost:YOUR_FE_PORT_NUMBER` and the backend at `http://localhost:YOUR_BE_PORT_NUMBER`.
