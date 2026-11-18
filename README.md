# Secure Online Coding Assessment and Programming Skill Evaluation Platform

A full-stack, enterprise-grade online coding evaluation system built with **ASP.NET Core 8 Web API** and **React.js**. The platform enables administrators to create, schedule, and oversee programming assessments with automated test-case evaluation, while candidates solve problems in an integrated online code editor with live compilation and scoring powered by the **Judge0 API**.

---

## Architecture Overview

```
                           +--------------------------------------+
                           |            React Frontend            |
                           |  (Vite + React Router + Monaco Ed.)  |
                           +--------------------------------------+
                                              |
                                   REST API / JWT Bearer
                                              v
                           +--------------------------------------+
                           |        ASP.NET Core 8 Web API        |
                           |  Controllers, Services, Enums, DTOs  |
                           +--------------------------------------+
                                   /                      \
                    EF Core (SQL) /                        \ HTTPS
                                 v                          v
             +-----------------------+          +-------------------------+
             |    SQL Server DB      |          |       Judge0 API        |
             | Users, Attempts,      |          | Isolated Sandbox Runner |
             | TestCases, Results    |          | (C#, C++, Java, Python) |
             +-----------------------+          +-------------------------+
```

---

## 1. Prerequisites Needed from Your Side

To build and run this application locally, please verify the following on your machine:

| Component | Required Version | Status / Notes |
| :--- | :--- | :--- |
| **.NET SDK** | **.NET 8.0 SDK** (or .NET 9.0 SDK) | Download from [dotnet.microsoft.com/download](https://dotnet.microsoft.com/en-us/download/dotnet/8.0). *(Currently, .NET runtimes are installed on your machine, but the SDK compiler `dotnet build` requires the .NET 8 SDK installer).* |
| **Node.js & npm** | **Node.js 18+** / **npm 9+** | Already installed on your system (Node v24.11.1 / npm 11.2.0). |
| **SQL Server** | **SQL Server 2019/2022**, LocalDB, or **Docker** | You can run SQL Server in 5 seconds via `docker compose up -d` using the included `docker-compose.yml`, or connect to an existing SQL Server / LocalDB instance. |
| **Judge0 Access** | **RapidAPI Key** or **Self-hosted instance** | Free RapidAPI Judge0 CE account: sign up at [rapidapi.com/judge0-official/api/judge0-ce](https://rapidapi.com/judge0-official/api/judge0-ce) to get your free API key, or use a local Docker Judge0 instance. |

---

## 2. Default Seed Accounts

The platform automatically seeds initial administrator and candidate accounts on first startup:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@assessment.com` | `Admin@Password123!` | Full CRUD for Assessments, Question & Hidden Test Case Management, Submission Monitoring, Rankings |
| **Candidate** | `candidate@assessment.com` | `Candidate@Password123!` | Candidate Dashboard, Taking Assessments, Monaco Code Editor, Submissions & Scores History |

> **Note**: You can also register new candidate accounts freely at the `/register` page.

---

## 3. Quick Start Guide

### Step 1: Start SQL Server

If you have Docker installed, start the SQL Server container from the project root:
```bash
docker compose up -d
```
*(If you have SQL Server Express or LocalDB installed locally, update the connection string in `backend/appsettings.json` to match your local instance).*

### Step 2: Configure Judge0 Credentials

Open `backend/appsettings.json` and insert your RapidAPI key for Judge0:
```json
"Judge0": {
  "BaseUrl": "https://judge0-ce.p.rapidapi.com",
  "ApiKey": "YOUR_RAPIDAPI_KEY_HERE",
  "RapidApiHost": "judge0-ce.p.rapidapi.com",
  "UseRapidApi": true,
  "CpuTimeLimit": 3.0,
  "MemoryLimitKb": 128000
}
```

### Step 3: Run the Backend Web API

From the `backend` directory:
```bash
cd backend
dotnet restore
dotnet run
```
The API server will initialize on `http://localhost:5000` (or `https://localhost:5001`).
Swagger API documentation will be accessible at: `http://localhost:5000/swagger`.

### Step 4: Run the React Frontend

From the `frontend` directory in a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open your browser and navigate to: `http://localhost:5173`.

---

## 4. Key Functional Modules

### Module 1: Authentication & Authorization
- ASP.NET Core Identity with password hashing and policy enforcement.
- Signed JWT Bearer tokens with user identifier, email, and role claims.
- Role-based route protection on the frontend (`<ProtectedRoute allowedRole="..." />`).
- Backend authorization attributes (`[Authorize(Roles = AppRoles.Administrator)]`) to strictly forbid candidates from administrative endpoints.

### Module 2: Administrator Dashboard & Management
- Real-time overview of candidate count, active assessments, and total submissions.
- Complete CRUD operations for programming assessments (Title, Duration, Schedule Window, Total Marks, Published status).
- Question authoring suite:
  - Difficulty level (Easy, Medium, Hard).
  - Programming language restrictions.
  - Sample test cases (visible in the problem statement).
  - Hidden test cases (used exclusively for automatic grading).
  - **Data Privacy**: Candidate-facing endpoints never expose hidden test case inputs or outputs.

### Module 3: Online Coding Environment & Judge0 Integration
- Multi-language code editor powered by **Monaco Editor** (VS Code's core editor).
- Language support: **C#**, **C++**, **Java**, and **Python 3**.
- **Run Code**: Compiles and executes code against sample test cases (or user-defined custom input) via Judge0 without recording final marks.
- **Submit Solution**: Compiles and runs against all hidden test cases, calculates pro-rated score weights, determines status (`Accepted`, `Wrong Answer`, `Compilation Error`, `Runtime Error`, `Time Limit Exceeded`), and saves results to SQL Server.
- Isolated sandbox execution guarantees that untrusted candidate code is never executed on the host server.

### Module 4: Server-Side Timer & Assessment Integrity
- Countdown timer starts from server-side `StartedAt` timestamp.
- Deadline is calculated as `min(StartedAt + DurationMinutes, Assessment.EndTime)`.
- Enforces single active attempt per candidate per assessment.
- Automatic draft saving every few seconds to prevent work loss.
- Automatic final submission upon timer expiration.
- Submission requests sent after the server deadline are strictly rejected with HTTP 400.

### Module 5: Results & Leaderboard
- Assessment-wise rankings sorted by total marks obtained and earliest submission time.
- Candidate results breakdown displaying status and marks earned per question.
- Admin submission audit trail with full code inspector modal.

---

## 5. Directory Structure

```
├── backend/
│   ├── Controllers/
│   │   ├── AdminController.cs
│   │   ├── AssessmentsController.cs
│   │   ├── AttemptsController.cs
│   │   ├── AuthController.cs
│   │   ├── CodeController.cs
│   │   ├── QuestionsController.cs
│   │   └── ResultsController.cs
│   ├── Data/
│   │   ├── ApplicationDbContext.cs
│   │   └── DbInitializer.cs
│   ├── DTOs/
│   │   ├── AdminDtos.cs
│   │   ├── AssessmentDtos.cs
│   │   ├── AttemptDtos.cs
│   │   ├── AuthDtos.cs
│   │   ├── CodeExecutionDtos.cs
│   │   ├── QuestionDtos.cs
│   │   └── ResultDtos.cs
│   ├── Helpers/
│   │   ├── Judge0Settings.cs
│   │   ├── JwtSettings.cs
│   │   └── LanguageMapping.cs
│   ├── Models/
│   │   ├── ApplicationUser.cs
│   │   ├── Assessment.cs
│   │   ├── AssessmentAttempt.cs
│   │   ├── DraftCode.cs
│   │   ├── Enums.cs
│   │   ├── Question.cs
│   │   ├── Submission.cs
│   │   ├── SubmissionResult.cs
│   │   └── TestCase.cs
│   ├── Services/
│   │   ├── AssessmentAttemptService.cs
│   │   ├── AssessmentService.cs
│   │   ├── AuthService.cs
│   │   ├── ExecutionService.cs
│   │   ├── Judge0Service.cs
│   │   ├── QuestionService.cs
│   │   └── ResultService.cs
│   ├── appsettings.json
│   ├── CodingAssessment.Api.csproj
│   ├── Dockerfile
│   └── Program.cs
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── Timer.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── layouts/
│   │   │   ├── AdminLayout.jsx
│   │   │   └── CandidateLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── AssessmentForm.jsx
│   │   │   │   ├── AssessmentsList.jsx
│   │   │   │   ├── CandidatesList.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── QuestionForm.jsx
│   │   │   │   ├── QuestionsList.jsx
│   │   │   │   ├── ResultsLeaderboard.jsx
│   │   │   │   └── SubmissionsList.jsx
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   └── Register.jsx
│   │   │   └── candidate/
│   │   │       ├── AssessmentHistory.jsx
│   │   │       ├── AssessmentInstructions.jsx
│   │   │       ├── AvailableAssessments.jsx
│   │   │       ├── CodingEnvironment.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       └── SubmissionResults.jsx
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── api.js
│   │   │   ├── assessmentService.js
│   │   │   ├── authService.js
│   │   │   ├── codeService.js
│   │   │   └── resultService.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 6. Verification and Demonstration Workflows

### Workflow 1: Admin Assessment Setup
1. Open `http://localhost:5173/login` and click **Fill Admin** (`admin@assessment.com`).
2. Navigate to **Manage Assessments** -> **Create Assessment**.
3. Fill in Assessment Title, Duration (e.g. `60` min), Start/End date, and click **Create Assessment**.
4. Click on the questions count icon and select **Add Question**.
5. Input Problem Title, Problem Description, Constraints, Sample Input/Output, and add 2 or more **Hidden Test Cases**.
6. Save the Question. Ensure the Assessment is set to **Published**.

### Workflow 2: Candidate Assessment & Code Execution
1. Log out or open an Incognito window, go to `http://localhost:5173/login`, and click **Fill Candidate** (`candidate@assessment.com`) or register a new candidate.
2. Under **Available Assessments**, click **Take Test** next to the active assessment.
3. Review the guidelines and click **Start Assessment Now**.
4. The Monaco Code Editor loads alongside the problem description and countdown timer.
5. Select a language (e.g., Python 3). Write a solution reading from standard input.
6. Click **Run Code** -> Notice the live execution in the bottom console with execution time and output against the sample test case.
7. Click **Submit Solution** -> The backend tests the code against all hidden test cases via Judge0, calculates the score, and displays test case pass/fail indicators.
8. Click **Finish & Submit Test** to finalize your score.

### Workflow 3: Rankings & Audit Trail
1. Log in again as the Administrator.
2. Navigate to **Results & Rankings**: view real-time candidate scores, percentages, and podium ranks (#1, #2, #3).
3. Navigate to **Submissions**: inspect submitted code, execution status, and timestamps.
