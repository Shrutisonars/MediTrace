from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from models import Alert, AlertSeverity, AlertStatus, AlertCategory
from data import ALERTS_DB, INCIDENTS_DB

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("", response_model=List[Alert])
def get_alerts(
    severity: Optional[AlertSeverity] = None,
    status: Optional[AlertStatus] = None,
    category: Optional[AlertCategory] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: Optional[str] = Query("priority_score", description="Field to sort by: priority_score, created_at, severity"),
    order: Optional[str] = Query("desc", description="asc or desc")
):
    results = list(ALERTS_DB.values())

    if severity:
        results = [a for a in results if a.severity == severity]
    if status:
        results = [a for a in results if a.status == status]
    if category:
        results = [a for a in results if a.category == category]
    if department:
        results = [a for a in results if department.lower() in a.department.lower()]
    if search:
        s = search.lower()
        results = [
            a for a in results
            if s in a.title.lower()
            or s in a.description.lower()
            or s in a.affected_device.lower()
            or (a.source_ip and s in a.source_ip.lower())
            or (a.destination_ip and s in a.destination_ip.lower())
            or s in a.id.lower()
            or s in a.incident_id.lower()
        ]

    # Sorting
    reverse = (order.lower() == "desc")
    if sort_by == "priority_score":
        results.sort(key=lambda x: x.priority_score, reverse=reverse)
    elif sort_by == "created_at":
        results.sort(key=lambda x: x.created_at, reverse=reverse)
    elif sort_by == "severity":
        severity_order = {
            AlertSeverity.CRITICAL: 4,
            AlertSeverity.HIGH: 3,
            AlertSeverity.MEDIUM: 2,
            AlertSeverity.LOW: 1
        }
        results.sort(key=lambda x: severity_order.get(x.severity, 0), reverse=reverse)

    return results

@router.get("/{alert_id}", response_model=Alert)
def get_alert_by_id(alert_id: str):
    alert = ALERTS_DB.get(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    return alert

@router.patch("/{alert_id}/status", response_model=Alert)
def update_alert_status(alert_id: str, new_status: AlertStatus):
    alert = ALERTS_DB.get(alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert {alert_id} not found")
    alert.status = new_status
    return alert
