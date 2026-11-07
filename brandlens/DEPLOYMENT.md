# BrandLens — Production Deployment Guide
## Vercel (Frontend) + Render / Railway (Backend)

BrandLens is an enterprise full-stack platform consisting of:
1. **Frontend**: React 18 + Vite + TypeScript (Watermelon UI)
2. **Backend**: FastAPI + Python 3.11/3.14 + OpenCV/Pillow + Deterministic Rule Engine

---

### Step 1: Deploy Frontend on Vercel (2 Minutes)

#### Option A: via GitHub (Recommended)
1. Push your project to GitHub:
   ```bash
   git add .
   git commit -m "feat: BrandLens enterprise governance platform"
   git remote add origin https://github.com/YOUR_USERNAME/brandlens.git
   git push -u origin main
   ```
2. Open [vercel.com/new](https://vercel.com/new) and import your GitHub repository.
3. Configure project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (or `brandlens/frontend`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. (Optional) In **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://your-backend-url.onrender.com/api` (if backend is deployed separately)
5. Click **Deploy**! Your site is live on `https://brandlens.vercel.app`!

#### Option B: via Vercel CLI (From your terminal)
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. Login to your Vercel account:
   ```bash
   vercel login
   ```
3. Navigate into the frontend folder and deploy:
   ```bash
   cd brandlens/frontend
   vercel --prod
   ```

---

### Step 2: Deploy Backend on Render / Railway (Free & Instant)

FastAPI with Python dependencies (OpenCV, Pillow, ReportLab) runs best as a persistent web service:

#### Deploy to Render.com:
1. Go to [render.com](https://render.com) and click **New Web Service**.
2. Connect your GitHub repository.
3. Settings:
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt` (Root directory: `backend` or `brandlens/backend`)
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. In Environment Variables:
   - `ENABLE_PUBLIC_DEMO`: `true`
   - `LLM_PROVIDER`: `auto`
   - `SECRET_KEY`: `your-random-secret-key-2026`
5. Click **Create Web Service**. You will get a live URL like `https://brandlens-backend.onrender.com`.

---

### Step 3: Connect Frontend to Backend

In your Vercel Project Dashboard:
1. Go to **Settings** $\to$ **Environment Variables**.
2. Add:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://brandlens-backend.onrender.com/api`
3. Click **Redeploy** on Vercel.

Your complete full-stack BrandLens platform is now live on production HTTPS!
