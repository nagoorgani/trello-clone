# 🌐 Free Cloud Hosting & Deployment Guide

This guide walks you through hosting both the **Frontend** and **Backend** online for **100% free** with real-time WebSockets, PostgreSQL database, and automatic GitHub CI/CD deployments.

---

## 📋 Recommended Free Stack

| Component | Platform | Free Tier Benefits |
|---|---|---|
| **Source Code** | [GitHub](https://github.com) | Free unlimited public/private repositories & actions |
| **Database** | [Neon.tech](https://neon.tech) or [Supabase](https://supabase.com) | Free serverless PostgreSQL with connection pooling |
| **Backend API & WebSockets** | [Render.com](https://render.com) or [Railway](https://railway.app) | Free Web Service with Node.js & WebSocket support |
| **Frontend Web App** | [Vercel](https://vercel.com) | Free global CDN, instant Next.js App Router deploys |

---

## 1️⃣ Step 1: Push Code to GitHub

1. Open your browser and go to [github.com/new](https://github.com/new).
2. Create a new repository named `trello-clone` (choose **Public** or **Private**). Do **not** check "Initialize with README".
3. In your local terminal, run the following commands (replace `YOUR_GITHUB_USERNAME` with your actual username):

```bash
# Rename branch to main
git branch -M main

# Link your GitHub repository
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/trello-clone.git

# Push your code
git push -u origin main
```

---

## 2️⃣ Step 2: Create Free PostgreSQL Database (Neon or Supabase)

### Option A: Neon.tech (Fastest, 1-Click)
1. Go to [neon.tech](https://neon.tech) and sign up with GitHub.
2. Click **Create Project** -> Name it `trello-db`.
3. Copy the **Connection String** provided on your dashboard:
   ```text
   postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/trello-db?sslmode=require
   ```

*(Save this connection string — you will use it as `DATABASE_URL` in the backend).*

---

## 3️⃣ Step 3: Deploy Backend on Render.com

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. Click **New +** -> **Web Service**.
3. Select your GitHub repository (`trello-clone`).
4. Configure the service settings:
   - **Name**: `trello-backend-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npx prisma db push && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: `Free`
5. Click **Advanced** -> Add **Environment Variables**:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `4000` |
   | `DATABASE_URL` | *Paste your Neon / Supabase connection string from Step 2* |
   | `JWT_ACCESS_SECRET` | `your-super-secret-access-key-2026-production` |
   | `JWT_REFRESH_SECRET` | `your-super-secret-refresh-key-2026-production` |
   | `CLIENT_URL` | *Leave as `*` temporarily or set to your Vercel URL after Step 4* |
6. Click **Create Web Service**.
7. Once deployed, copy your Render URL (e.g. `https://trello-backend-api.onrender.com`).
8. *(Optional)* Seed initial data by running in the Render Shell tab: `npx prisma db seed`.

---

## 4️⃣ Step 4: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your `trello-clone` repository.
4. In the Project Configuration:
   - **Root Directory**: Click **Edit** and select `frontend`.
   - **Framework Preset**: `Next.js` (automatically detected).
5. Expand **Environment Variables** and add:
   | Key | Value | Example |
   |---|---|---|
   | `NEXT_PUBLIC_API_URL` | `https://your-render-url.onrender.com/api` | `https://trello-backend-api.onrender.com/api` |
   | `NEXT_PUBLIC_SOCKET_URL` | `https://your-render-url.onrender.com` | `https://trello-backend-api.onrender.com` |
6. Click **Deploy**.

---

## 5️⃣ Step 5: Final CORS Update

After Vercel deploys:
1. Copy your live Vercel domain (e.g., `https://trello-clone-pro.vercel.app`).
2. Go back to your Render Dashboard -> `trello-backend-api` -> **Environment**.
3. Update `CLIENT_URL` to `https://trello-clone-pro.vercel.app`.
4. Render will automatically re-deploy with CORS permissions!

---

## 🎉 You're Live!

Your production Trello Clone is now accessible worldwide with:
- ✅ **Frontend**: Hosted on Vercel with instant edge rendering
- ✅ **Backend API**: Hosted on Render with live WebSockets
- ✅ **Database**: Cloud PostgreSQL on Neon / Supabase
- ✅ **Auto-Deploy**: Every time you `git push origin main`, Vercel and Render deploy updates automatically!
