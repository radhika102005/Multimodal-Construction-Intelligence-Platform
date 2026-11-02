"""
Weather-Aware Construction Advisory Route.
"""
from typing import Optional
from fastapi import APIRouter, Query
from app.schemas.weather import WeatherResponse
from app.services.weather_service import weather_service
from app.services.dashboard_service import dashboard_service

router = APIRouter(prefix="/api/v1/weather", tags=["Weather Advisory"])


@router.get("", response_model=WeatherResponse)
async def get_construction_weather(
    city: Optional[str] = Query("Chicago", description="City name (e.g. Chicago, London, Mumbai, Dubai, Tokyo)"),
    lat: Optional[float] = Query(None, description="Optional latitude override"),
    lon: Optional[float] = Query(None, description="Optional longitude override")
):
    """
    Fetches live weather via Open-Meteo (no API key required) and evaluates
    civil site protocols for concrete pouring, crane operations, painting, and heat stress.
    """
    result = await weather_service.get_construction_weather(city=city, lat=lat, lon=lon)

    dashboard_service.record_activity(
        module="weather",
        title=f"Weather Checked: {result.location_name} ({result.overall_site_status})",
        site_name=result.location_name,
        severity="Medium" if "Yellow" in result.overall_site_status else ("High" if "Red" in result.overall_site_status else "Low")
    )

    return result
