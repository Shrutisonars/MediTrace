import React from 'react';
import { MetricOverview } from '../api/types';
import { AlertOctagon, ShieldAlert, Cpu, HeartPulse, Clock, CheckCircle } from 'lucide-react';

interface MetricsOverviewProps {
  metrics: MetricOverview | null;
  loading: boolean;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics, loading }) => {
  if (loading || !metrics) {
    return (
      <section aria-label="Healthcare SOC Overview Metrics" className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-soc-surface animate-pulse rounded-lg border border-soc-border" />
        ))}
      </section>
    );
  }

  const cards = [
    {
      title: 'Active Threats',
      value: metrics.active_threats,
      subtitle: 'Requiring immediate action',
      icon: AlertOctagon,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/30',
      borderColor: 'border-rose-500/40',
      badge: 'URGENT',
      badgeColor: 'bg-rose-900/60 text-rose-300'
    },
    {
      title: 'Critical Alerts',
      value: metrics.critical_alerts,
      subtitle: 'High priority queue',
      icon: ShieldAlert,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/30',
      borderColor: 'border-amber-500/40',
      badge: 'SEV-1',
      badgeColor: 'bg-amber-900/60 text-amber-300'
    },
    {
      title: 'Affected Medical Devices',
      value: metrics.affected_devices,
      subtitle: 'IoMT, EHR & PACS nodes',
      icon: Cpu,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-950/30',
      borderColor: 'border-cyan-500/40',
      badge: 'CLINICAL',
      badgeColor: 'bg-cyan-900/60 text-cyan-300'
    },
    {
      title: 'HIPAA Security Score',
      value: `${metrics.hipaa_risk_score}%`,
      subtitle: 'Audit readiness index',
      icon: HeartPulse,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/30',
      borderColor: 'border-emerald-500/40',
      badge: 'COMPLIANT',
      badgeColor: 'bg-emerald-900/60 text-emerald-300'
    },
    {
      title: 'Mean Response Time',
      value: `${metrics.mttr_minutes}m`,
      subtitle: 'Target: < 20 mins',
      icon: Clock,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/30',
      borderColor: 'border-sky-500/40',
      badge: 'MTTR',
      badgeColor: 'bg-sky-900/60 text-sky-300'
    },
    {
      title: 'Containment Rate',
      value: `${metrics.containment_rate}%`,
      subtitle: 'Active containment SLA',
      icon: CheckCircle,
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/30',
      borderColor: 'border-purple-500/40',
      badge: 'HEALTHCARE SOC',
      badgeColor: 'bg-purple-900/60 text-purple-300'
    },
  ];

  return (
    <section aria-label="Healthcare SOC Overview Metrics" className="mb-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              tabIndex={0}
              className={`p-3.5 rounded-lg border ${card.borderColor} ${card.bgColor} bg-soc-card flex flex-col justify-between transition-all hover:translate-y-[-2px] focus-visible:ring-2`}
              aria-label={`${card.title}: ${card.value}, ${card.subtitle}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${card.badgeColor}`}>
                  {card.badge}
                </span>
                <Icon className={`w-4 h-4 ${card.color}`} aria-hidden="true" />
              </div>
              <div>
                <div className={`text-2xl font-bold font-mono tracking-tight ${card.color}`}>
                  {card.value}
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">
                  {card.title}
                </div>
                <div className="text-[11px] text-slate-400 truncate mt-0.5">
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
