import { useState, useEffect, useCallback } from 'react';
import { api } from './api/client';
import { 
  MetricOverview, 
  Alert, 
  AlertFilterParams, 
  Incident, 
  TimelineEvent, 
  AlertStatus, 
  EvidenceType 
} from './api/types';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { AlertQueue } from './components/AlertQueue';
import { IncidentDetails } from './components/IncidentDetails';
import { EvidenceTimeline } from './components/EvidenceTimeline';
import { InvestigationControls } from './components/InvestigationControls';
import { FileUploadModal } from './components/FileUploadModal';
import { MissingEndpointsBanner } from './components/MissingEndpointsBanner';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function App() {
  const [metrics, setMetrics] = useState<MetricOverview | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  
  // Filter states
  const [filters, setFilters] = useState<AlertFilterParams>({});
  const [selectedEvidenceType, setSelectedEvidenceType] = useState<EvidenceType | undefined>(undefined);

  // Status & loading states
  const [backendConnected, setBackendConnected] = useState<boolean>(true);
  const [metricsLoading, setMetricsLoading] = useState<boolean>(true);
  const [alertsLoading, setAlertsLoading] = useState<boolean>(true);
  const [incidentLoading, setIncidentLoading] = useState<boolean>(false);
  const [timelineLoading, setTimelineLoading] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload modal state
  const [uploadModalOpen, setUploadModalOpen] = useState<boolean>(false);

  // Load metrics from FastAPI
  const loadMetrics = useCallback(async () => {
    try {
      setMetricsLoading(true);
      const data = await api.fetchMetrics();
      setMetrics(data);
      setBackendConnected(true);
      setErrorMessage(null);
    } catch (err: any) {
      console.error('Failed to load metrics:', err);
      setBackendConnected(false);
      setErrorMessage(`Cannot reach FastAPI backend: ${err.message}. Ensure backend is running at http://127.0.0.1:8000.`);
    } finally {
      setMetricsLoading(false);
    }
  }, []);

  // Load alerts from FastAPI
  const loadAlerts = useCallback(async () => {
    try {
      setAlertsLoading(true);
      const data = await api.fetchAlerts(filters);
      setAlerts(data);
      setBackendConnected(true);

      // Default select the first alert if none selected
      if (!selectedAlert && data.length > 0) {
        setSelectedAlert(data[0]);
      }
    } catch (err: any) {
      console.error('Failed to load alerts:', err);
      setBackendConnected(false);
      setErrorMessage(`Failed to query alert queue: ${err.message}`);
    } finally {
      setAlertsLoading(false);
    }
  }, [filters, selectedAlert]);

  // Load incident details and its evidence timeline when an alert or incident is active
  const loadIncidentAndTimeline = useCallback(async (incidentId: string) => {
    try {
      setIncidentLoading(true);
      setTimelineLoading(true);

      const [inc, timeline] = await Promise.all([
        api.fetchIncident(incidentId),
        api.fetchIncidentTimeline(incidentId, selectedEvidenceType)
      ]);

      setSelectedIncident(inc);
      setTimelineEvents(timeline);
    } catch (err: any) {
      console.error('Failed to load incident dossier:', err);
      setErrorMessage(`Failed to retrieve incident dossier: ${err.message}`);
    } finally {
      setIncidentLoading(false);
      setTimelineLoading(false);
    }
  }, [selectedEvidenceType]);

  // Initial load
  useEffect(() => {
    loadMetrics();
    loadAlerts();
  }, [loadMetrics, loadAlerts]);

  // Update incident and timeline when selectedAlert changes
  useEffect(() => {
    if (selectedAlert) {
      loadIncidentAndTimeline(selectedAlert.incident_id);
    }
  }, [selectedAlert, loadIncidentAndTimeline]);

  // Handle alert selection from queue
  const handleSelectAlert = (alert: Alert) => {
    setSelectedAlert(alert);
  };

  // Handle alert quick triage
  const handleUpdateAlertStatus = async (alertId: string, newStatus: AlertStatus) => {
    try {
      const updated = await api.updateAlertStatus(alertId, newStatus);
      // Update local alerts list
      setAlerts(prev => prev.map(a => a.id === alertId ? updated : a));
      if (selectedAlert?.id === alertId) {
        setSelectedAlert(updated);
      }
      // Refresh metrics
      loadMetrics();
      if (selectedIncident) {
        loadIncidentAndTimeline(selectedIncident.id);
      }
    } catch (err: any) {
      setErrorMessage(`Failed to update alert: ${err.message}`);
    }
  };

  // Handle investigation status change & note submission
  const handleUpdateInvestigationStatus = async (
    incidentId: string, 
    status: AlertStatus, 
    notes?: string
  ) => {
    try {
      setActionLoading(true);
      const updatedInc = await api.updateInvestigationStatus(incidentId, {
        status,
        notes,
        analyst_name: 'Dr. Sarah Chen, Lead SOC Analyst'
      });
      setSelectedIncident(updatedInc);
      
      // Also refresh alerts and metrics to keep all UI states synchronized
      await Promise.all([loadAlerts(), loadMetrics()]);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle evidence file upload
  const handleUploadFile = async (
    file: File, 
    incidentId?: string, 
    tags?: string, 
    evidenceType?: EvidenceType
  ) => {
    return api.uploadEvidenceFile(file, incidentId, tags, evidenceType);
  };

  const handleUploadSuccess = () => {
    // Refresh timeline and metrics
    if (selectedIncident) {
      loadIncidentAndTimeline(selectedIncident.id);
    }
    loadMetrics();
  };

  // Unique incident IDs for the file upload dropdown
  const allIncidentIds = Array.from(new Set(alerts.map(a => a.incident_id))).filter(Boolean);

  return (
    <div className="min-h-screen bg-soc-darkest text-slate-100 flex flex-col font-sans">
      {/* Skip to Content for Keyboard Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main SOC dashboard content
      </a>

      {/* Header */}
      <Header
        onOpenUpload={() => setUploadModalOpen(true)}
        backendConnected={backendConnected}
        activeThreatCount={metrics?.active_threats || 0}
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 focus:outline-none">
        {/* Backend Error Banner */}
        {errorMessage && (
          <div 
            className="mb-4 p-3 rounded-lg bg-rose-950/80 border border-rose-500/80 text-rose-200 text-xs flex items-center justify-between"
            role="alert"
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                loadMetrics();
                loadAlerts();
              }}
              className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-900 hover:bg-rose-800 text-white rounded font-medium text-[11px] transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* API Contract & Missing Endpoints Documentation Banner */}
        <MissingEndpointsBanner />

        {/* Metrics Overview */}
        <MetricsOverview
          metrics={metrics}
          loading={metricsLoading}
        />

        {/* Split Clinical Cyber Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Prioritized Alert Queue (5 cols on lg) */}
          <div className="lg:col-span-5 h-[800px] flex flex-col">
            <AlertQueue
              alerts={alerts}
              loading={alertsLoading}
              selectedAlertId={selectedAlert?.id || null}
              onSelectAlert={handleSelectAlert}
              onUpdateAlertStatus={handleUpdateAlertStatus}
              onFilterChange={setFilters}
              filters={filters}
            />
          </div>

          {/* Right Column: Incident Dossier, Evidence Timeline & Controls (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Incident Details Dossier */}
            <IncidentDetails
              incident={selectedIncident}
              loading={incidentLoading}
            />

            {/* Investigation Controls & Containment */}
            <InvestigationControls
              incident={selectedIncident}
              onUpdateStatus={handleUpdateInvestigationStatus}
              loading={actionLoading}
            />

            {/* Chronological Evidence-Linked Timeline */}
            <EvidenceTimeline
              events={timelineEvents}
              loading={timelineLoading}
              selectedEvidenceType={selectedEvidenceType}
              onFilterEvidenceType={setSelectedEvidenceType}
              incidentId={selectedIncident?.id || 'INC-8092'}
            />
          </div>
        </div>
      </main>

      {/* Forensic Evidence Upload Modal */}
      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        onUploadFile={handleUploadFile}
        incidentIds={allIncidentIds.length > 0 ? allIncidentIds : ['INC-8092', 'INC-8093', 'INC-8094']}
        defaultIncidentId={selectedIncident?.id}
      />

      {/* Footer */}
      <footer className="bg-soc-dark border-t border-soc-border py-4 px-6 text-center text-xs text-slate-500 font-mono mt-8">
        <p>MediTrace AI Healthcare Security Operations Platform &copy; 2026. Certified for IoMT Cyber-Vulnerability Surveillance & HIPAA Safe Harbor Enforcement.</p>
      </footer>
    </div>
  );
}

export default App;
