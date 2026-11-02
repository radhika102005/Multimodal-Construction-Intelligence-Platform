"""
Schemas for Weather-Aware Construction Advisory module.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class ConstructionAdvisoryItem(BaseModel):
    activity: str
    status: str  # "Safe / Favorable", "Caution Required", "Prohibited / Unsafe"
    severity_level: str  # "safe", "warning", "danger"
    recommendation: str
    threshold_info: str


class CurrentWeather(BaseModel):
    temperature: float
    apparent_temperature: float
    relative_humidity: int
    precipitation: float
    rain: float
    wind_speed: float
    wind_gusts: float
    weather_code: int
    weather_description: str
    is_day: int


class DailyWeatherForecast(BaseModel):
    date: str
    temperature_max: float
    temperature_min: float
    precipitation_probability: int
    wind_speed_max: float
    weather_description: str


class WeatherResponse(BaseModel):
    location_name: str
    latitude: float
    longitude: float
    current: CurrentWeather
    forecast_days: List[DailyWeatherForecast] = []
    overall_site_status: str  # "Green (Full Operations)", "Yellow (Precautionary Operations)", "Red (Stop Work Hazard)"
    primary_weather_risk: str
    construction_advisories: List[ConstructionAdvisoryItem]
    timestamp: str
