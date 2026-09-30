# 🛡️ VASPTrace — AI-Powered Blockchain Intelligence & VASP Attribution Platform

<div align="center">

![VASPTrace Banner](https://img.shields.io/badge/VASPTrace-Cyber%20Forensics-0ea5e9?style=for-the-badge&logo=shield&logoColor=white)
![SIH 182](https://img.shields.io/badge/SIH%20Problem-182-orange?style=for-the-badge)
![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?style=for-the-badge&logo=next.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-TypeScript-blue?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Ready-green?style=for-the-badge&logo=mongodb&logoColor=white)

**An enterprise-grade forensic investigation platform designed to de-anonymize illicit cryptocurrency fund flows, cluster multi-input transactions, and attribute unidentified wallets to Virtual Asset Service Providers (VASPs).**

[Live Features](#-key-capabilities) • [Architecture](#-architecture) • [Demo Walkthrough](#-recommended-demo-flow) • [Quick Start](#-quick-start) • [API Reference](#-api-endpoints)

---

</div>

## 📌 Problem Statement (SIH 182)

Criminal syndicates and illicit actors exploit cryptocurrency anonymity through complex layering techniques, mixer protocols, peeling chains, and rapid fan-out hops to obscure fund origins before cashing out through Virtual Asset Service Providers (VASPs) and centralized exchanges (CEXs).

Law enforcement and cyber intelligence agencies face significant hurdles:
- **Topology Obfuscation**: Hundreds of synthetic hops intentionally crafted to derail manual graph analysis.
- **Deposit Address De-coupling**: CEX deposit addresses change per transaction, masking exchange identity.
- **Evidentiary Gaps**: Raw blockchain data lacks legally compliant evidence chains required for courtroom subpoenas.

**VASPTrace** solves this by combining multi-hop graph analytics, heuristic behavioral scoring engines, deposit-sweep clustering, and AI-assisted investigation copilot intelligence into a unified, court-ready forensic command center.

---

## 🚀 Key Capabilities

### 1. 🔍 Interactive Fund Flow Visualizer
* **Dynamic Directed Graph**: Powered by `@xyflow/react` and `React Flow` to map UTXO/Account-model transactions across multiple hops.
* **Forensic Overlays**:
  * **Highlight VASP Path**: Focuses exclusively on direct pathways between suspicious seed wallets and identified VASP entities.
  * **Highlight Suspicious Flows**: Highlights high-velocity, high-value, or anomalous layering edges while dimming background noise.
* **Entity Inspector**: Interactive drawer providing granular wallet telemetry, risk scoring, transaction counts, balance estimates, and entity tags.

### 2. 🧠 Heuristic VASP Attribution Engine
* Multi-vector scoring algorithm analyzing:
  * **Deposit Sweep Detection**: Identifying periodic batch transfers to consolidated cold/hot storage clusters.
  * **Transaction Frequency & Bursts**: Timing analysis matching exchange operating patterns.
  * **Multi-Input Clustering (Co-spending)**: Consolidating common ownership heuristics.
  * **Entity Signature Matching**: Cross-referencing known exchange profiles (e.g., Garantex, Binance, OKX, Huobi, Wasabi Mixer).
* Outputs confidence intervals (`0-100%`) alongside detailed mathematical factor breakdowns.

### 3. ⚖️ Risk Scoring & AML Typology Engine
* 100-point multi-factor risk assessment model:
  * **Peeling Chain Typology**: Unveils small change returns masking bulk illicit transit.
  * **Mixer & Tumbler Interception**: Identifies interactions with privacy pools (CoinJoin / Tornado Cash / Wasabi).
  * **Rapid Fan-Out & Layering**: Detects structured structuring across dozens of synthetic wallets within tight time frames.
* Prioritized action queues with severity triage: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`.

### 4. 📜 Evidentiary Chain & Immutable Audit Trails
* Cryptographically verifiable evidentiary logs for every discovered link.
* Source provenance tracking with SHA-256 integrity hashes.
* Full immutable investigator action logs tracking case queries, graph highlights, AI prompts, and report exports.

### 5. 🤖 AI Forensic Copilot
* Context-aware investigative copilot trained for blockchain cyber crime workflows.
* Quick-action prompts for:
  * Explaining complex layering hops in plain language.
  * Detecting AML red-flags and non-cooperative VASP jurisdictions.
  * Drafting legal subpoena questions for foreign law enforcement liaisons.

### 6. 📄 Court-Ready Subpoena PDF Dossier
* Single-click generation of forensically compliant investigation reports via `jsPDF`.
* Contains executive summaries, attribution matrices, wallet inventory, and evidentiary chain tables formatted for submission to judicial authorities.

---

## 🏗️ Architecture

```
VASPTrace/
├── backend/                             # Express + TypeScript Intelligence Server
│   ├── src/
│   │   ├── config/database.ts          # MongoDB connection w/ automatic in-memory fallback
│   │   ├── data/demoData.ts            # High-fidelity synthetic investigation cases
│   │   ├── engines/
│   │   │   ├── attributionEngine.ts    # Multi-vector VASP heuristic attribution
│   │   │   └── riskEngine.ts           # AML typology & 100-point risk calculator
│   │   ├── models/                     # 10 Mongoose schemas (Case, Wallet, VASP, Evidence, etc.)
│   │   ├── routes/                     # REST API endpoints (cases, wallets, attribution, etc.)
│   │   ├── scripts/seed.ts             # Database seeding utility
│   │   └── server.ts                   # Express server entry point (Port 4000)
│   └── tsconfig.json
│
├── frontend/                            # Next.js 16 (App Router) + React 19 Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx                # Tactical Command Center / KPI Dashboard
│   │   │   ├── cases/                  # Case listing, creation, and workflow
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Investigation Overview
│   │   │   │       ├── graph/          # Fund Flow Graph Visualizer
│   │   │   │       ├── attribution/    # VASP Attribution Matrix
│   │   │   │       ├── evidence/       # Evidentiary Chain of Custody
│   │   │   │       ├── risk/           # Risk Scoring & Typologies
│   │   │   │       ├── copilot/        # AI Copilot Assistant
│   │   │   │       └── report/         # Court-Ready Dossier Generator
│   │   │   ├── reports/                # Global reports archive
│   │   │   ├── audit-logs/             # Immutable investigation audit trail
│   │   │   └── status/                 # Live system telemetry & API latency monitor
│   │   ├── components/                 # Tactical UI components (Sidebar, ClientWrapper)
│   │   └── lib/                        # Typed API client & jsPDF generation engine
│   └── tsconfig.json
│
├── PROJECT_STATUS.md                    # Verification status & QA test matrix
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB** *(Optional)*: Runs automatically in **Fallback Demo Mode** with comprehensive in-memory intelligence if MongoDB is not present.

### 1. Clone Repository
```bash
git clone https://github.com/sahil-14ku/sih-182.git
cd sih-182
```

### 2. Configure Backend
```bash
cd backend
npm install
```
*(Optional)* Create `.env` from template:
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/vasptrace
JWT_SECRET=vasptrace-secret-key-sih-2024
FRONTEND_URL=http://localhost:3000
```
Start Backend:
```bash
npm run dev
```
> Server starts on `http://localhost:4000`. You will see `[🟢 Database connected]` or `[🟡 Fallback Demo Mode active]`.

### 3. Configure Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
> Frontend compiles and launches on `http://localhost:3000`.

---

## 🎯 Recommended Demo Flow

For evaluators and jury demonstrations, follow this structured investigative flow:

1. **Operational Command Center** (`/`):
   - Review live KPIs (Active Cases, High-Risk Wallets, Flagged VASPs, Traced Volume).
   - Inspect the **Active Priority Queue** table with real-time risk badges and wallet truncation.
2. **Investigation Workspace** (`/cases`):
   - Select **CASE-001 (Ransomware Extortion & Garantex Cashout)**.
3. **Execute Analysis** (`/cases/CASE-001/analyze`):
   - Watch the animated heuristic engine perform multi-hop graph traversal and clustering.
4. **Fund Flow Visualizer** (`/cases/CASE-001/graph`):
   - Pan and zoom the multi-hop transaction topology.
   - Click **Highlight VASP Path** to isolate the deposit corridor to Garantex.
   - Click **Highlight Suspicious Flows** to trace illicit peeling chains.
   - Click any wallet node to inspect balance, transaction counts, and risk tags in the right-side inspector.
5. **VASP Attribution** (`/cases/CASE-001/attribution`):
   - Inspect the attribution confidence ring (`78% Conf.` for Garantex).
   - Review the candidate breakdown (Binance, OKX, Wasabi Mixer).
6. **Evidentiary Chain** (`/cases/CASE-001/evidence`):
   - Review forensic proof tokens, source tags, and cryptographic verification hashes.
7. **Risk & Typologies** (`/cases/CASE-001/risk`):
   - View the precision calibrated **Overall Risk Rating Gauge (82/100 HIGH)**.
   - Check detected typologies (Peeling Chain, CoinJoin Mixer, Rapid Fan-Out).
8. **AI Forensic Copilot** (`/cases/CASE-001/copilot`):
   - Trigger automated queries to analyze laundering paths or draft subpoena queries.
9. **Export Dossier** (`/cases/CASE-001/report`):
   - Select classification level (`CONFIDENTIAL`, `RESTRICTED`, `SECRET`) and generate a formal courtroom PDF report.
10. **System Telemetry & Audit Logs**:
    - Visit `/audit-logs` to show accountability logs.
    - Visit `/status` to demonstrate live microservice latency monitoring.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/health` | Microservice health check & MongoDB connection status |
| `GET` | `/api/cases` | Retrieve all active investigative cases |
| `POST` | `/api/cases` | Create a new cryptocurrency investigation |
| `GET` | `/api/cases/:id` | Retrieve comprehensive case telemetry & graph |
| `POST` | `/api/cases/:id/analyze` | Trigger heuristic clustering & attribution engines |
| `GET` | `/api/wallets/:address` | Deep-dive telemetry for specific blockchain wallet |
| `GET` | `/api/attribution/:caseId` | VASP candidate vectors & confidence scores |
| `GET` | `/api/evidence/:caseId` | Evidentiary chain of custody items |
| `POST` | `/api/copilot/query` | AI forensic assistant query handler |
| `GET` | `/api/reports` | List generated intelligence reports |
| `POST` | `/api/reports` | Persist new legal report metadata |
| `GET` | `/api/audit-logs` | Retrieve filterable, paginated audit records |

---

## 💻 Tech Stack

| Layer | Technologies |
|:------|:-------------|
| **Frontend Core** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling & Theme** | Tailwind CSS v4, Custom Tactical Cyber-Forensics Dark Theme, CSS Grid |
| **Visualization** | React Flow (`@xyflow/react`), Recharts, Lucide Icons |
| **Document Generation** | jsPDF, html2canvas |
| **Backend Core** | Express.js, TypeScript, ts-node-dev |
| **Database & ODM** | MongoDB, Mongoose 8 (with In-Memory Fallback Adapter) |
| **Security & Auditing** | Helmet, CORS, Express Rate Limit, Morgan, JSON Web Tokens (JWT) |

---

## ⚖️ Legal & Ethical Notice

*VASPTrace is an educational and forensic research prototype developed for Smart India Hackathon. All blockchain telemetry, wallet addresses, transaction IDs, and entity attributions in the standard demonstration mode are synthetically generated for simulation and presentation purposes.*

---

<div align="center">

**Developed with ❤️ for Smart India Hackathon (SIH 182)**

</div>