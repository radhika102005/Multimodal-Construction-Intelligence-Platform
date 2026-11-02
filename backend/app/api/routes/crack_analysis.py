"""
Crack Detection & Structural Image Analysis Route.
"""
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form
from app.schemas.crack import CrackAnalysisResponse
from app.services.crack_service import crack_service
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/api/v1/cracks", tags=["Structural Crack Analysis"])


@router.post("/analyze", response_model=CrackAnalysisResponse)
async def analyze_structural_cracks(
    file: UploadFile = File(..., description="Image of wall, beam, column, slab, or foundation"),
    element_type: str = Form("Wall", description="Wall, Column, Beam, Slab, Foundation, Joint"),
    age_years: Optional[int] = Form(None, description="Estimated building age in years"),
    notes: Optional[str] = Form(None, description="Visual observations or environmental context")
):
    """
    Performs forensic visual inspection of structural cracks, detecting crack direction,
    approximate width category, spalling, moisture ingress, and integrity risk.
    """
    result = await crack_service.analyze_structural_image(
        file=file,
        element_type=element_type,
        age_years=age_years,
        notes=notes
    )

    dashboard_service.record_activity(
        module="crack",
        title=f"Crack Analysis: {element_type} ({result.structural_integrity_risk} Risk)",
        site_name=f"Inspected {element_type}",
        severity=result.structural_integrity_risk
    )

    return result
