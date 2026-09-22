<div align="center">

# 🏛️ Real-Time National Land Acquisition & Management System

### Statutory Infrastructure Land Governance Portal

*Digitizing, monitoring and streamlining the complete land acquisition lifecycle —*
*by connecting Central Ministries, State Revenue Departments, District Collectors (CALA), Land Acquiring Authorities (SLAO), Project Implementing Agencies and Policy Makers on one unified GIS platform.*

<br/>

[![Python](https://img.shields.io/badge/Python-3.14+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Scikit-Learn](https://img.shields.io/badge/Scikit_Learn-1.4-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Node.js](https://img.shields.io/badge/Node.js-24.0+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License: Statutory Enterprise](https://img.shields.io/badge/Compliance-RFCTLARR_2013-138808.svg?style=for-the-badge)](https://dolr.gov.in)

<br/>

> 📜 **National Domain — AI, GIS & Data Analytics for Infrastructure Management**
> *A centralized web-based platform to digitize, accelerate and transparently monitor statutory land acquisition in India from project proposal to final closure*
> **Organisation:** Government of India · Ministry of Rural Development (Department of Land Resources) & NITI Aayog

</div>

---

## 📌 Table of Contents

- [The Problem](#-the-problem)
- [How The System Solves It](#-how-the-system-solves-it)
- [End-to-End Workflow](#-end-to-end-workflow)
- [Key Features](#-key-features)
- [Requirement Coverage](#-requirement-coverage)
- [Tech Stack](#%EF%B8%8F-tech-stack)
- [Project Architecture](#%EF%B8%8F-project-architecture)
- [Quickstart Guide](#-quickstart-guide)
- [Demo Login Credentials](#-demo-login-credentials)
- [API Reference](#-api-reference)
- [Docker Deployment](#-docker-deployment)
- [Known Limitations](#-known-limitations)

---

## 🌐 The Problem

Every year across India, major infrastructure projects—highways (NHAI), railways (DFCCIL/NHSRCL), industrial corridors, power grids, and urban transit—face severe delays and budget overruns during land acquisition. At the same time:

- **Central Ministries & Agencies** (MoRTH, Railways, NHAI) lack real-time visibility into local land acquisition bottlenecks, Section 11/19 statutory delays, and field demarcation progress across states.
- **State Revenue Departments & District Collectors (CALA)** are overwhelmed with paper-based Social Impact Assessments (SIA), multi-crop land scrutiny, and manual gazette publishing.
- **Khatedars & Land Losers** suffer from delayed compensation payments, manual solatium calculations, untracked Direct Benefit Transfer (DBT) statuses, and inadequate Rehabilitation & Resettlement (R&R) monitoring.
- **Policy Makers (NITI Aayog & Cabinet Secretariat)** have no unified data engine to detect spatial overlap fraud, predict project delays, or benchmark state-level land acquisition performance.

These groups operate in disconnected silos. There is no structured digital mechanism to move land acquisition from *"a proposal submitted on paper"* to *"statutory approval, 100% fair solatium disbursement, and complete R&R rehabilitation."*

---

## 💡 How The System Solves It

The **Real-Time National Land Acquisition & Management System** is the missing national pipeline. An implementing agency submits a project proposal with GeoJSON corridor mapping; an AI engine triages, risk-scores, predicts delays, and checks spatial cadastre overlaps; the District Collector (CALA) processes Social Impact Assessment (SIA) scrutiny and publishes Section 11/19 e-Gazette notifications; the Special Land Acquisition Officer (SLAO) disburses 100% Solatium fair compensation via Direct Benefit Transfer (DBT); and policy makers track the national progress on a live GIS dashboard.

```
 PROJECT AGENCY           AI ENGINE               DISTRICT COLLECTOR        SLAO & BANKING        POLICY MAKERS
 ──────────────           ─────────               ──────────────────        ──────────────        ─────────────
 Submits project    →   Predicts delay     →    Verifies SIA & multi-  →   Calculates 100%   →   Monitors macro
 proposal with          (RandomForest),         crop land ceiling,          Solatium, triggers    KPIs, SLA alerts,
 GeoJSON GIS map        computes 0–100          issues Section 11/19        batch DBT payment     R&R entitlements &
 & alignment data       risk score & checks     e-Gazette notification      with UTR tracking     audit trails
                        spatial overlap
```

---

## 🔄 End-to-End Workflow

### 1️⃣ Project Proposal & GIS Corridor Submission
The Implementing Agency (e.g., NHAI or Indian Railways) submits a project proposal on the portal with alignment GeoJSON vectors, land requirement (Hectares), affected village count, and estimated budget.

### 2️⃣ The AI Engine Triages & Risk-Scores (Automatic, on Submission)

| Step | What Happens |
|---|---|
| **Classify & Predict** | A Scikit-Learn `RandomForestRegressor` trained on 3,000 historical projects predicts expected project delay (in months) and percentage probability of deadline slippage based on land size, forest %, and private vs. govt land ratio |
| **Prioritise & Risk Score** | A composite **0–100 RFCTLARR Risk Index** evaluates Section 19 12-month statutory expiry proximity, award delays, and compensation disbursement gaps—bucketed into `CRITICAL`, `HIGH`, `MEDIUM`, or `LOW` risk |
| **Deduplicate** | **Haversine spatial distance** (<80m) + survey number overlap engine detects duplicate land claims and overlapping cadastre polygons to prevent double-compensation fraud |
| **Route & Alert** | Project is auto-routed to the designated District Collectorate (CALA) and SLAO workspace, with an auditable statutory log created for every state transition |

### 3️⃣ Collector Scrutiny & Statutory Approval
The District Collector (CALA) reviews the multi-crop land ceiling compliance under Section 10, verifies Section 4 Social Impact Assessment (SIA) Gram Sabha public hearing records, and approves the proposal.

### 4️⃣ e-Gazette Publishing & 12-Stage Statutory Workflow
Official notifications are generated and published directly through the portal:
- **Section 11 Preliminary Notification**: Published in e-Gazette with unique bulletin tracking numbers.
- **Section 19 Declaration of Acquisition**: Formally declared (*Statutory Mandate: Must be issued within 12 months of Section 11 notice*).
- **Section 23/30 Collector Award**: Final award declaration determining land area, market rates, and solatium.

### 5️⃣ Fair Compensation Assessment & Direct Benefit Transfer (DBT)
The SLAO uses the built-in statutory compensation calculator:
$$\text{Total Compensation} = (\text{Base Market Value} \times \text{Rural Multiplier } 1.0\text{x}–2.0\text{x}) + 100\% \text{ Solatium} + 12\% \text{ Interest}$$
Payments are disbursed in batches directly to land losers' bank accounts via Direct Benefit Transfer (DBT) simulation with UTR transaction code generation.

### 6️⃣ Field Demarcation & Physical Possession Takeover
Field Inspectors use **Field Officer Mobile Mode** (`/field-verify`) to record GPS boundary coordinates on-site, upload geotagged panchnama inspection photos, and record attestation signatures from 2 independent village witnesses.

### 7️⃣ Rehabilitation & Resettlement (R&R) & Project Closure
Displaced families are tracked for R&R entitlements: allotment of developed housing plots, ₹1.5 Lakh house construction grant, ₹50,000 displacement allowance, and skill development training. Upon complete R&R fulfillment, Record of Rights (7/12 RoR) mutation is completed to close the project.

---

## ✨ Key Features

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🗺️ **Interactive Leaflet GIS Corridor Map** | Dynamic vector cadastre mapping, state/district filter toggles, polygon bounds, and parcel inspection drawers |
| 2 | 📜 **12-Stage Statutory Workflow Engine** | Complete statutory workflow following RFCTLARR Act 2013 with mandatory audit seals and SLA countdowns |
| 3 | 🤖 **AI Project Delay Predictor** | Machine Learning model (`RandomForestRegressor`) predicting delay in months and probability of missing deadlines |
| 4 | ⚖️ **RFCTLARR Statutory Risk Scorer** | Composite 0–100 risk algorithm evaluating Section 19 lapse risk, award bottlenecks, and compensation gaps |
| 5 | 🔍 **Spatial Duplicate Cadastre Engine** | Haversine distance formula (<80m) & survey collision detector to eliminate duplicate compensation fraud |
| 6 | 💰 **Automated Fair Compensation & DBT** | Built-in RFCTLARR calculator (Base rate + Solatium 100% + Interest 12%) with batch UTR payment simulation |
| 7 | 🏠 **R&R Family Entitlement Tracker** | Digitized Rehabilitation & Resettlement tracking for displaced families, housing grants, and annuity allowances |
| 8 | 📄 **Digital Gazette & Document Vault** | Upload, verify, and digitally seal e-Gazette notifications, Section 11 notices, Awards, and 7/12 RoRs |
| 9 | 🚨 **Automated SLA Alert Center** | High-priority alerting for Section 19 12-month expiry warnings, delayed SIA hearings, and overdue awards |
| 10 | 📱 **Field Officer Mobile Demarcation** | Responsive mobile interface for field inspectors to submit GPS coordinates, panchnama photos, & witness signatures |
| 11 | 📊 **Executive Policy & Micro Reports** | PDF export engine (jsPDF) generating instant executive summaries, state comparison tables, and audit logs |
| 12 | 🔒 **Strict 7-Role Server-Side RBAC** | Granular JWT-based permission checks enforcing role scoping across Ministries, Collectors, SLAOs, and Agencies |
| 13 | 🛡️ **Immutable Statutory Audit Trail** | Electronic ledger capturing every workflow transition, document verification, and compensation approval |

---

## ✅ Requirement Coverage

Mapped directly against core public administration & infrastructure requirements:

| Statutory / System Requirement | Status | Implementation |
|---|---|---|
| Complete 12-stage statutory lifecycle tracking | ✅ | Standardized 12-stage workflow engine from Proposal to Award & Closure |
| GIS mapping with parcel spatial boundary polygons | ✅ | Leaflet GIS interactive map with GeoJSON polygons & survey drawers |
| AI-based delay prediction & risk classification | ✅ | Python FastAPI microservice with Scikit-learn Random Forest models |
| Overlapping land claim & spatial deduplication | ✅ | Haversine centroid proximity (<80m) + survey number collision engine |
| Statutory compensation calculation with 100% Solatium | ✅ | Built-in RFCTLARR calculator (Base rate + Rural multiplier + 100% Solatium) |
| Direct Benefit Transfer (DBT) disbursement | ✅ | Batch DBT execution with UTR code tracking and bank account validation |
| Field demarcation & panchnama attestation | ✅ | Dedicated Field Officer Mobile Mode (`/field-verify`) with GPS photo attestation |
| Section 19 12-month statutory lapse escalation | ✅ | SLA Alert Center with automated red-flag countdown triggers |
| Multi-role governance access control | ✅ | 7-role server-side JWT authentication & RBAC middleware |
| Document verification & PDF export | ✅ | Gazette notification publishing, digital document seals & jsPDF micro-reports |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend API** | Node.js v24, Express.js 4.19, JWT Authentication, RBAC |
| **AI / ML Microservice** | Python 3.14, FastAPI 0.110, Scikit-Learn 1.4, Pandas, NumPy, Joblib |
| **Frontend UI** | React 18.3, Vite 6, Tailwind CSS 3.4, Lucide Icons, jsPDF |
| **Design System** | Official Indian Government Tricolor Navy & Amber Theme (`#0B192C` navy, `#FF9933` saffron, `#138808` green, `#F59E0B` amber) |
| **GIS & Mapping** | Leaflet.js 1.9 + OpenStreetMap + GeoJSON Vector Polygons |
| **Database Adapter** | Dual-Engine: Built-in Node 24 Native `node:sqlite` (local zero-setup) / PostgreSQL (production-ready) |
| **DevOps & Containers** | Docker, Docker Compose, Nginx |

---

## 🏗️ Project Architecture

```
national-land-acquisition-system/
├── backend/                        # Node.js + Express.js REST API
│   ├── data/                       # Persistent SQLite storage (national_land.db)
│   ├── src/
│   │   ├── config/                 # Database connection & JWT configuration
│   │   ├── controllers/            # Analytics, Auth, Workflow, Compensation, R&R, Alerts
│   │   ├── middleware/             # JWT Auth, RBAC, & Audit logging middleware
│   │   ├── models/                 # Database schema definitions (schema.sql & dbAdapter)
│   │   ├── routes/                 # Express API routing (/api/*)
│   │   └── server.js               # Backend entry point (Port 5000)
│   ├── Dockerfile
│   └── package.json
│
├── ai-service/                     # Python FastAPI AI & Analytics Engine
│   ├── models/                     # Trained ML models & prediction engines
│   │   ├── delay_regressor.joblib   # Trained RandomForest delay regressor
│   │   ├── delay_classifier.joblib  # Trained RandomForest risk classifier
│   │   ├── risk_scorer.py          # Composite RFCTLARR 0-100 risk scoring algorithm
│   │   ├── duplicate_detector.py   # Haversine & survey collision spatial detector
│   │   └── insight_generator.py    # Executive policy insight formulation
│   ├── main.py                     # FastAPI application entry point (Port 8000)
│   ├── train_models.py             # Model training script (3,000 project dataset)
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                       # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── components/             # Common UI, Navbar, Sidebar, RoleWorkspaceBanner, GIS Map
│   │   ├── config/                 # Role permission matrix & nav configs
│   │   ├── context/                # AuthContext (JWT & persona management)
│   │   ├── pages/                  # Dashboard, GISMap, Projects, Workflow, Compensation,
│   │   │                           # R&R, Documents, Alerts, AI Workbench, Reports,
│   │   │                           # AuditLogs, FieldOfficer, LoginPage
│   │   ├── services/               # Axios API client & service wrappers
│   │   ├── App.jsx                 # Main application routes & layout
│   │   └── main.jsx                # React entry point
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml              # Multi-container orchestration
├── start-all.bat                   # 1-Click Windows batch script launcher
├── start-all.ps1                   # 1-Click PowerShell launcher
└── README.md                       # Comprehensive system documentation
```

---

## 🚀 Quickstart Guide

> ⚠️ **All 3 microservices run simultaneously.** Using the 1-Click launcher runs them automatically.

### Option 1 — 1-Click Automated Startup (Recommended)

Double-click `start-all.bat` or execute in PowerShell:
```powershell
.\start-all.ps1
```

---

### Option 2 — Manual Startup (3 Terminals)

#### Terminal 1 — Python FastAPI AI Microservice (Port 8000)
```bash
cd ai-service
pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```
✅ AI Service at **`http://localhost:8000`** · OpenAPI Docs at `http://localhost:8000/docs`

#### Terminal 2 — Node.js Express Backend API (Port 5000)
```bash
cd backend
npm install
npm start
```
✅ Backend API at **`http://localhost:5000`** · Health check at `http://localhost:5000/api/health`

#### Terminal 3 — React Vite Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend Portal at **`http://localhost:5173`**

---

## 🔑 Demo Login Credentials

> **1-Click Instant Login:** The `/login` page and top navigation header feature an **Official Role Switcher**. Clicking any persona signs you straight in and loads that role's workspace. No typing needed. All accounts share password: **`Password@123`**

| Role | Official Name | Designation / Department | Demo Email | Lands On |
|------|---------------|--------------------------|------------|----------|
| 👑 **Super Admin** | Dr. Rajeshwar Sharma, IAS | Joint Secretary & DG, Ministry of Rural Development | `admin@nic.in` | `/` (National Dashboard) |
| 🏛️ **Central Ministry** | Sunita Verma, IAS | Director (Land Acquisition), MoRTH / Railways | `ministry.morth@gov.in` | `/` (National Dashboard) |
| 🏢 **State Admin** | Anand Kumar Patil, IAS | Principal Secretary (Revenue), Govt. of Maharashtra | `state.revenue@maharashtra.gov.in` | `/` (State Workspace) |
| ⚖️ **District Collector** | Pooja Kadam, IAS | District Magistrate & Collector (CALA), Thane | `collector.thane@nic.in` | `/workflow` |
| 📜 **Land Authority** | Vikramaditya Deshmukh | Special Land Acquisition Officer (SLAO), NHAI | `slao.nhai@gov.in` | `/compensation` |
| 🏗️ **Project Agency** | Pradeep R. Nair | Chief Project Manager, NHSRCL Bullet Train | `project.manager@nhsrcl.in` | `/projects` |
| 📈 **Policy Maker** | Dr. Meenakshi Sundaram | Senior Advisor (Infrastructure), NITI Aayog | `advisor.niti@gov.in` | `/ai-workbench` |

---

## 📡 API Reference

### Main Backend API (`http://localhost:5000/api`)

| Method | Endpoint | Role Access | Purpose |
|---|---|---|---|
| `POST` | `/auth/login` | Public | Authenticates credentials & issues JWT token |
| `GET` | `/auth/personas` | Public | Retrieves pre-configured demo personas |
| `GET` | `/analytics/national` | Public | Aggregates national macro KPIs & state progress tables |
| `GET` | `/projects` | Authenticated | Lists infrastructure projects with stage metadata |
| `POST` | `/projects` | Agency / Admin | Submits new land acquisition project proposal |
| `GET` | `/parcels` | Authenticated | Fetches land parcels with GeoJSON polygons & survey numbers |
| `POST` | `/parcels/:id/verify` | Collector / SLAO | Records field demarcation, panchnama & GPS verification |
| `POST` | `/workflow/action` | Collector / SLAO / Agency | Executes statutory stage scrutiny action (Approve/Reject) |
| `POST` | `/workflow/notify` | Collector / SLAO / Admin | Issues Section 11/19 e-Gazette notification |
| `POST` | `/compensation/calculate` | Public | Computes RFCTLARR fair valuation, solatium & interest |
| `POST` | `/compensation/disburse` | Collector / SLAO | Executes Direct Benefit Transfer (DBT) batch with UTR codes |
| `GET` | `/rr/cases` | Authenticated | Lists R&R displaced families & entitlement statuses |
| `GET` | `/alerts` | Authenticated | Retrieves active SLA alerts & Section 19 expiry warnings |
| `POST` | `/alerts/:id/resolve` | Collector / Admin | Resolves SLA bottleneck alert with audit note |
| `GET` | `/audit-logs` | Super Admin | Returns immutable system audit log ledger |

### AI Microservice API (`http://localhost:8000`)

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Health check & model initialization check |
| `POST` | `/predict-delay` | Predicts delay in months & slippage probability using Scikit-Learn |
| `POST` | `/risk-score` | Computes composite 0–100 RFCTLARR statutory risk index |
| `POST` | `/detect-duplicates` | Runs Haversine distance (<80m) & survey collision checks on cadastre |
| `GET` | `/insights/administrative` | Generates executive policy recommendations for bottlenecks |

---

## 🐳 Docker Deployment

```bash
# Launch containerized multi-service stack
docker compose up -d --build
```

### Created Endpoints:
- **Frontend App (Nginx)**: `http://localhost:80`
- **Node Backend API**: `http://localhost:5000`
- **FastAPI AI Microservice**: `http://localhost:8000`
- **PostgreSQL Database**: `postgres://land_admin:NationalLandSecretPassword2026!@postgres:5432/national_land_db`

---

## ⚠️ Known Limitations

| Limitation | Planned Enhancement |
|---|---|
| Local SQLite database used in default zero-setup mode | PostgreSQL database driver configured in `docker-compose.yml` for enterprise cloud hosting |
| Email / SMS gateway simulation for gazette notifications | Integration with National Informatics Centre (NIC) SMS & email gateways |
| Offline field demarcation mode | Offline-first Progressive Web App (PWA) with background sync queue for remote survey areas |

---

<div align="center">

**Built for Transparent & Accelerated National Infrastructure Governance** · *RFCTLARR Act 2013 Statutory Framework*

</div>
