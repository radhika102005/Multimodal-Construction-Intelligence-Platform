"""
Common shared schemas and response wrappers.
"""
from typing import Optional, Any
from pydantic import BaseModel, Field


class APIResponse(BaseModel):
    success: bool = True
    message: str = "Operation completed successfully"
    data: Optional[Any] = None
    ai_configured: bool = True
    is_simulated: bool = False
    warning: Optional[str] = None


class HealthStatus(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    environment: str
    ai_provider: str
    ai_configured: bool
    ai_model: str
    memory_usage_mb: Optional[float] = None
    render_free_tier_optimized: bool = True
