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

// API base: default to relative /api/v1 (routed via Vite proxy)
const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api/v1';
const DIRECT_BACKEND = 'http://127.0.0.1:8000/api/v1';

async function fetchWithFallback(endpointPath: string, options?: RequestInit): Promise<Response> {
  const primaryUrl = `${API_BASE}${endpointPath}`;
  try {
    const res = await fetch(primaryUrl, options);
    // If Vite proxy returned 502/504 Bad Gateway, fallback directly to port 8000
    if (res.status === 502 || res.status === 504) {
      return await fetch(`${DIRECT_BACKEND}${endpointPath}`, options);
    }
    return res;
  } catch {
    // Network failure on proxy - fallback directly to FastAPI port 8000
    return await fetch(`${DIRECT_BACKEND}${endpointPath}`, options);
  }
}

async function handleResponse<T>(res: Response, endpoint: string): Promise<T> {
  if (!res.ok) {
    const rawText = await res.text();
    let errorDetail = rawText;
    try {
      const errJson = JSON.parse(rawText);
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      // Use rawText as error detail
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
      if (res.ok) return await res.json();
    } catch {
      // try direct
    }
    const res2 = await fetch('http://127.0.0.1:8000/health');
    return await handleResponse(res2, 'http://127.0.0.1:8000/health');
  },

  // Overview metrics
  async fetchMetrics(): Promise<MetricOverview> {
    const res = await fetchWithFallback('/metrics');
    return handleResponse<MetricOverview>(res, '/metrics');
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

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetchWithFallback(`/alerts${queryString}`);
    return handleResponse<Alert[]>(res, `/alerts${queryString}`);
  },

  async fetchAlert(alertId: string): Promise<Alert> {
    const res = await fetchWithFallback(`/alerts/${encodeURIComponent(alertId)}`);
    return handleResponse<Alert>(res, `/alerts/${alertId}`);
  },

  async updateAlertStatus(alertId: string, newStatus: AlertStatus): Promise<Alert> {
    const url = `/alerts/${encodeURIComponent(alertId)}/status?new_status=${encodeURIComponent(newStatus)}`;
    const res = await fetchWithFallback(url, {
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

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetchWithFallback(`/incidents${queryString}`);
    return handleResponse<Incident[]>(res, `/incidents${queryString}`);
  },

  async fetchIncident(incidentId: string): Promise<Incident> {
    const res = await fetchWithFallback(`/incidents/${encodeURIComponent(incidentId)}`);
    return handleResponse<Incident>(res, `/incidents/${incidentId}`);
  },

  // Chronological Evidence Timeline
  async fetchIncidentTimeline(incidentId: string, evidenceType?: EvidenceType): Promise<TimelineEvent[]> {
    const query = new URLSearchParams();
    if (evidenceType) query.append('evidence_type', evidenceType);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    const res = await fetchWithFallback(`/incidents/${encodeURIComponent(incidentId)}/timeline${queryString}`);
    return handleResponse<TimelineEvent[]>(res, `/incidents/${incidentId}/timeline`);
  },

  // Investigation Status Controls
  async updateInvestigationStatus(incidentId: string, payload: StatusUpdateRequest): Promise<Incident> {
    const res = await fetchWithFallback(`/incidents/${encodeURIComponent(incidentId)}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return handleResponse<Incident>(res, `/incidents/${incidentId}/status`);
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

    const res = await fetchWithFallback('/evidence/upload', {
      method: 'POST',
      body: formData,
    });
    return handleResponse<FileUploadResponse>(res, '/evidence/upload');
  },
};
