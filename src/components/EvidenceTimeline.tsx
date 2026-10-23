import React, { useState } from 'react';
import { TimelineEvent, EvidenceType } from '../api/types';
import { 
  FileCode, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Terminal, 
  Hash, 
  Radio, 
  Layers
} from 'lucide-react';

interface EvidenceTimelineProps {
  events: TimelineEvent[];
  loading: boolean;
  selectedEvidenceType: EvidenceType | undefined;
  onFilterEvidenceType: (type: EvidenceType | undefined) => void;
  incidentId: string;
}

export const EvidenceTimeline: React.FC<EvidenceTimelineProps> = ({
  events,
  loading,
  selectedEvidenceType,
  onFilterEvidenceType,
  incidentId,
}) => {
  const [expandedPayloads, setExpandedPayloads] = useState<Record<string, boolean>>({});

  const togglePayload = (id: string) => {
    setExpandedPayloads(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getEvidenceTypeColor = (type: EvidenceType) => {
    switch (type) {
      case 'PCAP':
        return 'bg-blue-950 text-blue-300 border-blue-500/50';
      case 'HL7':
        return 'bg-emerald-950 text-emerald-300 border-emerald-500/50';
      case 'DICOM':
        return 'bg-purple-950 text-purple-300 border-purple-500/50';
      case 'MEMORY':
        return 'bg-amber-950 text-amber-300 border-amber-500/50';
      case 'FIREWALL':
        return 'bg-rose-950 text-rose-300 border-rose-500/50';
      case 'AUDIT':
        return 'bg-cyan-950 text-cyan-300 border-cyan-500/50';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const evidenceFilters: (EvidenceType | undefined)[] = [
    undefined,
    'PCAP',
    'HL7',
    'DICOM',
    'FIREWALL',
    'AUDIT',
    'MEMORY'
  ];

  return (
    <div className="bg-soc-card rounded-lg border border-soc-border shadow-md overflow-hidden">
      {/* Timeline Header & Filter Bar */}
      <div className="p-4 border-b border-soc-border bg-soc-surface">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-2">
            <Radio className="w-5 h-5 text-cyan-400" aria-hidden="true" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Chronological Evidence-Linked Timeline
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {incidentId}
            </span>
          </div>

          {/* Evidence Type Pills */}
          <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Filter timeline events by evidence type">
            {evidenceFilters.map((type, idx) => {
              const isSelected = selectedEvidenceType === type;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onFilterEvidenceType(type)}
                  aria-pressed={isSelected}
                  className={`text-[11px] font-mono px-2.5 py-1 rounded transition-colors ${
                    isSelected
                      ? 'bg-cyan-600 text-white font-bold shadow-sm'
                      : 'bg-soc-dark text-slate-400 hover:text-slate-200 border border-soc-border'
                  }`}
                >
                  {type || 'ALL EVIDENCE'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Events Timeline Container */}
      <div className="p-5">
        {loading ? (
          <div className="p-8 text-center text-slate-400">
            <Layers className="w-6 h-6 animate-spin mx-auto text-cyan-400 mb-2" aria-hidden="true" />
            <p className="text-xs">Reconstructing chronological evidence chain...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <FileCode className="w-8 h-8 mx-auto text-slate-600 mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-slate-300">No Evidence Events Found</p>
            <p className="text-xs text-slate-500 mt-1">
              Upload a forensic artifact (PCAP, EVTX, HL7 log) to attach evidence to this timeline.
            </p>
          </div>
        ) : (
          <div className="relative border-l-2 border-soc-border ml-3 sm:ml-4 pl-4 sm:pl-6 space-y-6">
            {events.map((event, index) => {
              const isExpanded = expandedPayloads[event.id] || false;
              return (
                <div 
                  key={event.id}
                  className="relative group"
                  tabIndex={0}
                  aria-label={`Event ${index + 1}: ${event.title} at ${new Date(event.timestamp).toLocaleTimeString()}`}
                >
                  {/* Timeline Node Point */}
                  <div className="absolute -left-[23px] sm:-left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-soc-dark border-2 border-cyan-400 group-hover:scale-125 transition-transform" />

                  {/* Card Content */}
                  <div className="bg-soc-surface p-4 rounded-lg border border-soc-border hover:border-soc-border/80 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getEvidenceTypeColor(event.evidence_type)}`}>
                          {event.evidence_type}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100">
                          {event.title}
                        </h4>
                      </div>

                      <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
                        <span>{new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        <span className="text-cyan-400">({Math.round(event.confidence_score * 100)}% Confidence)</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      {event.description}
                    </p>

                    {/* Sensor Source & Chain of Custody */}
                    <div className="mt-2.5 pt-2 border-t border-soc-border/60 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
                      <div className="text-slate-400">
                        <span className="text-slate-500">Sensor:</span> <span className="text-slate-200">{event.source}</span>
                      </div>
                      {event.chain_of_custody && (
                        <div className="flex items-center space-x-1 text-emerald-400">
                          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{event.chain_of_custody}</span>
                        </div>
                      )}
                    </div>

                    {/* Cryptographic SHA-256 Hash Verification */}
                    {event.evidence_hash && (
                      <div className="mt-2 bg-soc-dark/80 px-2.5 py-1.5 rounded border border-soc-border/50 text-[11px] font-mono flex items-center justify-between text-slate-400">
                        <div className="flex items-center space-x-1.5 truncate">
                          <Hash className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" aria-hidden="true" />
                          <span className="truncate">{event.evidence_hash}</span>
                        </div>
                        <span className="text-[10px] text-cyan-300 font-semibold uppercase px-1 bg-cyan-950 border border-cyan-800 rounded ml-2 flex-shrink-0">
                          SEALED
                        </span>
                      </div>
                    )}

                    {/* Raw Payload Collapsible Trigger */}
                    {event.raw_payload && (
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => togglePayload(event.id)}
                          aria-expanded={isExpanded}
                          className="inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>{isExpanded ? 'Hide Raw Forensic Telemetry' : 'Inspect Raw Forensic Telemetry'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        {isExpanded && (
                          <pre 
                            tabIndex={0}
                            className="mt-2 p-3 bg-black/80 rounded border border-cyan-950 text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre-wrap max-h-48"
                            aria-label={`Raw payload for ${event.title}`}
                          >
                            {event.raw_payload}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
