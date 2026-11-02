"""
Main FastAPI Application Entrypoint.
Configured for high performance, modular architecture, and low-memory execution
optimized for Render Free Web Service (512MB RAM) and Vercel Frontend integration.
"""
import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.core.exceptions import ConstructionPlatformException

# API Routers
from app.api.routes.health import router as health_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.safety import router as safety_router
from app.api.routes.crack_analysis import router as crack_router
from app.api.routes.valuation import router as valuation_router
from app.api.routes.planning import router as planning_router
from app.api.routes.assistant import router as assistant_router
from app.api.routes.weather import router as weather_router
from app.api.routes.knowledge import router as knowledge_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("construction_platform")

app = FastAPI(
    title="Multimodal Construction Intelligence Platform API",
    description=(
        "Full-Stack Decision Support API for Construction Planning, "
        "Safety Auditing, Structural Crack Forensics, Valuation, and Site Intelligence."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# -------------------------------------------------------------
# CORS Middleware
# -------------------------------------------------------------
cors_origins = settings.cors_origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins if cors_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Centralized Error Handling
# -------------------------------------------------------------
@app.exception_handler(ConstructionPlatformException)
async def custom_platform_exception_handler(request: Request, exc: ConstructionPlatformException):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.detail if isinstance(exc.detail, dict) else {"message": str(exc.detail), "code": "ERROR"}
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled system exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "message": "An unexpected error occurred while processing the construction intelligence request.",
            "code": "INTERNAL_SERVER_ERROR"
        }
    )


# -------------------------------------------------------------
# Register Route Modules
# -------------------------------------------------------------
app.include_router(health_router)
app.include_router(dashboard_router)
app.include_router(safety_router)
app.include_router(crack_router)
app.include_router(valuation_router)
app.include_router(planning_router)
app.include_router(assistant_router)
app.include_router(weather_router)
app.include_router(knowledge_router)


@app.get("/", tags=["Root"])
async def root_welcome():
    return {
        "platform": "Multimodal Construction Intelligence Platform",
        "status": "operational",
        "documentation": "/docs",
        "health": "/health",
        "modules": [
            "Dashboard Overview",
            "Site Safety Monitoring (Multimodal)",
            "Crack Detection & Structural Image Analysis",
            "Real Estate Valuation",
            "Construction Project Planning",
            "Daily Site Assistant",
            "Weather-Aware Construction Advisory",
            "Construction Knowledge Assistant"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development"
    )
