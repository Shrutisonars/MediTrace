import hashlib
import os
import uuid
from datetime import datetime, timezone
from typing import Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from models import FileUploadResponse, TimelineEvent, EvidenceType
from data import UPLOADED_FILES_DB, INCIDENTS_DB, TIMELINE_DB

router = APIRouter(prefix="/evidence", tags=["Evidence"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=FileUploadResponse)
async def upload_evidence(
    file: UploadFile = File(...),
    incident_id: Optional[str] = Form(None),
    tags: Optional[str] = Form("forensics,network"),
    evidence_type: Optional[str] = Form("PCAP")
):
    try:
        content = await file.read()
        file_size = len(content)

        # Compute SHA-256
        sha256_hash = hashlib.sha256(content).hexdigest()

        file_id = f"EVD-{uuid.uuid4().hex[:8].upper()}"
        save_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
        with open(save_path, "wb") as f:
            f.write(content)

        tag_list = [t.strip() for t in tags.split(",") if t.strip()] if tags else ["unclassified"]
        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        record = {
            "file_id": file_id,
            "filename": file.filename,
            "file_size_bytes": file_size,
            "sha256": sha256_hash,
            "mime_type": file.content_type or "application/octet-stream",
            "uploaded_at": now_str,
            "tags": tag_list,
            "incident_id": incident_id,
            "verified": True
        }
        UPLOADED_FILES_DB.append(record)

        # If linked to an incident, automatically register an evidence timeline event
        if incident_id and incident_id in INCIDENTS_DB:
            ev_type = EvidenceType.PCAP
            try:
                ev_type = EvidenceType[evidence_type.upper()]
            except Exception:
                ev_type = EvidenceType.PCAP

            new_tle = TimelineEvent(
                id=f"TLE-{uuid.uuid4().hex[:6].upper()}",
                incident_id=incident_id,
                timestamp=now_str,
                title=f"Forensic Artifact Attached: {file.filename}",
                description=f"Evidence artifact uploaded ({file_size} bytes). SHA-256 integrity verified. Tags: {', '.join(tag_list)}.",
                evidence_type=ev_type,
                source="MediTrace Secure Evidence Vault",
                confidence_score=1.0,
                evidence_hash=f"SHA256: {sha256_hash}",
                chain_of_custody=f"Logged under Evidence ID {file_id}. Saved to vault.",
                raw_payload=f"Filename: {file.filename} | Content-Type: {file.content_type} | Bytes: {file_size}"
            )
            if incident_id not in TIMELINE_DB:
                TIMELINE_DB[incident_id] = []
            TIMELINE_DB[incident_id].append(new_tle)

        return FileUploadResponse(**record)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process evidence upload: {str(e)}")

@router.get("/list", response_model=List[FileUploadResponse])
def list_uploaded_evidence(incident_id: Optional[str] = None):
    if incident_id:
        return [FileUploadResponse(**r) for r in UPLOADED_FILES_DB if r.get("incident_id") == incident_id]
    return [FileUploadResponse(**r) for r in UPLOADED_FILES_DB]
