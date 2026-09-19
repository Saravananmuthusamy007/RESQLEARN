# ResqLearn — Intelligent Adaptive First-Aid / BLS Training Platform

[![Node.js Version](https://img.shields.io/badge/node-v20.20%2B-brightgreen.svg)](https://nodejs.org)
[![React 18](https://img.shields.io/badge/frontend-React%20%2B%20Vite-blue.svg)](https://vitejs.dev)
[![Gemini 2.5 Flash](https://img.shields.io/badge/AI-Google%20Gemini%202.5%20Flash-orange.svg)](https://ai.google.dev)
[![Verification](https://img.shields.io/badge/crypto-SHA--256%20Tamper--Evident-emerald.svg)](https://nodejs.org/api/crypto.html)

**ResqLearn** is an interactive, game-like emergency training, simulation, adaptive assessment, and certification platform. Designed for both First-Aid trainees and Medical Directors, ResqLearn delivers an authentic clinical education experience with real-time physical telemetry, deterministic backend scoring, Gemini-powered difficulty routing, sequential mastery gates, and tamper-evident cryptographic certification.

---

## Key Features

1. **Five Standardized Emergency Levels**:
   - **Level 1 — CPR / AED**: Real-time 100–120 BPM metronome rhythm, tactile compression depth gauge (5.0–6.0 cm), 100% recoil reset, 30:2 stroke counter, and rescue ventilations.
   - **Level 2 — Severe Hemorrhage Control**: PPE compliance, direct manual pressure gauge (40–60 N sweet spot), deep junctional wound packing, Combat Application Tourniquet (CAT) placement, and windlass hemostasis.
   - **Level 3 — Thermal Burn Stabilization**: 15–20°C water cooling temperature slider, 10–20 min irrigation timer, early jewelry removal, and error traps (no ice/butter).
   - **Level 4 — Foreign Body Airway Obstruction**: Severity triage, forward positioning, 5 sharp back blows, 5 upward abdominal thrusts (Heimlich), and modified CPR transition.
   - **Level 5 — Musculoskeletal Fracture Splinting**: Pre/post 3-point PMS (Pulse, Motor, Sensory) evaluation, two-joint immobilization mandate, and safe non-constrictive strap tensioning.

2. **Deterministic Backend Authority**:
   - Scores are computed strictly on the backend:
     $$\text{Score} = (0.40 \times \text{Accuracy}) + (0.35 \times \text{Sequence}) + (0.25 \times \text{Time}) - (5 \times \text{Mistakes})$$
   - Practical threshold: $\ge 75\%$ required to unlock the adaptive theoretical assessment.

3. **Gemini 2.5 Flash Adaptive Assessment**:
   - Dynamic difficulty routing based on practical performance:
     - $75\% \le \text{Score} \le 80\% \rightarrow$ **BASIC** + Mandatory Fundamental Safety Principles.
     - $80\% < \text{Score} \le 90\% \rightarrow$ **MODERATE**.
     - $\text{Score} > 90\% \rightarrow$ **ADVANCED**.
   - Generates 5 four-option MCQs. Backend deterministically scores $(correct / total) \times 100$.
   - Passing threshold $\ge 70\%$ completes the level and unlocks the next module.
   - **Zero-Downtime Fallback**: Pre-seeded clinical question banks guarantee smooth offline execution if Gemini is unavailable.

4. **Cryptographic SHA-256 Certification**:
   - Issued upon completing all 5 emergency modules.
   - Canonical payload hashed with SHA-256 for tamper-evident verification at `/verify/:certificateId`.

5. **Two Strictly Enforced User Roles**:
   - **Learner (Cadet)**: Dashboard, Sequential Modules, Simulations, Adaptive MCQs, Certificates, AI Partner, and Feedback.
   - **Admin (Medical Director)**: Live Analytics (Recharts), Learner Management with full telemetry audits, Level Editor with versioning, Isolated Sandbox Demo Play, and Executive AI Partner.

---

## Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Axios, Lucide React, Recharts.
- **Backend**: Node.js, Express.js, MongoDB / Mongoose, JWT authentication, bcryptjs, Node.js `crypto`.
- **Artificial Intelligence**: Google Gemini 2.5 Flash (`@google/generative-ai`) on backend only.

---

## Directory Structure

```text
resqlearn/
├── client/                     # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, HUD)
│   │   ├── context/            # AuthContext
│   │   ├── layouts/            # LearnerLayout, AdminLayout
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── learner/        # Dashboard, Levels, Simulation, Assessment, Certificate, Partner, Feedback, Profile, PublicVerify
│   │   │   └── admin/          # AdminDashboard, Analytics, Learners, LevelEditor, DemoPlay, AdminAI, FeedbackAdmin, AdminProfile
│   │   ├── simulations/        # Simulation Engine & 5 Clinical Level Modules
│   │   │   ├── engine/         # SimulationEngine, TelemetryCollector, HUD, VisualFeedback
│   │   │   ├── level1/         # CprAedSimulation
│   │   │   ├── level2/         # HemorrhageSimulation
│   │   │   ├── level3/         # ThermalBurnSimulation
│   │   │   ├── level4/         # ChokingSimulation
│   │   │   └── level5/         # SplintingSimulation
│   │   ├── services/           # api.js
│   │   └── App.jsx
│   ├── package.json
│   └── tailwind.config.js
├── server/                     # Node.js + Express API
│   ├── config/                 # db.js
│   ├── controllers/            # auth, level, simulation, assessment, certificate, feedback, ai, admin
│   ├── middleware/             # authMiddleware (JWT & role checks)
│   ├── models/                 # User, Level, LevelVersion, SimulationAttempt, TelemetryEvent, Assessment, Mastery, Certificate, Feedback, ActivityLog
│   ├── routes/                 # Express API routes
│   ├── services/
│   │   ├── scoring/            # Deterministic scoringEngine.js
│   │   ├── telemetry/          # telemetryService.js
│   │   ├── mastery/            # masteryService.js
│   │   └── certification/      # certificateService.js (SHA-256)
│   ├── ai/                     # geminiService.js, adaptiveAssessment.js, learningPartner.js
│   ├── seed/                   # seedLevels.js, seedRunner.js
│   ├── test/                   # runTests.js
│   ├── server.js
│   └── .env.example
├── docs/                       # ARCHITECTURE.md, CLINICAL_GUIDELINES.md, API_REFERENCE.md
├── package.json
├── .gitignore
└── README.md
```

---

## Environment Configuration

Copy `server/.env.example` to `server/.env`:

```bash
cd resqlearn/server
cp .env.example .env
```

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/resqlearn?retryWrites=true&w=majority
GEMINI_API_KEY=your_gemini_api_key_here
JWT_SECRET=resqlearn_super_secure_jwt_secret_key_2026
ADMIN_EMAIL=admin@resqlearn.io
ADMIN_PASSWORD=AdminRescue2026!
NODE_ENV=development
```

> **Note**: If `MONGO_URI` is left blank, the server will connect to a local MongoDB instance (`mongodb://localhost:27017/resqlearn`) or provide clear connection status.

---

## Quickstart & Installation

### 1. Install Dependencies
From the `resqlearn/` root folder:
```bash
npm run install:all
```

Or manually:
```bash
cd resqlearn/server && npm install
cd ../client && npm install
```

### 2. Run Database Seeding
Initializes the 5 clinical levels, LevelVersion 1.0 snapshots, the Medical Director admin account, and a sample cadet learner:
```bash
npm --prefix server run seed
```

### 3. Run Automated Unit Tests
Runs the deterministic scoring formula, 75% practical threshold, 70% assessment threshold, and SHA-256 certificate hashing test suite:
```bash
npm --prefix server test
```

### 4. Start the Application

**Start the Backend Server (Port 5000):**
```bash
npm --prefix server run dev
```

**Start the Frontend Client (Port 5173):**
```bash
npm --prefix client run dev
```

Open your browser at `http://localhost:5173`.

---

## Default Test Accounts

For pair programming and testing convenience, one-click quick-fill buttons are provided on the login page:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Learner (Cadet)** | `learner@resqlearn.io` | `LearnerRescue2026!` | 5-Level Pathway, Simulations, Assessments, Certification |
| **Admin (Director)** | `admin@resqlearn.io` | `AdminRescue2026!` | Analytics, Audits, Level Editor, Versioning, Demo Play Sandbox |

---

## Verification & Public URLs

- **Application Frontend**: `http://localhost:5173`
- **Backend Health Check**: `http://localhost:5000/api/health`
- **Public Certificate Verification**: `http://localhost:5173/verify/:certificateId`
