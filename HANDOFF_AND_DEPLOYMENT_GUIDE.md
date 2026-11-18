# Complete Setup & Deployment Guide for Your Friend

This document contains everything needed to extract, run, test, and deploy this project from scratch on any computer.

---

## 1. What You (The Sender) Must Do Before Zipping

Do **not** zip `node_modules`, `bin`, or `obj` folders because they contain thousands of machine-specific files that make the zip huge (300MB+) and cause path-length errors on Windows.

### Clean Script (Run this in PowerShell in the project root):
```powershell
# Remove build artifacts and node_modules to keep the zip tiny (~2MB)
Remove-Item -Recurse -Force "frontend\node_modules" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "frontend\dist" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "backend\bin" -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force "backend\obj" -ErrorAction SilentlyContinue
```

Then simply right-click the `PP Project` folder -> **Send to** -> **Compressed (zipped) folder** (or use 7-Zip).

---

## 2. Prerequisites Your Friend Must Install on Her PC

Before running the project, she needs these three free tools:

1. **.NET 8.0 SDK** (Required for backend):
   - Download & install: [https://dotnet.microsoft.com/download/dotnet/8.0](https://dotnet.microsoft.com/en-us/download/dotnet/8.0)
   - Verify in terminal: `dotnet --version` (should output `8.0.x`)
2. **Node.js (v18 or higher)** (Required for frontend):
   - Download & install: [https://nodejs.org](https://nodejs.org) (LTS version)
   - Verify in terminal: `node --version` and `npm --version`
3. **Database** (Choose either A or B):
   - **Option A (Easiest if Docker is installed)**: Docker Desktop ([https://www.docker.com/products/docker-desktop/](https://www.docker.com/products/docker-desktop/))
   - **Option B (Native Windows Service)**: SQL Server 2022 Express ([https://www.microsoft.com/en-us/sql-server/sql-server-downloads](https://www.microsoft.com/en-us/sql-server/sql-server-downloads))
4. **Judge0 API Key (Free)**:
   - Sign up for a free key at RapidAPI: [https://rapidapi.com/judge0-official/api/judge0-ce](https://rapidapi.com/judge0-official/api/judge0-ce)
   - Click "Subscribe to Test" (Free tier: 50 requests/day).

---

## 3. Step-by-Step Local Run Instructions (For Your Friend)

### Step 1: Extract the Zip
- Unzip the project folder to a convenient path, e.g., `C:\Projects\CodingAssessment`.

### Step 2: Start SQL Server Database

**If using Docker Desktop:**
1. Open Docker Desktop.
2. Open PowerShell in the project folder and run:
   ```powershell
   docker compose up -d
   ```
   *(This launches SQL Server 2022 in the background on port 1433).*

**If using local SQL Server Express:**
1. Open `backend/appsettings.json`.
2. Change the connection string to:
   ```json
   "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=CodingAssessmentDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true"
   ```

### Step 3: Configure Judge0 API Key
1. Open `backend/appsettings.json`.
2. Paste her RapidAPI key inside `"ApiKey"`:
   ```json
   "Judge0": {
     "BaseUrl": "https://judge0-ce.p.rapidapi.com",
     "ApiKey": "PASTE_RAPIDAPI_KEY_HERE",
     "RapidApiHost": "judge0-ce.p.rapidapi.com",
     "UseRapidApi": true,
     "CpuTimeLimit": 3.0,
     "MemoryLimitKb": 128000
   }
   ```

### Step 4: Run the Backend API
1. Open a terminal / PowerShell window and navigate to the `backend` folder:
   ```powershell
   cd backend
   dotnet restore
   dotnet run
   ```
2. The backend will automatically apply migrations, seed the database with admin and candidate accounts, and start listening on:
   - **`http://localhost:5000`**
3. She can verify it works by opening Swagger in her browser:
   - **`http://localhost:5000/swagger`**

### Step 5: Run the React Frontend
1. Open a **second** terminal / PowerShell window and navigate to the `frontend` folder:
   ```powershell
   cd frontend
   npm install
   npm run dev
   ```
2. Open her browser at:
   - **`http://localhost:5173`**

### Step 6: Log In & Test
She can use the 1-click **Fill Admin** and **Fill Candidate** buttons on the login screen, or enter:
- **Admin**: `admin@assessment.com` / `Admin@Password123!`
- **Candidate**: `candidate@assessment.com` / `Candidate@Password123!`

---

## 4. How to Deploy the Platform to the Cloud (Production)

There are two primary ways to deploy:

---

### Deployment Approach A: Cloud PaaS (Recommended: Render / Railway + Vercel)

This is the easiest, lowest-cost deployment model without configuring VPS servers.

#### 1. Deploy the Database
- Use a hosted SQL Server database (e.g. **Azure SQL Database free tier**, **Aiven**, or **Render PostgreSQL** with EF Core provider).
- Note down the connection string: `Server=...;Database=...;User Id=...;Password=...;`.

#### 2. Deploy Backend to Render or Railway
- Push the code to a GitHub repository.
- On [Render.com](https://render.com) or [Railway.app](https://railway.app), create a new **Web Service** connected to your repository.
- Root Directory: `backend`
- Environment: **Docker** (using the included `backend/Dockerfile`) or **.NET 8**.
- Environment Variables to set in the dashboard:
  - `ConnectionStrings__DefaultConnection` = `<your-production-sql-connection-string>`
  - `Judge0__ApiKey` = `<your-rapidapi-key>`
  - `Judge0__BaseUrl` = `https://judge0-ce.p.rapidapi.com`
  - `JwtSettings__SecretKey` = `AStrongRandomSecretKeyOfAtLeast32Characters!`
- Deploy! Render/Railway will assign a public URL, e.g. `https://coding-assessment-api.onrender.com`.

#### 3. Deploy Frontend to Vercel or Netlify
- On [Vercel.com](https://vercel.com) or [Netlify.com](https://netlify.com), click **Add New Project** and link the repository.
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `VITE_API_URL` = `https://coding-assessment-api.onrender.com/api` (The deployed backend URL from step 2).
- Click **Deploy**! The app is live.

---

### Deployment Approach B: Single VPS via Docker Compose (DigitalOcean / AWS EC2 / Hetzner)

If she has a Linux VPS (Ubuntu 22.04 / 24.04):
1. Install Docker & Docker Compose on the VPS:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose
   ```
2. Clone the repository onto the server.
3. Build and launch:
   ```bash
   docker compose up -d --build
   ```
4. Configure Nginx with SSL (Certbot) to proxy port 80/443 to the frontend and backend.

---

## 5. Verification Checklist for Demonstration

When demonstrating the project, follow this 4-step sequence:
1. **Admin Login**: Log in as `admin@assessment.com`, view the dashboard metrics, and navigate to **Manage Assessments**.
2. **Create Assessment & Questions**: Show how sample test cases and **hidden test cases** are configured. Explain that hidden test cases are never leaked to candidate browsers.
3. **Candidate Assessment**: Log in as `candidate@assessment.com`, enter the assessment, write code in Python/C#/C++/Java, click **Run Code** (tests visible sample), then **Submit Solution** (evaluates against hidden test cases via Judge0).
4. **Leaderboard & Submissions**: Log back in as Admin, check **Results & Rankings** to show candidate scores, and check **Submissions** to inspect submitted source code.
