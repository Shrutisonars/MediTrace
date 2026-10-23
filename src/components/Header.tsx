import React from 'react';
import { Shield, Activity, Upload, CheckCircle2, AlertCircle, Lock } from 'lucide-react';

interface HeaderProps {
  onOpenUpload: () => void;
  backendConnected: boolean;
  activeThreatCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenUpload,
  backendConnected,
  activeThreatCount,
}) => {
  return (
    <header className="bg-soc-dark border-b border-soc-border px-4 py-3 sm:px-6 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand & SOC Status */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400">
            <Shield className="w-7 h-7" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                MediTrace <span className="text-cyan-400 font-mono text-sm px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-800">AI SOC</span>
              </h1>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">v1.0.0-PROD</span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Clinical IoMT Threat Detection & Healthcare Incident Response
            </p>
          </div>
        </div>

        {/* Live Status Indicators & Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Backend Connection Status Badge */}
          <div 
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md border text-xs font-mono font-medium ${
              backendConnected 
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400' 
                : 'bg-rose-950/50 border-rose-500/60 text-rose-300'
            }`}
            role="status"
            aria-live="polite"
          >
            {backendConnected ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <span>FastAPI: CONNECTED (Port 8000)</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-rose-400" aria-hidden="true" />
                <span>FastAPI: RECONNECTING...</span>
              </>
            )}
          </div>

          {/* HIPAA & Patient Safety Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-soc-surface border border-soc-border text-xs text-slate-300">
            <Lock className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
            <span>HIPAA § 164.312 Verified</span>
          </div>

          {/* Threat Indicator */}
          {activeThreatCount > 0 && (
            <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md bg-rose-950/60 border border-rose-500/60 text-rose-300 text-xs font-semibold animate-pulse">
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{activeThreatCount} Critical Incidents Active</span>
            </div>
          )}

          {/* Forensic Evidence Upload Button */}
          <button
            type="button"
            onClick={onOpenUpload}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-md transition-colors focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label="Upload forensic evidence file"
          >
            <Upload className="w-4 h-4" aria-hidden="true" />
            <span>Upload Evidence</span>
          </button>
        </div>
      </div>
    </header>
  );
};
