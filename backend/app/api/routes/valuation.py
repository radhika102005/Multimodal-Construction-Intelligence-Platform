"""
Real Estate Valuation Route.
"""
from fastapi import APIRouter
from app.schemas.valuation import ValuationRequest, ValuationResponse
from app.services.valuation_service import valuation_service
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/api/v1/valuation", tags=["Real Estate Valuation"])


@router.post("/estimate", response_model=ValuationResponse)
async def estimate_property_value(req: ValuationRequest):
    """
    Computes an indicative real estate valuation using hedonic replacement-cost
    and location adjustment factors.
    """
    result = await valuation_service.estimate_valuation(req)

    dashboard_service.record_activity(
        module="valuation",
        title=f"Valuation: ${result.estimated_property_value:,.0f} ({req.property_type})",
        site_name=req.location,
        severity="Low"
    )

    return result
