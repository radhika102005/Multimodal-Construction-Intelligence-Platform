"""
Construction Site Safety Monitoring Route.
"""
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form
from app.schemas.safety import SafetyAnalysisResponse
from app.services.safety_service import safety_service
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/api/v1/safety", tags=["Safety Monitoring"])


@router.post("/analyze", response_model=SafetyAnalysisResponse)
async def analyze_site_safety(
    file: UploadFile = File(..., description="Construction site photograph (JPEG, PNG, WebP)"),
    site_name: Optional[str] = Form("Active Construction Zone"),
    inspection_type: Optional[str] = Form("Occupational Safety Inspection")
):
    """
    Analyzes an uploaded construction site image for PPE compliance,
    fall hazards, scaffolding safety, guardrails, electrical risks, and housekeeping.
    """
    result = await safety_service.analyze_safety_image(
        file=file,
        site_name=site_name,
        inspection_type=inspection_type
    )

    # Record in live dashboard
    dashboard_service.record_activity(
        module="safety",
        title=f"Safety Audit: {result.risk_level} Risk Detected",
        site_name=site_name or "Site Zone",
        severity=result.risk_level
    )

    return result
