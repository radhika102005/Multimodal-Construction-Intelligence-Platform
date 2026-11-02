"""
Dashboard Service.
Maintains state for platform activities, operational metrics, project milestones,
safety audit rollups, and proactive AI recommendations.
"""
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    MetricItem,
    ActivityItem,
    ProjectStatusDistribution,
    SafetyRiskBreakdown,
    RecommendationItem
)
from app.config import settings


class DashboardService:
    def __init__(self):
        # Initial benchmark metrics
        self.total_projects = 14
        self.active_projects = 9
        self.safety_analyses_count = 52
        self.crack_analyses_count = 38
        self.property_valuations_count = 27
        self.weather_advisories_count = 64

        self.activities: List[ActivityItem] = [
            ActivityItem(
                id="ACT-101",
                timestamp="10 minutes ago",
                module="safety",
                title="Safety Audit: Elevated Slab Perimeter",
                site_name="Grand Horizon Tower (Sector 4)",
                status="Completed",
                severity="High"
            ),
            ActivityItem(
                id="ACT-102",
                timestamp="42 minutes ago",
                module="crack",
                title="Crack Evaluation: Column C4 Beam Joint",
                site_name="Metro Rail Viaduct Pier 12",
                status="Completed",
                severity="Significant"
            ),
            ActivityItem(
                id="ACT-103",
                timestamp="2 hours ago",
                module="weather",
                title="Advisory Issued: High Wind Gusts (48 km/h)",
                site_name="Harbor Gateway Commercial Complex",
                status="Active Warning",
                severity="Medium"
            ),
            ActivityItem(
                id="ACT-104",
                timestamp="4 hours ago",
                module="planning",
                title="WBS Master Plan Generated",
                site_name="Greenfield Industrial Logistics Park",
                status="Completed",
                severity="Low"
            ),
            ActivityItem(
                id="ACT-105",
                timestamp="Yesterday",
                module="valuation",
                title="Indicative Appraisal: Luxury Penthouse",
                site_name="Skyline Residence #2402",
                status="Completed",
                severity="Low"
            )
        ]

        self.recommendations: List[RecommendationItem] = [
            RecommendationItem(
                id="REC-001",
                category="Fall Protection",
                title="Erect Standard Perimeter Guardrails at Level 8",
                action="Deploy OSHA-compliant 42-inch top rails and toe boards along unshielded slab edge.",
                urgency="Immediate",
                timestamp="Today, 08:30"
            ),
            RecommendationItem(
                id="REC-002",
                category="Structural Monitoring",
                title="Install Tell-Tale Crack Gauges on Column C4",
                action="Verify whether diagonal 3mm shear fissure is dormant or under active settlement.",
                urgency="Priority",
                timestamp="Today, 09:15"
            ),
            RecommendationItem(
                id="REC-003",
                category="Weather Action",
                title="Suspend Tower Crane High Lifts during Wind Peak",
                action="Lock jib in weathervane orientation when wind gusts surpass 45 km/h.",
                urgency="Priority",
                timestamp="Today, 11:00"
            ),
            RecommendationItem(
                id="REC-004",
                category="Quality Control",
                title="Verify Moisture Barrier before Screed Pouring",
                action="Perform concrete slab calcium chloride moisture test before laying epoxy.",
                urgency="Routine",
                timestamp="Yesterday, 16:40"
            )
        ]

    def record_activity(
        self,
        module: str,
        title: str,
        site_name: str,
        severity: str = "Low"
    ):
        act_id = f"ACT-{len(self.activities) + 101}"
        new_activity = ActivityItem(
            id=act_id,
            timestamp="Just now",
            module=module,
            title=title,
            site_name=site_name,
            status="Completed",
            severity=severity
        )
        self.activities.insert(0, new_activity)
        if len(self.activities) > 20:
            self.activities.pop()

        # Update counter
        if module == "safety":
            self.safety_analyses_count += 1
        elif module == "crack":
            self.crack_analyses_count += 1
        elif module == "valuation":
            self.property_valuations_count += 1
        elif module == "planning":
            self.total_projects += 1
            self.active_projects += 1
        elif module == "weather":
            self.weather_advisories_count += 1

    def get_summary(self) -> DashboardSummaryResponse:
        metrics = [
            MetricItem(
                title="Active Construction Sites",
                value=self.active_projects,
                change_pct=12.5,
                trend="up",
                period="vs last month"
            ),
            MetricItem(
                title="AI Safety Audits Run",
                value=self.safety_analyses_count,
                change_pct=28.4,
                trend="up",
                period="this quarter"
            ),
            MetricItem(
                title="Structural Defect Analyses",
                value=self.crack_analyses_count,
                change_pct=18.2,
                trend="up",
                period="this quarter"
            ),
            MetricItem(
                title="Real Estate Valuations",
                value=self.property_valuations_count,
                change_pct=15.0,
                trend="up",
                period="this month"
            )
        ]

        project_distribution = ProjectStatusDistribution(
            planning=3,
            foundation=2,
            superstructure=4,
            mep_finishes=3,
            commissioning=2
        )

        safety_summary = SafetyRiskBreakdown(
            critical=2,
            high=5,
            medium=14,
            low=19,
            safe_audits=self.safety_analyses_count - 40 if self.safety_analyses_count > 40 else 12
        )

        ai_status = {
            "provider": settings.AI_PROVIDER,
            "configured": settings.is_ai_configured,
            "model": settings.AI_MODEL,
            "mode": "Live Multimodal API" if settings.is_ai_configured else "Benchmark Heuristic Mode (Add AI_API_KEY)"
        }

        return DashboardSummaryResponse(
            total_projects=self.total_projects,
            active_projects=self.active_projects,
            safety_analyses_performed=self.safety_analyses_count,
            structural_crack_analyses=self.crack_analyses_count,
            property_valuations=self.property_valuations_count,
            weather_advisories_checked=self.weather_advisories_count,
            metrics=metrics,
            project_status_overview=project_distribution,
            safety_summary=safety_summary,
            recent_activities=self.activities[:8],
            recent_recommendations=self.recommendations,
            ai_status=ai_status
        )


dashboard_service = DashboardService()
