"""
Schemas for Construction Knowledge Assistant module.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class KnowledgeRequest(BaseModel):
    question: str = Field(..., min_length=2)
    category: Optional[str] = Field("General", description="Materials, Structural, Safety, QA/QC, Equipment, Codes")
    jurisdiction_or_code: Optional[str] = Field("International / General", description="E.g., ACI/OSHA, IS Codes, Eurocodes")


class ChecklistItem(BaseModel):
    step: str
    purpose: str
    acceptance_criterion: str


class KnowledgeResponse(BaseModel):
    query: str
    answer: str
    category: str
    standards_and_citations: List[str] = []
    field_guidelines: List[str] = []
    qa_inspection_checklist: List[ChecklistItem] = []
    jurisdictional_disclaimer: str
    timestamp: str
    is_simulated: bool = False
