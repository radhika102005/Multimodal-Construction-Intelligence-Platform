# Multimodal Construction Intelligence Platform

[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18.2+-61DAFB.svg?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-3178C6.svg?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com)
[![Render](https://img.shields.io/badge/Render-Free%20Tier%20(512MB)-46E3B7.svg?style=flat&logo=render)](https://render.com)
[![Vercel](https://img.shields.io/badge/Vercel-Deployment%20Ready-000000.svg?style=flat&logo=vercel)](https://vercel.com)

A professional-grade, full-stack, multimodal decision-support system designed for construction managers, civil structural engineers, safety officers, and real estate appraisers.

---

## 1. Executive Overview

The **Multimodal Construction Intelligence Platform** integrates visual image analysis, deterministic civil engineering algorithms, meteorological intelligence, and large language model (LLM) reasoning into a single unified platform. 

It is engineered specifically to deploy smoothly on **Render Free Web Services (512 MB RAM limit)** and **Vercel**, requiring zero credit cards or heavy local PyTorch/TensorFlow weights.

### Key Highlights
- **Multimodal AI Vision:** Audits construction site photos for PPE and OSHA hazards, and evaluates structural cracks, orientation, spalling, and rebar corrosion.
- **Provider-Independent AI Service:** Supports Google Gemini (`gemini-1.5-flash`), OpenAI (`gpt-4o-mini`), or offline benchmark heuristic algorithms when no API key is provided.
- **Render 512MB Free Tier Compatible:** Ultra-lightweight asynchronous Python backend using HTTPX, zero heavy local neural network weights, zero memory leaks.
- **Free Meteorological Feed:** Integrates Open-Meteo API for real-time weather and automatic civil activity advisories (concrete pouring, crane operations, heat safety) without requiring a weather API key.
- **Login-Free Instant Demonstration:** Immediate access to all 8 modules suitable for project evaluation and technical jury demonstrations.

---

## 2. Platform Modules

| # | Module Name | Primary Capability | Technical Foundation |
|---|-------------|--------------------|----------------------|
| **1** | **Dashboard Overview** | Aggregated telemetry, project lifecycle distribution, risk distribution charts, and proactive AI recommendations. | Recharts, FastAPI `/api/v1/dashboard/summary` |
| **2** | **Safety Monitoring** | Multimodal visual audit of construction sites detecting missing hard hats, vests, fall hazards, scaffolding issues, and OSHA violations. | Multimodal Vision AI + OSHA 1926 Rule Engine |
| **3** | **Crack & Structural Forensics** | Visual defect assessment of walls, beams, columns, and slabs for crack pattern, visual width, spalling, and moisture efflorescence. | Multimodal Vision Forensics + NDT Guidelines |
| **4** | **Real Estate Valuation** | Hedonic replacement cost estimation, depreciation factoring, amenity indexing, and value optimization advice. | Hedonic Cost Algorithm + Market Heuristics |
| **5** | **Project Planning & WBS** | Generation of Work Breakdown Structures (WBS), Gantt-style phase timelines, milestones, resource requirements, and trade budget allocations. | Deterministic CPM Scheduling + Generative LLM |
| **6** | **Daily Site Assistant (SiteMate)** | Conversational field intelligence for concrete curing, slump tests, formwork stripping, waterproofing, and morning toolbox talks. | Conversational LLM + Civil Field Knowledgebase |
| **7** | **Weather-Aware Advisory** | Live meteorological conditions and automatic civil work decisions (concrete pouring, crane operations, painting, worker heat index). | Open-Meteo Public API (No key required) |
| **8** | **Knowledge Assistant** | Technical query resolution with citations to recognized engineering standards (ACI 318, ASTM C94, OSHA 1926, Eurocodes, IS 456). | Curated Knowledge Index + QA/QC Checklists |

---

## 3. Architecture & Repository Structure

```
Multimodal-Construction-Intelligence-Platform/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI initialization, CORS, middleware, route mounting
│   │   ├── config.py                # Pydantic Settings & environment variables
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── prompts.py           # Structured JSON prompts for multimodal AI
│   │   │   └── exceptions.py        # Centralized HTTP & platform exceptions
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── common.py            # HealthStatus and shared response wrappers
│   │   │   ├── dashboard.py         # Dashboard metrics and activity schemas
│   │   │   ├── safety.py            # HazardItem and SafetyAnalysisResponse
│   │   │   ├── crack.py             # DefectItem and CrackAnalysisResponse
│   │   │   ├── valuation.py         # ValuationRequest and ValuationResponse
│   │   │   ├── planning.py          # PhaseItem and PlanningResponse
│   │   │   ├── assistant.py         # ChatRequest and ChatResponse
│   │   │   ├── weather.py           # WeatherResponse and ConstructionAdvisoryItem
│   │   │   └── knowledge.py         # KnowledgeRequest and KnowledgeResponse
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── ai_service.py        # Provider-independent AI layer (Gemini, OpenAI, Heuristic)
│   │   │   ├── safety_service.py    # Visual safety audit logic and fallbacks
│   │   │   ├── crack_service.py     # Forensic structural defect evaluation
│   │   │   ├── valuation_service.py # Hedonic property appraisal model
│   │   │   ├── planning_service.py  # WBS duration and CPM calculation engine
│   │   │   ├── assistant.py         # SiteMate daily conversational assistant
│   │   │   ├── weather_service.py   # Open-Meteo async client & civil rule matrix
│   │   │   ├── knowledge_service.py # Curated standards repository & QA checklists
│   │   │   └── dashboard_service.py # In-memory session telemetry manager
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── image_validation.py  # MIME check, magic bytes verification, memory safety
│   │   │   └── response_formatter.py# Clean JSON parser from LLM markdown responses
│   │   └── api/
│   │       ├── __init__.py
│   │       └── routes/
│   │           ├── __init__.py
│   │           ├── health.py        # GET /health
│   │           ├── dashboard.py     # GET /api/v1/dashboard/summary
│   │           ├── safety.py        # POST /api/v1/safety/analyze
│   │           ├── crack_analysis.py# POST /api/v1/cracks/analyze
│   │           ├── valuation.py     # POST /api/v1/valuation/estimate
│   │           ├── planning.py      # POST /api/v1/planning/generate
│   │           ├── assistant.py     # POST /api/v1/assistant/chat
│   │           ├── weather.py       # GET /api/v1/weather
│   │           └── knowledge.py     # POST /api/v1/knowledge/ask
│   ├── requirements.txt             # Lightweight dependencies (< 60MB RAM footprint)
│   ├── render.yaml                  # Render Free Web Service deployment Blueprint
│   └── .env.example                 # Backend environment variable template
├── frontend/
│   ├── public/                      # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.tsx          # Responsive navigation drawer with AI status
│   │   │   ├── Header.tsx           # Connectivity telemetry, Render cold-start indicator
│   │   │   ├── StatCard.tsx         # KPI metric widgets with trend indicators
│   │   │   ├── StatusBadge.tsx      # Risk and severity badges (Low, Med, High, Critical)
│   │   │   ├── ImageUploader.tsx    # Drag-and-drop file uploader with size validation
│   │   │   ├── AlertBanner.tsx      # Centralized alert notifications
│   │   │   ├── Modal.tsx            # Full-page printable reports dialog
│   │   │   └── EmptyState.tsx       # Placeholder screens
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx       # Master layout wrapper with sleep-wake detection
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx        # Module 1 Overview & Recharts
│   │   │   ├── SafetyMonitoring.tsx # Module 2 Multimodal Safety Inspection
│   │   │   ├── CrackAnalysis.tsx    # Module 3 Structural Crack Forensics
│   │   │   ├── Valuation.tsx        # Module 4 Real Estate Appraisal Form
│   │   │   ├── ProjectPlanning.tsx  # Module 5 WBS CPM Master Schedule
│   │   │   ├── DailyAssistant.tsx   # Module 6 SiteMate Conversational Assistant
│   │   │   ├── WeatherAdvisory.tsx  # Module 7 Live Meteorological Matrix
│   │   │   ├── KnowledgeAssistant.tsx# Module 8 Civil Standards & QA Checklists
│   │   │   └── NotFound.tsx         # 404 Route
│   │   ├── services/
│   │   │   └── api.ts               # Reusable Axios service with cold-start interceptor
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript definitions matching backend schemas
│   │   ├── App.tsx                  # React Router client setup
│   │   ├── main.tsx                 # DOM root mount
│   │   └── index.css                # Tailwind directives and custom scrollbars
│   ├── package.json
│   ├── vite.config.ts               # Vite bundler configuration & local dev proxy
│   ├── tsconfig.json
│   ├── tailwind.config.js           # Navy and construction-orange palette
│   ├── vercel.json                  # Single Page Application (SPA) routing for Vercel
│   └── .env.example                 # Frontend environment template
├── tests/
│   └── test_backend.py              # Automated Pytest suite for API routes & image validation
├── .gitignore
├── .env.example
├── render.yaml                      # Root Render Infrastructure-as-Code Blueprint
├── vercel.json                      # Root Vercel SPA routing
└── README.md                        # Documentation
```

---

## 4. Local Installation & Execution (Windows CMD)

Follow these exact steps in Windows Command Prompt (`cmd.exe`) to run the full application locally.

### Step 1: Clone or Extract the Project
Extract the project ZIP file, then open `cmd.exe` and navigate into the root directory:
```cmd
cd Multimodal-Construction-Intelligence-Platform
```

### Step 2: Setup and Run the Python Backend
1. Navigate into the backend directory:
   ```cmd
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```cmd
   python -m venv venv
   call venv\Scripts\activate
   ```
3. Install backend dependencies:
   ```cmd
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
4. Copy the environment configuration:
   ```cmd
   copy .env.example .env
   ```
   *(Optional: Open `.env` in Notepad and insert your free Google Gemini API key into `AI_API_KEY=`)*
5. Start the FastAPI backend server:
   ```cmd
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   The backend will be running at: `http://localhost:8000`  
   Interactive Swagger documentation: `http://localhost:8000/docs`

### Step 3: Setup and Run the React Frontend
Open a **new** Windows Command Prompt window:
1. Navigate into the frontend directory:
   ```cmd
   cd Multimodal-Construction-Intelligence-Platform\frontend
   ```
2. Install frontend dependencies:
   ```cmd
   npm install
   ```
3. Copy the environment configuration:
   ```cmd
   copy .env.example .env
   ```
4. Start the Vite development server:
   ```cmd
   npm run dev
   ```
   Open your browser and navigate to: `http://localhost:5173`

---

## 5. Configuring AI Keys (Google Gemini Free Tier)

The platform is designed to operate seamlessly in two modes:

1. **Benchmark Civil Heuristic Mode (Out-of-the-Box):**  
   If `AI_API_KEY` is blank, all modules remain fully functional! Safety audits, crack inspections, and WBS plans generate realistic, verified engineering benchmarks. A badge in the header clearly informs the user that sample baseline mode is active.

2. **Live Multimodal Generative AI Mode:**  
   To activate real-time Gemini vision and text reasoning:
   - Obtain a free API key at [Google AI Studio](https://aistudio.google.com/app/apikey).
   - Open `backend/.env` in any text editor.
   - Configure the following values:
     ```env
     AI_PROVIDER=gemini
     AI_API_KEY=AIzaSyYourActualKeyHere
     AI_MODEL=gemini-1.5-flash
     ```
   - Restart the backend server. The UI will automatically detect the key and display **"Model: gemini-1.5-flash"** in the top navigation bar.

---

## 6. Running Automated Tests

To run the automated backend test suite covering all API endpoints, schemas, and image validation:
```cmd
cd Multimodal-Construction-Intelligence-Platform
pytest tests/test_backend.py -v
```

---

## 7. Deployment Instructions

### A. Deploying the Backend on Render (Free Web Service)

1. Push your repository to GitHub.
2. Sign in to [Render](https://render.com) (free tier, no credit card required).
3. Click **New +** -> **Web Service**.
4. Select **Build and deploy from a Git repository** and connect your repository.
5. Configure the following service settings:
   - **Name:** `construction-platform-backend`
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type:** `Free` (0.1 CPU, 512 MB RAM)
6. Under **Environment Variables**, add:
   - `ENVIRONMENT` = `production`
   - `AI_PROVIDER` = `gemini`
   - `AI_MODEL` = `gemini-1.5-flash`
   - `AI_API_KEY` = *(Your Gemini API Key, or leave blank for benchmark mode)*
   - `FRONTEND_ORIGINS` = `*`
   - `MAX_UPLOAD_MB` = `10`
   - `REQUEST_TIMEOUT_SECONDS` = `45`
7. Click **Create Web Service**.
8. Note your public backend URL (e.g., `https://construction-platform-backend.onrender.com`).

> **Render Free Tier Cold Starts:** Free instances spin down after 15 minutes of inactivity. When a user sends a request after inactivity, the frontend will show a gentle banner while Render spins up within ~30-45 seconds.

---

### B. Deploying the Frontend on Vercel

1. Sign in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Configure the project settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click `Edit` and select `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL` = `https://construction-platform-backend.onrender.com`  
     *(Point this to your live Render backend URL, without a trailing slash)*
6. Click **Deploy**.
7. Vercel will build and assign you a free production URL (e.g., `https://your-construction-platform.vercel.app`).

---

## 8. Safety & Engineering Limitations

- **Preliminary Decision Support Only:** Multimodal visual AI assessments provide preliminary observational assistance. Visual examination from photos cannot verify subsurface rebar yield strength, internal concrete honeycombing, or foundation subgrade compaction.
- **Qualified Sign-off Required:** An on-site certified OSHA Safety Officer or licensed Professional Structural Engineer (PE / SE) must inspect the physical site before signing compliance forms or approving structural modifications.
- **Meteorological Data:** Weather advisories are derived from Open-Meteo's automated forecast models. Local micro-climates and sudden squalls must be monitored on-site with calibrated anemometers.
- **Real Estate Appraisals:** Property valuations use a hedonic replacement cost algorithm. Official mortgage financing or tax assessments require an accredited physical property appraisal.

---

## 9. License

This project is developed for educational, portfolio, and research demonstration purposes. Free for commercial extension and academic evaluation.
