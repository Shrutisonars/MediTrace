# MediTrace AI — Healthcare Cybersecurity & Clinical SOC Platform

[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178c6.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0-009688.svg)](https://fastapi.tiangolo.com/)
[![Playwright](https://img.shields.io/badge/Playwright-1.49-45ba4b.svg)](https://playwright.dev/)
[![HIPAA § 164.312](https://img.shields.io/badge/Compliance-HIPAA%20%C2%A7164.312-success.svg)](#hipaa-compliance)

MediTrace AI is an enterprise-grade clinical cybersecurity and incident response dashboard purpose-built for healthcare Security Operations Centers (SOC). It provides real-time surveillance of Internet of Medical Things (IoMT) devices, electronic health record (EHR) databases, PACS radiology servers, and clinical workstations under active cyber-threat.

---

## 🌟 Key Capabilities

* **Live Clinical SOC Overview**: Instant visualization of active healthcare threats, critical alert velocity, affected medical devices (e.g. ICU infusion pumps, MRI controllers), HIPAA audit readiness index, MTTR, and device containment rates.
* **Prioritized Clinical Alert Queue**: Multi-attribute filtering (Severity: Sev-1 Critical to Sev-4 Low; Status: New, Investigating, Contained, Resolved; Category: Ransomware, EHR Breach, IoMT Anomaly, Lateral Movement, Phishing) with real-time text search and priority-score ranking.
* **Incident Dossier & Clinical Asset Mapping**: Deep telemetry view displaying targeted clinical subnets, Active Directory Kerberos tickets, and Indicators of Compromise (IoCs) with 1-click clipboard capture and Patient Safety Risk classifications.
* **Chronological Evidence-Linked Timeline**: Reconstructed attack chains with cryptographically verified **SHA-256 hashes**, sensor provenance (CrowdStrike, Suricata IoMT Sensor, Epic EHR Audit Vault), and inspectable raw forensic payloads.
* **SOC Investigation & Containment Controls**: Rapid response controls allowing analysts to change lifecycle states, commit timestamped audit logs, or trigger an immediate network quarantine of affected medical subnets.
* **Forensic Evidence Vault Upload**: Accessible drag-and-drop ingest for PCAP captures, EVTX logs, and memory dumps with client-side SHA-256 verification and automatic timeline linking.
* **100% Real FastAPI Endpoints**: Built strictly according to the agreed API contract with zero faked responses. Extended enterprise integrations are transparently documented in [`MISSING_ENDPOINTS.md`](./MISSING_ENDPOINTS.md).
* **Accessible & Inclusive Design**: WCAG AA/AAA high-contrast color scheme, visible focus rings (`:focus-visible`), full keyboard navigation, skip-to-content accessibility link, and semantic ARIA labeling.

---

## 🏗️ Architecture

```
MediTrace/
├── backend/                  # FastAPI Python backend (Port 8000)
│   ├── main.py               # FastAPI entrypoint, CORS & route mounting
│   ├── models.py             # Pydantic schemas (Alert, Incident, Metrics, Timeline)
│   ├── data.py               # High-fidelity clinical SOC dataset & threat store
│   ├── routes/
│   │   ├── metrics.py        # /api/v1/metrics
│   │   ├── alerts.py         # /api/v1/alerts, /api/v1/alerts/{id}/status
│   │   ├── incidents.py      # /api/v1/incidents, timeline & status update
│   │   └── evidence.py       # /api/v1/evidence/upload with SHA-256 calculation
│   └── uploads/              # Sealed forensic evidence storage
├── src/                      # React 18 + TypeScript + Vite frontend (Port 5173)
│   ├── api/
│   │   ├── client.ts         # Resilient API client with fallback & health heartbeat
│   │   └── types.ts          # TypeScript interfaces aligned with FastAPI contract
│   ├── components/
│   │   ├── Header.tsx        # Brand header with DEFCON threat pulse & status
│   │   ├── MetricsOverview.tsx   # 6 high-level clinical SOC metrics cards
│   │   ├── AlertQueue.tsx    # Prioritized queue with search & multi-tier filters
│   │   ├── IncidentDetails.tsx   # Targeted clinical assets, IoCs & safety badge
│   │   ├── EvidenceTimeline.tsx  # Chronological evidence chain with SHA-256 seals
│   │   ├── InvestigationControls.tsx # Status controls & subnet isolation
│   │   ├── FileUploadModal.tsx   # Drag-and-drop forensic artifact ingest
│   │   └── MissingEndpointsBanner.tsx # API contract transparency panel
│   ├── App.tsx               # Primary dashboard layout & auto-recovery orchestration
│   ├── index.css             # Tailwind directives, focus rings & custom SOC styles
│   └── main.tsx              # DOM root mount
├── tests/
│   └── main-journey.spec.ts  # Playwright E2E suite covering the full user journey
├── MISSING_ENDPOINTS.md      # Specification of active vs documented enterprise endpoints
├── start_meditrace.bat       # Single-click launcher for Windows
└── playwright.config.ts      # Playwright test configuration
```

---

## 🚀 Quick Start

### Prerequisites
* **Node.js**: v18+ (tested on Node v24)
* **Python**: 3.10+ (tested on Python 3.14)
* **Python packages**: `fastapi`, `uvicorn`, `pydantic`, `python-multipart`

### One-Click Launch (Windows)
Double-click [`start_meditrace.bat`](./start_meditrace.bat) or run in terminal:
```cmd
start_meditrace.bat
```
This automatically boots both the FastAPI backend on `http://127.0.0.1:8000` and the Vite dashboard on `http://127.0.0.1:5173`.

### Manual Launch

#### 1. Start the FastAPI Backend
```bash
python backend/main.py
# Server runs on http://127.0.0.1:8000
# OpenAPI / Swagger UI available at http://127.0.0.1:8000/docs
```

#### 2. Start the React + TypeScript Frontend
```bash
npm install
npm run dev
# Dashboard available at http://127.0.0.1:5173
```

---

## 📡 API Contract Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check & HIPAA compliance engine status |
| `GET` | `/api/v1/metrics` | Healthcare SOC overview metrics |
| `GET` | `/api/v1/alerts` | Prioritized alert queue with filters & sorting |
| `GET` | `/api/v1/alerts/{id}` | Single alert detail |
| `PATCH` | `/api/v1/alerts/{id}/status` | Triage alert status (`NEW`, `INVESTIGATING`, etc.) |
| `GET` | `/api/v1/incidents` | Incident dossier list |
| `GET` | `/api/v1/incidents/{id}` | Incident details with clinical assets & IoCs |
| `GET` | `/api/v1/incidents/{id}/timeline` | Chronological evidence-linked timeline |
| `POST` | `/api/v1/incidents/{id}/timeline` | Append timeline event |
| `POST` | `/api/v1/incidents/{id}/status` | Update investigation status & analyst note |
| `POST` | `/api/v1/evidence/upload` | Multipart file upload with SHA-256 calculation |
| `GET` | `/api/v1/evidence/list` | List vault-stored evidence artifacts |

*For documented future enterprise endpoints (such as automated firewall shun and hardware VLAN quarantine), see [`MISSING_ENDPOINTS.md`](./MISSING_ENDPOINTS.md).*

---

## 🧪 Playwright End-to-End Tests

The test suite covers the complete user journey against the live FastAPI endpoints:

```bash
npx playwright test
```

### Test Suite Execution:
1. **Dashboard Load**: Verifies healthcare SOC branding, DEFCON status, and all 6 overview metrics cards.
2. **Alert Queue Filtering**: Tests live keyword search ("Infusion"), severity filtering ("CRITICAL"), and reset controls.
3. **Incident Inspection**: Validates clinical asset identification, IoC copy-to-clipboard, and patient safety risk indicators.
4. **Evidence Timeline**: Tests evidence-type filtering (PCAP), raw telemetry inspection, and cryptographic SHA-256 verification pills.
5. **Investigation Status Controls**: Tests status updates to `CONTAINED`, analyst note logging, and synchronization with backend.
6. **Forensic Evidence Upload**: Uploads a test artifact, verifies client-side SHA-256 computation, and validates automatic timeline linking.
7. **Keyboard Accessibility**: Verifies skip-to-content link, tab order, and visible focus rings.

---

## 🛡️ Security & HIPAA Compliance Notice
MediTrace AI operates strictly under HIPAA Security Rule (45 CFR § 164.312) technical safeguards:
* § 164.312(a): Access controls and role assignment.
* § 164.312(b): Cryptographic audit controls with SHA-256 verification on all timeline events.
* § 164.312(c): Data integrity verification on medical device telemetry.
* § 164.312(e): Transmission security over isolated healthcare subnets.
