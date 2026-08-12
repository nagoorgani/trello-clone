# 🚀 Trello Clone Pro (Full-Stack Production Ready)

A modern, high-performance, real-time Kanban and project management platform built with **Next.js 15 (App Router)**, **NestJS**, **PostgreSQL**, **Prisma ORM**, and **Socket.io**.

---

## 🌟 Key Features

- 📋 **Fluid Kanban Engine**: Multi-column drag-and-drop with optimistic 0ms UI updates, fractional indexing reordering, and cross-list card movement.
- ⚡ **Real-Time Collaboration**: Live WebSockets (Socket.io) synchronized across all active users with live presence indicators and cursor states.
- 🔄 **Multi-View Modes**:
  - **Kanban Board**: Classic interactive card columns.
  - **Calendar View**: Monthly due date planning.
  - **Table View**: Spreadsheet-style bulk overview.
  - **Analytics Dashboard**: Completion velocity, priority distribution, and checklist progress meters.
- 🤖 **AI Copilot**: Automated subtask checklist generator, markdown task descriptions, and summary engine.
- ⌨️ **Command Palette (`Cmd+K` / `Ctrl+K`)**: Instant keyboard navigation to boards, task creation, and view toggling.
- 🎨 **Modern Design System**: Dark and light theme modes, glassmorphic UI, custom scrollbars, and Linear/Notion-inspired aesthetics.
- 🔒 **Enterprise-Grade Security**: JWT authentication with automatic HttpOnly refresh token rotation, bcrypt password hashing, and role-based access control (RBAC).
- 📤 **Data Portability**: Export entire boards and tasks to **JSON**, **CSV**, and printable **PDF**.
- 🐳 **Docker & Production Ready**: Multi-stage container builds and Docker Compose orchestration.

---

## 🏗️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, `@hello-pangea/dnd`, Zustand, TanStack Query |
| **Backend** | NestJS, TypeScript, Prisma ORM, PostgreSQL, Socket.io, Passport JWT, Swagger/OpenAPI |
| **DevOps** | Docker, Docker Compose, Multi-stage builds |

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js `v18+` (tested on Node 20 / 24)
- PostgreSQL database (or Docker)

### 2. Setup Environment Variables
- In `backend/.env`:
  ```env
  PORT=4000
  NODE_ENV=development
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trello_clone?schema=public"
  JWT_ACCESS_SECRET="super-secret-jwt-access-key-production-ready-2026"
  JWT_REFRESH_SECRET="super-secret-jwt-refresh-key-production-ready-2026"
  CLIENT_URL="http://localhost:3000"
  ```
- In `frontend/.env.local`:
  ```env
  NEXT_PUBLIC_API_URL="http://localhost:4000/api"
  NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
  ```

### 3. Database Migration & Seeding
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed # or npm run prisma:seed
```

### 4. Run Development Servers
From the root directory:
```bash
npm run dev
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:4000/api](http://localhost:4000/api)
- Swagger API Docs: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 🔑 Demo Login Credentials

- **Email**: `demo@trello.dev`
- **Password**: `Password123!`
*(Or click the 1-Click Demo Login button on the Login page)*

---

## 🐳 Docker Deployment

To launch the complete stack (PostgreSQL + NestJS API + Next.js Web):
```bash
docker-compose up --build
```
