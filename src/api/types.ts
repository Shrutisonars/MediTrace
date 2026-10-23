export type AlertSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type AlertStatus = 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE';
export type AlertCategory = 
  | 'RANSOMWARE' 
  | 'EHR_BREACH' 
  | 'IOMT_ANOMALY' 
  | 'DATA_EXFILTRATION' 
  | 'LATERAL_MOVEMENT' 
  | 'PHISHING';

export type EvidenceType = 'PCAP' | 'HL7' | 'DICOM' | 'MEMORY' | 'FIREWALL' | 'AUDIT';
export type PatientSafetyRisk = 'CRITICAL' | 'MODERATE' | 'LOW' | 'NONE';

export interface TimelineEvent {
  id: string;
  incident_id: string;
  timestamp: string;
  title: string;
  description: string;
  evidence_type: EvidenceType;
  source: string;
  confidence_score: number;
  evidence_hash?: string;
  raw_payload?: string;
  chain_of_custody?: string;
}

export interface Alert {
  id: string;
  incident_id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;
  priority_score: number;
  created_at: string;
  source_ip?: string;
  destination_ip?: string;
  affected_device: string;
  device_type: string;
  department: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  status: AlertStatus;
  category: AlertCategory;
  priority_score: number;
  created_at: string;
  updated_at: string;
  affected_assets: string[];
  iocs: string[];
  patient_safety_risk: PatientSafetyRisk;
  assigned_analyst: string;
  notes: string[];
  alert_ids: string[];
}

export interface MetricOverview {
  active_threats: number;
  critical_alerts: number;
  affected_devices: number;
  hipaa_risk_score: number;
  mttr_minutes: number;
  containment_rate: number;
  total_alerts_today: number;
  system_status: string;
}

export interface StatusUpdateRequest {
  status: AlertStatus;
  notes?: string;
  analyst_name?: string;
}

export interface FileUploadResponse {
  file_id: string;
  filename: string;
  file_size_bytes: number;
  sha256: string;
  mime_type: string;
  uploaded_at: string;
  tags: string[];
  incident_id?: string;
  verified: boolean;
}

export interface AlertFilterParams {
  severity?: AlertSeverity;
  status?: AlertStatus;
  category?: AlertCategory;
  department?: string;
  search?: string;
  sort_by?: 'priority_score' | 'created_at' | 'severity';
  order?: 'asc' | 'desc';
}
