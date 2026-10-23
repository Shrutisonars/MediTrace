from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class AlertSeverity(str, Enum):
    CRITICAL = "CRITICAL"
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"

class AlertStatus(str, Enum):
    NEW = "NEW"
    INVESTIGATING = "INVESTIGATING"
    CONTAINED = "CONTAINED"
    RESOLVED = "RESOLVED"
    FALSE_POSITIVE = "FALSE_POSITIVE"

class AlertCategory(str, Enum):
    RANSOMWARE = "RANSOMWARE"
    EHR_BREACH = "EHR_BREACH"
    IOMT_ANOMALY = "IOMT_ANOMALY"
    DATA_EXFILTRATION = "DATA_EXFILTRATION"
    LATERAL_MOVEMENT = "LATERAL_MOVEMENT"
    PHISHING = "PHISHING"

class EvidenceType(str, Enum):
    PCAP = "PCAP"
    HL7 = "HL7"
    DICOM = "DICOM"
    MEMORY = "MEMORY"
    FIREWALL = "FIREWALL"
    AUDIT = "AUDIT"

class PatientSafetyRisk(str, Enum):
    CRITICAL = "CRITICAL"
    MODERATE = "MODERATE"
    LOW = "LOW"
    NONE = "NONE"

class TimelineEvent(BaseModel):
    id: str
    incident_id: str
    timestamp: str
    title: str
    description: str
    evidence_type: EvidenceType
    source: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    evidence_hash: Optional[str] = None
    raw_payload: Optional[str] = None
    chain_of_custody: Optional[str] = None

class Alert(BaseModel):
    id: str
    incident_id: str
    title: str
    description: str
    severity: AlertSeverity
    status: AlertStatus
    category: AlertCategory
    priority_score: int = Field(..., ge=1, le=100)
    created_at: str
    source_ip: Optional[str] = None
    destination_ip: Optional[str] = None
    affected_device: str
    device_type: str  # e.g., "Infusion Pump", "EHR Server", "PACS Workstation"
    department: str   # e.g., "ICU", "Radiology", "Cardiology", "Records"

class Incident(BaseModel):
    id: str
    title: str
    description: str
    severity: AlertSeverity
    status: AlertStatus
    category: AlertCategory
    priority_score: int = Field(..., ge=1, le=100)
    created_at: str
    updated_at: str
    affected_assets: List[str]
    iocs: List[str]
    patient_safety_risk: PatientSafetyRisk
    assigned_analyst: str
    notes: List[str] = []
    alert_ids: List[str] = []

class MetricOverview(BaseModel):
    active_threats: int
    critical_alerts: int
    affected_devices: int
    hipaa_risk_score: float
    mttr_minutes: int
    containment_rate: float
    total_alerts_today: int
    system_status: str

class StatusUpdateRequest(BaseModel):
    status: AlertStatus
    notes: Optional[str] = None
    analyst_name: Optional[str] = "SOC Analyst 1"

class FileUploadResponse(BaseModel):
    file_id: str
    filename: str
    file_size_bytes: int
    sha256: str
    mime_type: str
    uploaded_at: str
    tags: List[str]
    incident_id: Optional[str] = None
    verified: bool
