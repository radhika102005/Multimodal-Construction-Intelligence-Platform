"""
Construction Project Planning Route.
"""
from fastapi import APIRouter
from app.schemas.planning import PlanningRequest, PlanningResponse
from app.services.planning_service import planning_service
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/api/v1/planning", tags=["Project Planning"])


@router.post("/generate", response_model=PlanningResponse)
async def generate_project_plan(req: PlanningRequest):
    """
    Generates a phase-based Work Breakdown Structure (WBS), Gantt timeline,
    milestones, resource requirements, and budget allocations for a construction project.
    """
    result = await planning_service.generate_project_plan(req)

    dashboard_service.record_activity(
        module="planning",
        title=f"WBS Schedule: {req.project_name} ({result.total_duration_days} days)",
        site_name=req.location,
        severity="Low"
    )

    return result
