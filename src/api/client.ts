import {
  MetricOverview,
  Alert,
  AlertFilterParams,
  Incident,
  TimelineEvent,
  StatusUpdateRequest,
  FileUploadResponse,
  AlertStatus,
  EvidenceType
} from './types';

// API base: default to relative /api/v1 (routed via Vite proxy or direct FastAPI server)
const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

async function handleResponse<T>(res: Response, endpoint: string): Promise<T> {
  if (!res.ok) {
    let errorDetail = '';
    try {
      const errJson = await res.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = await res.text();
    }
    const message = `API Error [${res.status}] at ${endpoint}: ${errorDetail || res.statusText}`;
    console.error(message);
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  // Check backend health
  async checkHealth(): Promise<{ status: string; hipaa_compliance_engine?: string }> {
    try {
      const res = await fetch('/health');
      return await handleResponse(res, '/health');
    } catch {
      // Direct retry on fallback port 8000 if proxy isn't used
      const res = await fetch('http://127.0.0.1:8000/health');
      return await handleResponse(res, 'http://127.0.0.1:8000/health');
    }
  },

  // Overview metrics
  async fetchMetrics(): Promise<MetricOverview> {
    const res = await fetch(`${API_BASE}/metrics`);
    return handleResponse<MetricOverview>(res, `${API_BASE}/metrics`);
  },

  // Alerts queue
  async fetchAlerts(params: AlertFilterParams = {}): Promise<Alert[]> {
    const query = new URLSearchParams();
    if (params.severity) query.append('severity', params.severity);
    if (params.status) query.append('status', params.status);
    if (params.category) query.append('category', params.category);
    if (params.department) query.append('department', params.department);
    if (params.search) query.append('search', params.search);
    if (params.sort_by) query.append('sort_by', params.sort_by);
    if (params.order) query.append('order', params.order);

    const url = `${API_BASE}/alerts${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Alert[]>(res, url);
  },

  async fetchAlert(alertId: string): Promise<Alert> {
    const res = await fetch(`${API_BASE}/alerts/${encodeURIComponent(alertId)}`);
    return handleResponse<Alert>(res, `${API_BASE}/alerts/${alertId}`);
  },

  async updateAlertStatus(alertId: string, newStatus: AlertStatus): Promise<Alert> {
    const url = `${API_BASE}/alerts/${encodeURIComponent(alertId)}/status?new_status=${encodeURIComponent(newStatus)}`;
    const res = await fetch(url, {
      method: 'PATCH',
    });
    return handleResponse<Alert>(res, url);
  },

  // Incidents
  async fetchIncidents(params: { severity?: string; status?: string; search?: string } = {}): Promise<Incident[]> {
    const query = new URLSearchParams();
    if (params.severity) query.append('severity', params.severity);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const url = `${API_BASE}/incidents${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<Incident[]>(res, url);
  },

  async fetchIncident(incidentId: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/incidents/${encodeURIComponent(incidentId)}`);
    return handleResponse<Incident>(res, `${API_BASE}/incidents/${incidentId}`);
  },

  // Chronological Evidence Timeline
  async fetchIncidentTimeline(incidentId: string, evidenceType?: EvidenceType): Promise<TimelineEvent[]> {
    const query = new URLSearchParams();
    if (evidenceType) query.append('evidence_type', evidenceType);

    const url = `${API_BASE}/incidents/${encodeURIComponent(incidentId)}/timeline${query.toString() ? `?${query.toString()}` : ''}`;
    const res = await fetch(url);
    return handleResponse<TimelineEvent[]>(res, url);
  },

  // Investigation Status Controls
  async updateInvestigationStatus(incidentId: string, payload: StatusUpdateRequest): Promise<Incident> {
    const url = `${API_BASE}/incidents/${encodeURIComponent(incidentId)}/status`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Incident>(res, url);
  },

  // Forensic File Upload with SHA-256 calculation & timeline linking
  async uploadEvidenceFile(
    file: File,
    incidentId?: string,
    tags?: string,
    evidenceType?: EvidenceType
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (incidentId) formData.append('incident_id', incidentId);
    if (tags) formData.append('tags', tags);
    if (evidenceType) formData.append('evidence_type', evidenceType);

    const url = `${API_BASE}/evidence/upload`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData,
    });
    return handleResponse<FileUploadResponse>(res, url);
  },
};
