"""
Schemas for Construction Project Planning module.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class PlanningRequest(BaseModel):
    project_name: str = Field(..., min_length=2)
    project_type: str = Field("Residential High-rise", description="Residential High-rise, Commercial Complex, Villa, Industrial Warehouse, Infrastructure")
    location: str = Field(..., min_length=2)
    plot_area_sqft: Optional[float] = Field(None, gt=0)
    built_up_area_sqft: float = Field(..., gt=100)
    number_of_floors: int = Field(..., ge=1)
    expected_start_date: str = Field(..., description="YYYY-MM-DD")
    expected_completion_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    estimated_budget: float = Field(..., gt=1000)
    currency: str = Field("USD", description="Currency symbol/code, e.g. USD, INR, EUR, GBP")
    project_description: Optional[str] = None


class PhaseItem(BaseModel):
    phase_id: int
    phase_name: str
    duration_days: int
    start_day: int
    end_day: int
    estimated_cost_share_pct: float
    estimated_cost: float
    suggested_activities: List[str]
    dependencies: List[str]
    milestones: List[str]
    resource_requirements: List[str]
    risk_factors: List[str]
    mitigation_strategy: str


class BudgetAllocationItem(BaseModel):
    category: str
    percentage: float
    amount: float


class PlanningResponse(BaseModel):
    project_name: str
    project_type: str
    location: str
    total_duration_days: int
    estimated_budget: float
    currency: str
    project_summary: str
    phases: List[PhaseItem]
    budget_allocation: List[BudgetAllocationItem]
    critical_path_notes: str
    disclaimer: str
    timestamp: str
    is_simulated: bool = False
    warning: Optional[str] = None
