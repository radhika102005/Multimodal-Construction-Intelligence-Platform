"""
Dashboard Summary Route.
"""
from fastapi import APIRouter
from app.schemas.dashboard import DashboardSummaryResponse
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardSummaryResponse)
async def get_dashboard_summary():
    """
    Returns aggregated metrics, active projects distribution,
    safety hazard breakdowns, recent platform activity, and AI recommendations.
    """
    return dashboard_service.get_summary()
