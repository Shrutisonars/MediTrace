from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime, timezone
from models import (
    Incident, TimelineEvent, StatusUpdateRequest,
    AlertSeverity, AlertStatus, AlertCategory, EvidenceType
)
from data import INCIDENTS_DB, TIMELINE_DB, ALERTS_DB

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("", response_model=List[Incident])
def get_incidents(
    severity: Optional[AlertSeverity] = None,
    status: Optional[AlertStatus] = None,
    category: Optional[AlertCategory] = None,
    search: Optional[str] = None
):
    results = list(INCIDENTS_DB.values())

    if severity:
        results = [i for i in results if i.severity == severity]
    if status:
        results = [i for i in results if i.status == status]
    if category:
        results = [i for i in results if i.category == category]
    if search:
        s = search.lower()
        results = [
            i for i in results
            if s in i.title.lower()
            or s in i.description.lower()
            or s in i.id.lower()
            or any(s in asset.lower() for asset in i.affected_assets)
            or any(s in ioc.lower() for ioc in i.iocs)
        ]

    # Default sort by priority score descending
    results.sort(key=lambda x: x.priority_score, reverse=True)
    return results

@router.get("/{incident_id}", response_model=Incident)
def get_incident_by_id(incident_id: str):
    incident = INCIDENTS_DB.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    return incident

@router.get("/{incident_id}/timeline", response_model=List[TimelineEvent])
def get_incident_timeline(
    incident_id: str,
    evidence_type: Optional[EvidenceType] = None,
    min_confidence: Optional[float] = Query(0.0, ge=0.0, le=1.0)
):
    if incident_id not in INCIDENTS_DB:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    
    events = TIMELINE_DB.get(incident_id, [])
    if evidence_type:
        events = [e for e in events if e.evidence_type == evidence_type]
    if min_confidence > 0.0:
        events = [e for e in events if e.confidence_score >= min_confidence]
        
    # Sort chronologically ascending (earliest first for timeline reconstruction)
    events = sorted(events, key=lambda x: x.timestamp)
    return events

@router.post("/{incident_id}/timeline", response_model=TimelineEvent, status_code=201)
def add_timeline_event(incident_id: str, event: TimelineEvent):
    if incident_id not in INCIDENTS_DB:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")
    
    if incident_id not in TIMELINE_DB:
        TIMELINE_DB[incident_id] = []
    
    event.incident_id = incident_id
    TIMELINE_DB[incident_id].append(event)
    return event

@router.post("/{incident_id}/status", response_model=Incident)
def update_investigation_status(incident_id: str, update: StatusUpdateRequest):
    incident = INCIDENTS_DB.get(incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail=f"Incident {incident_id} not found")

    incident.status = update.status
    now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    incident.updated_at = now_str

    if update.notes:
        analyst = update.analyst_name or incident.assigned_analyst or "SOC Analyst"
        log_entry = f"[{now_str}] Status -> {update.status.value} by {analyst}: {update.notes}"
        incident.notes.append(log_entry)

    # Sync alerts linked to this incident if status changed to CONTAINED or RESOLVED
    if update.status in [AlertStatus.CONTAINED, AlertStatus.RESOLVED]:
        for aid in incident.alert_ids:
            if aid in ALERTS_DB:
                ALERTS_DB[aid].status = update.status

    return incident
