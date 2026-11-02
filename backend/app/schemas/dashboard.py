"""
Schemas for the Dashboard Overview module.
"""
from typing import List, Optional
from pydantic import BaseModel


class MetricItem(BaseModel):
    title: str
    value: int
    change_pct: float
    trend: str  # "up", "down", "neutral"
    period: str


class ActivityItem(BaseModel):
    id: str
    timestamp: str
    module: str  # "safety", "crack", "valuation", "planning", "weather"
    title: str
    site_name: str
    status: str
    severity: Optional[str] = None


class ProjectStatusDistribution(BaseModel):
    planning: int
    foundation: int
    superstructure: int
    mep_finishes: int
    commissioning: int


class SafetyRiskBreakdown(BaseModel):
    critical: int
    high: int
    medium: int
    low: int
    safe_audits: int


class RecommendationItem(BaseModel):
    id: str
    category: str
    title: str
    action: str
    urgency: str  # "Immediate", "Priority", "Routine"
    timestamp: str


class DashboardSummaryResponse(BaseModel):
    total_projects: int
    active_projects: int
    safety_analyses_performed: int
    structural_crack_analyses: int
    property_valuations: int
    weather_advisories_checked: int
    metrics: List[MetricItem]
    project_status_overview: ProjectStatusDistribution
    safety_summary: SafetyRiskBreakdown
    recent_activities: List[ActivityItem]
    recent_recommendations: List[RecommendationItem]
    ai_status: dict
