"""
Schemas for Crack Detection and Structural Image Analysis module.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class DefectItem(BaseModel):
    defect_type: str = Field(..., description="E.g., Shear Crack, Flexural Crack, Shrinkage Crack, Spalling")
    pattern_and_orientation: str = Field(..., description="E.g., Diagonal 45-degree, Horizontal, Spiderweb")
    visual_width_category: str = Field(..., description="Hairline (<1mm), Fine (1-2mm), Medium (2-5mm), Severe (>5mm)")
    location: str = Field(..., description="Estimated zone on structural element")
    severity: str = Field(..., description="Low, Medium, High, or Critical")
    possible_causes: List[str] = Field(default_factory=list, description="Forensic hypotheses")
    recommended_actions: List[str] = Field(default_factory=list, description="Immediate and remedial steps")


class CrackAnalysisResponse(BaseModel):
    element_type: str = Field("Wall", description="Wall, Column, Beam, Slab, Foundation, Joint")
    structural_integrity_risk: str = Field(..., description="Low, Moderate, Significant, or Critical")
    overall_assessment: str
    detected_defects: List[DefectItem] = []
    surface_deterioration_notes: Optional[str] = None
    moisture_corrosion_indicators: Optional[str] = None
    requires_professional_inspection: bool = True
    urgent_evacuation_needed: bool = False
    engineering_disclaimer: str
    timestamp: str
    is_simulated: bool = False
    warning: Optional[str] = None
