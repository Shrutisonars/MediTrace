import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.metrics import router as metrics_router
from routes.alerts import router as alerts_router
from routes.incidents import router as incidents_router
from routes.evidence import router as evidence_router

app = FastAPI(
    title="MediTrace AI Healthcare Cybersecurity API",
    description="Real-time clinical threat detection, IoMT telemetry, evidence timeline, and SOC incident investigation contract.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Vite frontend (typically localhost:5173 or any dev origin)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routers under /api/v1
app.include_router(metrics_router, prefix="/api/v1")
app.include_router(alerts_router, prefix="/api/v1")
app.include_router(incidents_router, prefix="/api/v1")
app.include_router(evidence_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "service": "MediTrace AI SOC Platform",
        "status": "OPERATIONAL",
        "version": "1.0.0",
        "docs": "/docs",
        "api_prefix": "/api/v1"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "hipaa_compliance_engine": "ACTIVE",
        "iomt_stream_ingest": "CONNECTED"
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
