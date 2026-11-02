"""
Schemas for Construction Site Safety Monitoring module.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class HazardItem(BaseModel):
    id: str = Field(..., description="Unique hazard identifier")
    category: str = Field(..., description="E.g., PPE Violation, Fall Hazard, Scaffolding, Electrical")
    severity: str = Field(..., description="Low, Medium, High, or Critical")
    title: str = Field(..., description="Concise finding headline")
    description: str = Field(..., description="Detailed description of visible hazard")
    location_in_image: str = Field(..., description="Quadrant or relative position in photo")
    corrective_action: str = Field(..., description="Immediate remedial step required")
    preventive_measure: str = Field(..., description="Process or engineering control to avoid recurrence")
    regulatory_reference: str = Field("OSHA 1926 General Industry Standard", description="Applicable safety standard")


class SafetyAnalysisResponse(BaseModel):
    is_construction_site: bool = True
    overall_safety_score: int = Field(..., ge=0, le=100, description="0-100 score where 100 is fully compliant")
    overall_assessment: str
    risk_level: str = Field(..., description="Low, Medium, High, or Critical")
    detected_hazards: List[HazardItem] = []
    positive_observations: List[str] = []
    confidence_score: float = Field(0.9, ge=0.0, le=1.0)
    inspection_disclaimer: str
    site_name: Optional[str] = "Unnamed Construction Site"
    timestamp: str
    is_simulated: bool = False
    warning: Optional[str] = None
