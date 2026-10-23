import React, { useState } from 'react';
import { Incident, PatientSafetyRisk } from '../api/types';
import { 
  AlertOctagon, 
  Cpu, 
  Copy, 
  Check, 
  UserCheck, 
  FileText, 
  HeartCrack,
  Clock,
  Shield
} from 'lucide-react';

interface IncidentDetailsProps {
  incident: Incident | null;
  loading: boolean;
}

export const IncidentDetails: React.FC<IncidentDetailsProps> = ({ incident, loading }) => {
  const [copiedIoc, setCopiedIoc] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="bg-soc-card rounded-lg border border-soc-border p-6 h-64 animate-pulse">
        <div className="h-6 bg-soc-surface rounded w-1/3 mb-4" />
        <div className="h-4 bg-soc-surface rounded w-2/3 mb-2" />
        <div className="h-4 bg-soc-surface rounded w-1/2" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="bg-soc-card rounded-lg border border-soc-border p-8 text-center text-slate-400">
        <Shield className="w-10 h-10 mx-auto text-slate-600 mb-2" aria-hidden="true" />
        <p className="text-sm font-semibold text-slate-300">No Incident Selected</p>
        <p className="text-xs text-slate-500 mt-1">Select an alert or incident to view full clinical telemetry & IoC dossier.</p>
      </div>
    );
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIoc(text);
    setTimeout(() => setCopiedIoc(null), 2000);
  };

  const getSafetyRiskBadge = (risk: PatientSafetyRisk) => {
    switch (risk) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-950/80 text-rose-300 border-rose-500',
          label: 'CRITICAL PATIENT SAFETY RISK - ACTIVE CLINICAL INTERVENTION REQUIRED'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-950/80 text-amber-300 border-amber-500',
          label: 'MODERATE CLINICAL RISK - MONITOR VITALS & EHR STREAM'
        };
      case 'LOW':
        return {
          bg: 'bg-emerald-950/80 text-emerald-300 border-emerald-500',
          label: 'LOW PATIENT SAFETY RISK - NO ACTIVE THERAPEUTIC IMPACT'
        };
      default:
        return {
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          label: 'NONE'
        };
    }
  };

  const safetyBadge = getSafetyRiskBadge(incident.patient_safety_risk);

  return (
    <div className="bg-soc-card rounded-lg border border-soc-border shadow-md overflow-hidden">
      {/* Top Banner: Patient Safety & Criticality */}
      <div className={`px-4 py-2 border-b text-xs font-semibold flex items-center justify-between ${safetyBadge.bg}`}>
        <div className="flex items-center space-x-2">
          <HeartCrack className="w-4 h-4" aria-hidden="true" />
          <span>{safetyBadge.label}</span>
        </div>
        <span className="font-mono text-[11px]">Score: {incident.priority_score}/100</span>
      </div>

      <div className="p-5">
        {/* Title & Incident Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-soc-border">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                {incident.id}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Category: <strong className="text-slate-200">{incident.category}</strong>
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {incident.title}
            </h2>
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
              Created: {new Date(incident.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
              Lead: <span className="text-slate-200 font-medium">{incident.assigned_analyst}</span>
            </span>
          </div>
        </div>

        {/* Incident Narrative / Description */}
        <div className="py-3 text-xs text-slate-300 leading-relaxed border-b border-soc-border">
          <p>{incident.description}</p>
        </div>

        {/* Affected Assets & IoCs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
          {/* Affected Medical Assets */}
          <div className="bg-soc-surface p-3.5 rounded-md border border-soc-border">
            <div className="flex items-center space-x-2 mb-2 text-xs font-semibold text-cyan-300">
              <Cpu className="w-4 h-4" aria-hidden="true" />
              <span>Targeted Clinical Assets & Subnets ({incident.affected_assets.length})</span>
            </div>
            <ul className="space-y-1.5" aria-label="Affected clinical assets">
              {incident.affected_assets.map((asset, i) => (
                <li key={i} className="text-xs font-mono bg-soc-dark px-2.5 py-1.5 rounded border border-soc-border/60 text-slate-200 flex items-center justify-between">
                  <span>{asset}</span>
                  <span className="text-[10px] text-cyan-400 uppercase tracking-wider font-semibold">Active Node</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Indicators of Compromise (IoCs) */}
          <div className="bg-soc-surface p-3.5 rounded-md border border-soc-border">
            <div className="flex items-center space-x-2 mb-2 text-xs font-semibold text-rose-300">
              <AlertOctagon className="w-4 h-4" aria-hidden="true" />
              <span>Extracted Indicators of Compromise ({incident.iocs.length})</span>
            </div>
            <ul className="space-y-1.5" aria-label="Indicators of Compromise">
              {incident.iocs.map((ioc, i) => (
                <li key={i} className="text-xs font-mono bg-soc-dark px-2.5 py-1.5 rounded border border-soc-border/60 text-slate-200 flex items-center justify-between gap-2">
                  <span className="truncate" title={ioc}>{ioc}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(ioc)}
                    className="p-1 text-slate-400 hover:text-cyan-400 rounded hover:bg-soc-border/40 transition-colors flex-shrink-0"
                    aria-label={`Copy IOC: ${ioc}`}
                  >
                    {copiedIoc === ioc ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Audit Log / Analyst Notes */}
        {incident.notes && incident.notes.length > 0 && (
          <div className="mt-4 pt-3 border-t border-soc-border">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300 mb-2">
              <FileText className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>Incident Investigation & Chain-of-Custody Log</span>
            </div>
            <div className="space-y-1 bg-soc-dark p-3 rounded border border-soc-border max-h-36 overflow-y-auto">
              {incident.notes.map((note, idx) => (
                <div key={idx} className="text-[11px] font-mono text-slate-300">
                  {note}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
