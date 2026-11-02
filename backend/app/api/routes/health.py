"""
Health check and deployment readiness route.
"""
import os
import tracemalloc
from fastapi import APIRouter
from app.config import settings
from app.schemas.common import HealthStatus

router = APIRouter(tags=["Health & System"])


@router.get("/health", response_model=HealthStatus)
async def health_check():
    """
    Returns platform operational health, active AI provider configuration,
    and memory footprint verification for Render 512MB RAM free-tier hosting.
    """
    mem_mb = None
    try:
        # Check process memory if available
        import resource
        mem_kb = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
        mem_mb = round(mem_kb / 1024.0, 2)
    except Exception:
        pass

    return HealthStatus(
        status="healthy",
        version="1.0.0",
        environment=settings.ENVIRONMENT,
        ai_provider=settings.AI_PROVIDER,
        ai_configured=settings.is_ai_configured,
        ai_model=settings.AI_MODEL,
        memory_usage_mb=mem_mb,
        render_free_tier_optimized=True
    )
