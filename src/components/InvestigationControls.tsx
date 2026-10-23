import React, { useState } from 'react';
import { Incident, AlertStatus } from '../api/types';
import { 
  ShieldAlert, 
  Send, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface InvestigationControlsProps {
  incident: Incident | null;
  onUpdateStatus: (incidentId: string, status: AlertStatus, notes?: string) => Promise<void>;
  loading: boolean;
}

export const InvestigationControls: React.FC<InvestigationControlsProps> = ({
  incident,
  onUpdateStatus,
  loading,
}) => {
  const [analystNotes, setAnalystNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<AlertStatus>(incident?.status || 'INVESTIGATING');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Sync selected status when incident changes
  React.useEffect(() => {
    if (incident) {
      setSelectedStatus(incident.status);
    }
  }, [incident]);

  if (!incident) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onUpdateStatus(incident.id, selectedStatus, analystNotes.trim() || undefined);
      setAnalystNotes('');
      setStatusMessage(`Incident updated to ${selectedStatus} successfully.`);
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage(`Failed to update status: ${err.message || 'Unknown error'}`);
    }
  };

  const handleQuickContain = async () => {
    try {
      await onUpdateStatus(
        incident.id, 
        'CONTAINED', 
        'CRITICAL ACTION: Medical Device VLAN isolated by SOC Analyst. Outbound telemetry halted.'
      );
      setSelectedStatus('CONTAINED');
      setStatusMessage('Medical VLAN successfully isolated and incident set to CONTAINED.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      setStatusMessage(`Containment action failed: ${err.message}`);
    }
  };

  const statusOptions: { value: AlertStatus; label: string; icon: any; color: string }[] = [
    { value: 'NEW', label: 'New / Unassigned', icon: AlertCircle, color: 'text-cyan-400' },
    { value: 'INVESTIGATING', label: 'Investigating', icon: ShieldAlert, color: 'text-amber-400' },
    { value: 'CONTAINED', label: 'Contained (VLAN Isolated)', icon: Lock, color: 'text-purple-400' },
    { value: 'RESOLVED', label: 'Resolved (Cleaned & Certified)', icon: CheckCircle, color: 'text-emerald-400' },
    { value: 'FALSE_POSITIVE', label: 'False Positive', icon: HelpCircle, color: 'text-slate-400' },
  ];

  return (
    <div className="bg-soc-card rounded-lg border border-soc-border p-5 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 mb-4 border-b border-soc-border">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-5 h-5 text-cyan-400" aria-hidden="true" />
          <h3 className="text-base font-bold text-white tracking-wide">
            SOC Investigation Controls & Remediation
          </h3>
        </div>
        
        {/* Quick Containment Trigger */}
        {incident.status !== 'CONTAINED' && incident.status !== 'RESOLVED' && (
          <button
            type="button"
            onClick={handleQuickContain}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-md shadow transition-colors focus-visible:ring-2 focus-visible:ring-rose-400"
            aria-label="Isolate affected medical subnet immediately"
          >
            <Lock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Isolate Medical Subnet</span>
          </button>
        )}
      </div>

      {statusMessage && (
        <div 
          className="mb-4 p-2.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-medium flex items-center space-x-2"
          role="status"
          aria-live="polite"
        >
          <CheckCircle className="w-4 h-4 text-cyan-400" aria-hidden="true" />
          <span>{statusMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Selection Buttons */}
        <div>
          <label className="block text-xs font-semibold text-slate-200 mb-2">
            Investigation Lifecycle Phase
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" role="radiogroup" aria-label="Investigation status options">
            {statusOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = selectedStatus === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setSelectedStatus(opt.value)}
                  className={`p-2.5 rounded-md border text-left flex flex-col justify-between transition-all ${
                    isSelected
                      ? 'bg-soc-surface border-cyan-400 ring-1 ring-cyan-400'
                      : 'bg-soc-dark border-soc-border hover:bg-soc-surface/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 mb-2 ${opt.color}`} aria-hidden="true" />
                  <span className={`text-[11px] font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Analyst Notes / Clinical Justification */}
        <div>
          <label htmlFor="analyst-notes" className="block text-xs font-semibold text-slate-200 mb-1.5">
            Analyst Action Log & Clinical Remediation Note
          </label>
          <textarea
            id="analyst-notes"
            rows={3}
            value={analystNotes}
            onChange={(e) => setAnalystNotes(e.target.value)}
            placeholder="Record forensic observations, containment actions taken, or clinical engineer coordination..."
            className="w-full bg-soc-dark border border-soc-border rounded-md p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
          />
        </div>

        {/* Action Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-md shadow transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{loading ? 'Recording Action...' : 'Commit Status Update'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
