import React, { useState } from 'react';
import { Alert, AlertSeverity, AlertStatus, AlertCategory, AlertFilterParams } from '../api/types';
import { 
  Search, 
  Filter, 
  RotateCcw, 
  ChevronRight, 
  ShieldAlert, 
  Activity,
  ArrowUpDown
} from 'lucide-react';

interface AlertQueueProps {
  alerts: Alert[];
  loading: boolean;
  selectedAlertId: string | null;
  onSelectAlert: (alert: Alert) => void;
  onUpdateAlertStatus: (alertId: string, newStatus: AlertStatus) => Promise<void>;
  onFilterChange: (filters: AlertFilterParams) => void;
  filters: AlertFilterParams;
}

export const AlertQueue: React.FC<AlertQueueProps> = ({
  alerts,
  loading,
  selectedAlertId,
  onSelectAlert,
  onUpdateAlertStatus,
  onFilterChange,
  filters,
}) => {
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput });
  };

  const handleClearFilters = () => {
    setSearchInput('');
    onFilterChange({});
  };

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-950/70 text-rose-400 border-rose-500/50';
      case 'HIGH':
        return 'bg-amber-950/70 text-amber-400 border-amber-500/50';
      case 'MEDIUM':
        return 'bg-yellow-950/70 text-yellow-400 border-yellow-500/50';
      case 'LOW':
        return 'bg-blue-950/70 text-blue-400 border-blue-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status: AlertStatus) => {
    switch (status) {
      case 'NEW':
        return 'bg-cyan-950 text-cyan-300 border-cyan-800';
      case 'INVESTIGATING':
        return 'bg-amber-950 text-amber-300 border-amber-800 animate-pulse';
      case 'CONTAINED':
        return 'bg-purple-950 text-purple-300 border-purple-800';
      case 'RESOLVED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'FALSE_POSITIVE':
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <section 
      aria-labelledby="alert-queue-heading"
      className="bg-soc-card rounded-lg border border-soc-border flex flex-col h-full shadow-lg overflow-hidden"
    >
      {/* Header and Filter Controls */}
      <div className="p-4 border-b border-soc-border bg-soc-surface">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <h2 id="alert-queue-heading" className="text-base font-bold text-white tracking-wide">
              Prioritized Clinical Alert Queue
            </h2>
            <span 
              className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800"
              aria-label={`${alerts.length} alerts loaded`}
            >
              {alerts.length}
            </span>
          </div>

          {/* Quick Clear Filter */}
          {(filters.severity || filters.status || filters.category || filters.search) && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium underline-offset-4 hover:underline"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-3">
          <label htmlFor="alert-search-input" className="sr-only">
            Search alerts by keyword, device, or IP
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              id="alert-search-input"
              type="text"
              placeholder="Search by IOC, device name (e.g. Infusion Pump), IP..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full bg-soc-dark border border-soc-border rounded-md pl-9 pr-20 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded transition-colors"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Severity Filter */}
          <div>
            <label htmlFor="severity-filter" className="block text-[11px] font-medium text-slate-300 mb-1">
              Severity
            </label>
            <select
              id="severity-filter"
              value={filters.severity || ''}
              onChange={(e) => onFilterChange({ ...filters, severity: (e.target.value as AlertSeverity) || undefined })}
              className="w-full bg-soc-dark border border-soc-border rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-400"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical (Sev-1)</option>
              <option value="HIGH">High (Sev-2)</option>
              <option value="MEDIUM">Medium (Sev-3)</option>
              <option value="LOW">Low (Sev-4)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status-filter" className="block text-[11px] font-medium text-slate-300 mb-1">
              Investigation Status
            </label>
            <select
              id="status-filter"
              value={filters.status || ''}
              onChange={(e) => onFilterChange({ ...filters, status: (e.target.value as AlertStatus) || undefined })}
              className="w-full bg-soc-dark border border-soc-border rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-400"
            >
              <option value="">All Statuses</option>
              <option value="NEW">New</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="CONTAINED">Contained</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FALSE_POSITIVE">False Positive</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category-filter" className="block text-[11px] font-medium text-slate-300 mb-1">
              Attack Category
            </label>
            <select
              id="category-filter"
              value={filters.category || ''}
              onChange={(e) => onFilterChange({ ...filters, category: (e.target.value as AlertCategory) || undefined })}
              className="w-full bg-soc-dark border border-soc-border rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-400"
            >
              <option value="">All Categories</option>
              <option value="RANSOMWARE">Ransomware</option>
              <option value="EHR_BREACH">EHR Breach (HIPAA)</option>
              <option value="IOMT_ANOMALY">IoMT Anomaly</option>
              <option value="DATA_EXFILTRATION">Data Exfiltration</option>
              <option value="LATERAL_MOVEMENT">Lateral Movement</option>
              <option value="PHISHING">Phishing</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label htmlFor="sort-filter" className="block text-[11px] font-medium text-slate-300 mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-slate-400" aria-hidden="true" />
              <span>Sort By</span>
            </label>
            <select
              id="sort-filter"
              value={filters.sort_by || 'priority_score'}
              onChange={(e) => onFilterChange({ ...filters, sort_by: e.target.value as any })}
              className="w-full bg-soc-dark border border-soc-border rounded px-2 py-1 text-xs text-slate-200 focus:border-cyan-400"
            >
              <option value="priority_score">Priority Score (Highest)</option>
              <option value="created_at">Timestamp (Newest)</option>
              <option value="severity">Severity Rank</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert List Items */}
      <div 
        className="flex-1 overflow-y-auto divide-y divide-soc-border" 
        role="feed"
        aria-busy={loading}
      >
        {loading ? (
          <div className="p-6 text-center text-slate-400">
            <Activity className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" aria-hidden="true" />
            <p className="text-xs">Querying MediTrace alert stream...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <Filter className="w-8 h-8 mx-auto text-slate-600 mb-2" aria-hidden="true" />
            <p className="text-sm font-medium text-slate-300">No alerts match the active criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting filters or adjusting search terms.</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const isSelected = selectedAlertId === alert.id;
            return (
              <article
                key={alert.id}
                tabIndex={0}
                role="article"
                aria-label={`Alert ${alert.id}: ${alert.title}, Priority ${alert.priority_score}, Severity ${alert.severity}`}
                onClick={() => onSelectAlert(alert)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectAlert(alert);
                  }
                }}
                className={`p-3.5 transition-colors cursor-pointer outline-none ${
                  isSelected 
                    ? 'bg-cyan-950/40 border-l-4 border-l-cyan-400' 
                    : 'hover:bg-soc-surface focus-visible:bg-soc-surface'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Priority Score & Badges */}
                  <div className="flex items-center space-x-2.5">
                    <div 
                      className={`w-9 h-9 rounded-md flex flex-col items-center justify-center font-mono font-bold text-xs border ${
                        alert.priority_score >= 90
                          ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                          : alert.priority_score >= 70
                          ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                          : 'bg-blue-950 text-blue-300 border-blue-500/50'
                      }`}
                      title={`MediTrace Threat Priority Score: ${alert.priority_score}/100`}
                    >
                      <span className="text-[10px] leading-none text-slate-400">PRI</span>
                      <span className="leading-tight">{alert.priority_score}</span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${getSeverityStyle(alert.severity)}`}>
                          {alert.severity}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${getStatusBadge(alert.status)}`}>
                          {alert.status}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {alert.id}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 leading-snug">
                        {alert.title}
                      </h3>
                    </div>
                  </div>

                  <ChevronRight className={`w-4 h-4 text-slate-500 mt-1 flex-shrink-0 ${isSelected ? 'text-cyan-400' : ''}`} aria-hidden="true" />
                </div>

                {/* Metadata Row */}
                <div className="mt-2 text-[11px] text-slate-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <span>
                    <strong className="text-slate-300">Device:</strong> {alert.affected_device} ({alert.device_type})
                  </span>
                  <span>
                    <strong className="text-slate-300">Dept:</strong> {alert.department}
                  </span>
                  {alert.source_ip && (
                    <span className="font-mono text-cyan-300/80">
                      Src: {alert.source_ip}
                    </span>
                  )}
                </div>

                {/* Quick Action Triage Bar */}
                <div className="mt-2.5 pt-2 border-t border-soc-border/60 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">
                    Incident: <span className="text-slate-300 font-semibold">{alert.incident_id}</span>
                  </span>

                  <div className="flex items-center space-x-1.5" onClick={(e) => e.stopPropagation()}>
                    {alert.status === 'NEW' && (
                      <button
                        type="button"
                        onClick={() => onUpdateAlertStatus(alert.id, 'INVESTIGATING')}
                        className="px-2 py-0.5 text-[10px] font-medium bg-amber-900/60 hover:bg-amber-800 text-amber-200 rounded border border-amber-600/40 transition-colors"
                      >
                        Start Investigation
                      </button>
                    )}
                    {alert.status === 'INVESTIGATING' && (
                      <button
                        type="button"
                        onClick={() => onUpdateAlertStatus(alert.id, 'CONTAINED')}
                        className="px-2 py-0.5 text-[10px] font-medium bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded border border-purple-600/40 transition-colors"
                      >
                        Contain Device
                      </button>
                    )}
                    {alert.status !== 'RESOLVED' && (
                      <button
                        type="button"
                        onClick={() => onUpdateAlertStatus(alert.id, 'RESOLVED')}
                        className="px-2 py-0.5 text-[10px] font-medium bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 rounded border border-emerald-600/40 transition-colors"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
};
