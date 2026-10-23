# MediTrace AI - API Contract & Missing Endpoints Documentation

## Overview
This document specifies the agreed API contract for MediTrace AI Healthcare Cybersecurity Dashboard and explicitly documents all active endpoints as well as pending enterprise endpoints. Per architectural directives, no mock responses are faked in place of missing backend functionality; instead, missing endpoints are formally documented below.

---

## 1. Verified Active FastAPI Endpoints (`http://127.0.0.1:8000/api/v1`)

| Method | Endpoint | Description | Contract Schema | Status |
|---|---|---|---|---|
| `GET` | `/api/v1/metrics` | Healthcare SOC overview metrics, critical threat counters, HIPAA risk index, MTTR | `MetricOverview` | **ACTIVE** |
| `GET` | `/api/v1/alerts` | Prioritized alert queue with filtering by severity, category, status, search, and sorting | `List[Alert]` | **ACTIVE** |
| `GET` | `/api/v1/alerts/{alert_id}` | Detailed alert record with IoMT device, IP metadata, and department | `Alert` | **ACTIVE** |
| `PATCH` | `/api/v1/alerts/{alert_id}/status` | Triage alert status (`NEW`, `INVESTIGATING`, `CONTAINED`, `RESOLVED`, `FALSE_POSITIVE`) | `Alert` | **ACTIVE** |
| `GET` | `/api/v1/incidents` | Incident registry filtered by severity and patient safety risk | `List[Incident]` | **ACTIVE** |
| `GET` | `/api/v1/incidents/{incident_id}` | Full incident investigation dossier with clinical assets, IoCs, and notes | `Incident` | **ACTIVE** |
| `GET` | `/api/v1/incidents/{incident_id}/timeline` | Chronological evidence-linked timeline with cryptographic SHA-256 hashes | `List[TimelineEvent]` | **ACTIVE** |
| `POST` | `/api/v1/incidents/{incident_id}/timeline` | Append timeline event with chain-of-custody metadata | `TimelineEvent` | **ACTIVE** |
| `POST` | `/api/v1/incidents/{incident_id}/status` | Update incident status and record analyst audit log | `Incident` | **ACTIVE** |
| `POST` | `/api/v1/evidence/upload` | Multipart file upload for PCAP, EVTX, and memory dumps with automated hash computation and timeline linking | `FileUploadResponse` | **ACTIVE** |
| `GET` | `/api/v1/evidence/list` | List vault-stored evidence artifacts | `List[FileUploadResponse]` | **ACTIVE** |

---

## 2. Documented Missing / Deferred Enterprise Endpoints

The following endpoints are part of the extended enterprise architectural roadmap and are **documented here rather than being silently mocked in the frontend**:

### 2.1 `POST /api/v1/containment/firewall-shun`
* **Purpose**: Automated Cisco ASA / Palo Alto PanOS BGP null-route trigger for IoC C2 IP addresses.
* **Why Missing**: Requires physical firewall API token with write-level admin rights and integration with clinical safety fail-safes (preventing accidental disconnection of active surgical equipment).
* **Workaround**: Analysts manually verify external C2 IPs from the Incident IoC list and initiate network isolation through the Cisco ISE console.

### 2.2 `POST /api/v1/devices/{device_id}/quarantine`
* **Purpose**: Port-level 802.1X dynamic VLAN assignment to isolate compromised infusion pumps or MRI controllers into a sterile sandbox VLAN.
* **Why Missing**: Pending integration with hospital NAC (Network Access Control) controllers and FDA 510(k) fail-safe compliance validation.
* **Workaround**: Incident status change to `CONTAINED` triggers an alert notification for clinical floor engineers to switch pumps to offline autonomous battery operation.

### 2.3 `POST /api/v1/compliance/hipaa/export-audit`
* **Purpose**: Generates a cryptographically signed PDF/JSON audit package conforming to HIPAA Security Rule 45 CFR § 164.312(b).
* **Why Missing**: Scheduled for MediTrace AI v1.2 release alongside the dedicated Compliance Reporting microservice.
* **Workaround**: Timeline events provide individual SHA-256 evidence hashes and chain-of-custody records that can be audited via the `/api/v1/incidents/{id}/timeline` endpoint.

### 2.4 `POST /api/v1/integrations/siem/webhook`
* **Purpose**: Ingest real-time alert streams from external SIEMs (Splunk ES, Microsoft Sentinel, IBM QRadar).
* **Why Missing**: Requires enterprise webhook authentication token configuration and TLS mutual authentication (mTLS).
* **Workaround**: The built-in `/api/v1/alerts` queue handles direct ingestion and query capabilities.
