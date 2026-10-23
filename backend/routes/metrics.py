from fastapi import APIRouter
from models import MetricOverview, AlertSeverity, AlertStatus
from data import ALERTS_DB, INCIDENTS_DB

router = APIRouter(prefix="/metrics", tags=["Metrics"])

@router.get("", response_model=MetricOverview)
def get_metrics_overview():
    active_threats = sum(1 for inc in INCIDENTS_DB.values() if inc.status in [AlertStatus.NEW, AlertStatus.INVESTIGATING])
    critical_alerts = sum(1 for a in ALERTS_DB.values() if a.severity == AlertSeverity.CRITICAL and a.status != AlertStatus.RESOLVED)
    
    # Unique affected devices across active incidents
    affected_device_set = set()
    for inc in INCIDENTS_DB.values():
        if inc.status != AlertStatus.RESOLVED:
            for asset in inc.affected_assets:
                affected_device_set.add(asset)
                
    total_incidents = len(INCIDENTS_DB)
    contained_or_resolved = sum(1 for inc in INCIDENTS_DB.values() if inc.status in [AlertStatus.CONTAINED, AlertStatus.RESOLVED])
    containment_rate = round((contained_or_resolved / total_incidents * 100), 1) if total_incidents > 0 else 100.0

    return MetricOverview(
        active_threats=active_threats,
        critical_alerts=critical_alerts,
        affected_devices=len(affected_device_set),
        hipaa_risk_score=94.2,  # 0 to 100, where 90+ is high security audit readiness
        mttr_minutes=14,        # Mean Time To Respond in minutes
        containment_rate=containment_rate,
        total_alerts_today=len(ALERTS_DB),
        system_status="DEFCON 2 - HEIGHTENED HEALTHCARE SOC SURVEILLANCE"
    )
