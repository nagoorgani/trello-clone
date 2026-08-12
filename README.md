<div align="center">
  <h1>⚡ Trello Clone Pro (Full-Stack Production Ready)</h1>
  <p>A modern, high-performance, real-time Kanban and project management platform built with <strong>Next.js 15 (App Router)</strong>, <strong>NestJS</strong>, <strong>PostgreSQL</strong>, <strong>Prisma ORM</strong>, <strong>Socket.io</strong>, and <strong>Resend</strong>.</p>

  <p>
    <a href="https://github.com/nagoorgani/trello-clone/stargazers"><img src="https://img.shields.io/github/stars/nagoorgani/trello-clone?style=for-the-badge&color=2563eb" alt="Stars"></a>
    <a href="https://github.com/nagoorgani/trello-clone/network/members"><img src="https://img.shields.io/github/forks/nagoorgani/trello-clone?style=for-the-badge&color=4f46e5" alt="Forks"></a>
    <a href="https://github.com/nagoorgani/trello-clone/issues"><img src="https://img.shields.io/github/issues/nagoorgani/trello-clone?style=for-the-badge&color=059669" alt="Issues"></a>
    <img src="https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge" alt="License">
  </p>
</div>

---

## 🌟 Key Features

### 📋 1. Fluid Kanban Engine & Drag-and-Drop
- **0ms Visual Latency**: Instant optimistic UI updates powered by `@hello-pangea/dnd`.
- **Fractional Indexing**: Server-side floating-point order calculations for efficient list and card reordering.
- **Cross-Column Movement**: Move tasks seamlessly between status columns with real-time positional persistence.

### ⚡ 2. Real-Time Collaboration & Presence
- **Socket.io WebSockets**: Live synchronized board room channels (`board:${boardId}`).
- **Active Presence Indicators**: Live connected teammate avatars and active card views on board headers.
- **Zero-Refresh Sync**: Remote changes made by teammates reflect instantaneously across all open screens.

### 🔄 3. Multi-View Modes
- **Kanban Board**: Classic multi-column board with smooth horizontal momentum scroll.
- **Calendar View**: Interactive monthly due date scheduling and deadline tracking.
- **Table View**: Spreadsheet-style task management with inline filtering and sorting.
- **Analytics Dashboard**: Visual progress meters, checklist completion rates, and priority breakdown.

### 🃏 4. Rich Card Modals & Interactive Subtasks
- **Checklists & Confetti**: Interactive task checklists with percentage progress bars and celebratory confetti bursts on 100% completion.
- **Visual Cover Swatches**: Custom color palette bands and header accents.
- **Smart Due Dates**: Overdue and due-soon badges with status tags.
- **Color-Coded Labels & Discussion Feed**: Board-level label management, file attachments, and audit trail.

### 🤖 5. AI Copilot & Task Architect
- **Subtask Decomposition**: Auto-generate structured checklist criteria from feature descriptions.
- **User Story Formatter**: Generates standardized markdown templates with acceptance criteria and technical notes.

### 📧 6. Transactional Emails (Resend Integration)
- **Welcome Emails**: Branded onboarding email dispatched on registration.
- **Password Reset**: Secure 6-digit numeric verification code delivery with expiring validity.

### ⌨️ 7. Power Tools & Design System
- **Command Palette (`Cmd+K` / `Ctrl+K`)**: Fast keyboard shortcuts to navigate boards, create tasks, and switch themes.
- **Modern Aesthetics**: Sleek dark/light mode themes, glassmorphism, and custom scrollbars.
- **Data Portability**: Export board data to **JSON**, tabular format to **CSV**, and printable **PDF**.

---

## 🏗️ Architecture

```mermaid
graph TD
    Client["Frontend (Next.js 15 App Router - Hosted on Vercel)"]
    API["Backend (NestJS API + Swagger - Hosted on Render)"]
    WS["Real-Time Gateway (Socket.io WebSockets)"]
    DB[(PostgreSQL Database - Hosted on Neon / Supabase)]
    Mail["Resend Email API"]

    Client -->|REST API / HTTPS| API
    Client <-->|Live Mutations & Presence| WS
    API --> DB
    WS --> DB
    API -->|Transactional Emails| Mail
```

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, `@hello-pangea/dnd`, Zustand, Axios, canvas-confetti, date-fns, Lucide Icons |
| **Backend** | NestJS 10, TypeScript, Prisma ORM 6, PostgreSQL, Socket.io 4, Passport JWT, Resend SDK, Nodemailer, Swagger / OpenAPI, class-validator |
| **Cloud Hosting** | **Vercel** (Frontend) + **Render** (Backend & WebSockets) + **Neon** (Serverless PostgreSQL) + **Resend** (Emails) |

---

## 🚀 Quick Start (Local Development)

### 1. Clone Repository
```bash
git clone https://github.com/nagoorgani/trello-clone.git
cd trello-clone
```

### 2. Configure Environment Variables
- In `backend/.env`:
  ```env
  PORT=4000
  NODE_ENV=development
  DATABASE_URL="postgresql://user:password@localhost:5432/trello_clone?schema=public" # Or file:./dev.db for SQLite
  JWT_ACCESS_SECRET="your-super-secret-jwt-access-key-2026"
  JWT_REFRESH_SECRET="your-super-secret-jwt-refresh-key-2026"
  CLIENT_URL="http://localhost:3000"
  RESEND_API_KEY="re_your_resend_api_key"
  RESEND_FROM="Trello Clone <onboarding@resend.dev>"
  ```
- In `frontend/.env.local`:
  ```env
  NEXT_PUBLIC_API_URL="http://localhost:4000/api"
  NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
  ```

### 3. Install & Seed Database
```bash
# Backend setup
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed # Seeds demo user: demo@trello.dev / Password123!

# Frontend setup
cd ../frontend
npm install
```

### 4. Run Development Servers
```bash
# From root directory:
npm run dev
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000/api](http://localhost:4000/api)
- **Swagger Documentation**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)

---

## 🔑 Demo Login Credentials

- **Email**: `demo@trello.dev`
- **Password**: `Password123!`
*(Or click the **1-Click Demo Login** button on the sign-in page)*

---

## 🌐 Free Cloud Deployment Guide

### Step 1: Database ([Neon.tech](https://neon.tech))
1. Create a free project on Neon and copy your PostgreSQL connection string.

### Step 2: Backend ([Render.com](https://render.com))
1. Create a **Web Service** connected to `nagoorgani/trello-clone`.
2. Set **Root Directory**: `backend`
3. Set **Build Command**: `npm install --include=dev && npx prisma generate && npm run build`
4. Set **Start Command**: `npx prisma db push --accept-data-loss && node dist/main`
5. Set Environment Variables:
   - `DATABASE_URL`: *Your Neon PostgreSQL connection string*
   - `JWT_ACCESS_SECRET`: *Random string*
   - `JWT_REFRESH_SECRET`: *Random string*
   - `RESEND_API_KEY`: *Your Resend API Key*
   - `NODE_ENV`: `production`

### Step 3: Frontend ([Vercel.com](https://vercel.com))
1. Import `nagoorgani/trello-clone` on Vercel.
2. Set **Root Directory**: `frontend`
3. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: `https://your-render-service.onrender.com/api`
   - `NEXT_PUBLIC_SOCKET_URL`: `https://your-render-service.onrender.com`
4. Click **Deploy**.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
