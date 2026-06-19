# 🌱 CarbonWise: Carbon Footprint Awareness Platform
CI License: MIT

CarbonWise is a modern, AI-powered web application that helps individuals understand, track, and reduce their personal carbon footprint through simple inputs and personalized, AI-generated insights.

Built as a single, accessible web application featuring a Node.js/Express backend and a React + Vite frontend. It uses the Google Gemini API for personalized sustainability advice and Firebase Firestore for historical tracking. The entire application is containerized and deployed to Google Cloud Run as a single unified service.

## 1. Chosen Vertical
Carbon Footprint Awareness Platform — a tool designed for everyday individuals who want to understand where their emissions come from and what actionable steps they can take to reduce them.

* **Understand:** Enter lifestyle facts (transportation, energy, diet, waste) to calculate your footprint, broken down by category, and compare it to the global average.
* **Track:** Save snapshots over time (anonymously) to a Firestore database and monitor your footprint trends on interactive charts.
* **Reduce:** Receive highly personalized, actionable recommendations generated dynamically by Google Gemini AI, targeting your biggest emission sources.

## 2. Approach & Logic
### The Decision Flow
User inputs (transport, home energy, diet, waste)
        │
        ▼
Carbon Engine  ──►  Calculate per-category CO₂ emissions
        │                                          
        ▼                                          
Save snapshot (Firestore, keyed by anonymous device id)
        │
        ▼
Insights Generator ──► Gemini AI analyzes the specific data profile to provide tailored advice

The application ranks the user's emission categories and gives actionable advice for the biggest contributors. A heavy driver is given specific transportation alternatives; a high-energy user is given home efficiency tips.

## 3. How the Solution Works
### Architecture
```text
Browser (React + Vite)                  Cloud Run (Single Container)
  • Interactive UI & Charts   ──HTTP──►   Node.js / Express Backend
  • Anonymous tracking id                 ├─ POST /api/footprint  (Save to Firestore)
                                          ├─ GET  /api/footprint/:id/history 
                                          ├─ POST /api/ai/analyze (Fetch Gemini insights)
                                          └─ GET  * (Serves static React SPA)
                                              │
                                              ├─► Google Gemini API
                                              └─► Firebase Firestore
```
One container serves both the API and the static React Single Page Application (SPA). This means there is only a single service to deploy and a single origin (no CORS issues in production).

### Project Layout
* `client/` - React SPA (Vite, Tailwind CSS v4, Recharts, Framer Motion)
* `server/` - Express API (Controllers, Firebase Admin SDK, Gemini SDK)
* `Dockerfile` - Multi-stage build (builds React app, installs Node dependencies, serves both)
* `.github/workflows/deploy.yml` - CI/CD pipeline for Google Cloud Run deployment

## 4. Running Locally
### Backend (Node.js 20+)
```bash
cd server
npm install
npm run dev      # Runs Express backend on http://localhost:5000
```
*(Requires a `.env` file with `PORT=5000`, `GEMINI_API_KEY`, and `FIREBASE_SERVICE_ACCOUNT_KEY`)*

### Frontend (React + Vite)
```bash
cd client
npm install
npm run dev      # Runs Vite dev server on http://localhost:5173
```

### Run as a Container
```bash
docker build -t carbonwise-app .
docker run -p 5000:5000 --env-file server/.env carbonwise-app
```

## 5. Deploying to Google Cloud Run
The project includes a fully automated GitHub Actions CI/CD pipeline (`.github/workflows/deploy.yml`).
Whenever you push to the `main` branch, the workflow will:
1. Authenticate with Google Cloud
2. Build the unified Docker image
3. Push to Artifact Registry
4. Deploy the new revision to Google Cloud Run

**Required GitHub Secrets:**
* `GCP_PROJECT_ID`
* `GCP_CREDENTIALS` (Service account JSON)
* `GEMINI_API_KEY`
* `FIREBASE_SERVICE_ACCOUNT_KEY` (Base64 encoded)

## 6. Assumptions Made
* **Awareness, not strict audit:** The emission calculations provide a representative educational baseline to help users understand their impact.
* **Anonymous by design:** No login required. A random UUID is generated and stored in `localStorage` to key a user's history. This minimizes friction while allowing trend tracking.
* **Unified Deployment:** To reduce cloud costs and configuration overhead, both the frontend and backend share the same Express server and Docker container.

## License
MIT — Created for Challenge 3.
