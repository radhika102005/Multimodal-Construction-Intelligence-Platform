"""
Weather-Aware Construction Advisory Service.
Queries Open-Meteo's free public APIs (no API key required) for live meteorological observations
and translates them into actionable civil engineering protocols (concrete curing, crane operations,
painting, waterproofing, and worker heat index safety).
"""
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
import httpx

from app.schemas.weather import (
    WeatherResponse,
    CurrentWeather,
    DailyWeatherForecast,
    ConstructionAdvisoryItem
)
from app.core.exceptions import WeatherAPIException

# WMO Weather interpretation codes
WMO_DESCRIPTIONS = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail"
}


class WeatherService:
    async def get_construction_weather(
        self,
        city: Optional[str] = "Chicago",
        lat: Optional[float] = None,
        lon: Optional[float] = None
    ) -> WeatherResponse:
        async with httpx.AsyncClient(timeout=15.0) as client:
            # 1. Resolve coordinates if city provided
            resolved_city = city or "Construction Site"
            target_lat = lat
            target_lon = lon

            if target_lat is None or target_lon is None:
                geo_url = f"https://geocoding-api.open-meteo.com/v1/search?name={city}&count=1&language=en&format=json"
                try:
                    geo_resp = await client.get(geo_url)
                    if geo_resp.status_code != 200:
                        raise WeatherAPIException(f"Open-Meteo Geocoding service responded with status {geo_resp.status_code}")
                    geo_data = geo_resp.json()
                    results = geo_data.get("results", [])
                    if not results:
                        raise WeatherAPIException(f"Location '{city}' could not be resolved. Please check spelling.")
                    target_lat = results[0]["latitude"]
                    target_lon = results[0]["longitude"]
                    resolved_city = f"{results[0]['name']}, {results[0].get('country', '')}"
                except httpx.RequestError as e:
                    raise WeatherAPIException(f"Network error contacting geocoding service: {str(e)}")

            # 2. Fetch meteorological forecast from Open-Meteo
            weather_url = (
                f"https://api.open-meteo.com/v1/forecast?"
                f"latitude={target_lat}&longitude={target_lon}"
                f"&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m,is_day"
                f"&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max"
                f"&timezone=auto"
            )

            try:
                weather_resp = await client.get(weather_url)
                if weather_resp.status_code != 200:
                    raise WeatherAPIException(f"Open-Meteo Forecast responded with status {weather_resp.status_code}")
                w_data = weather_resp.json()
            except httpx.RequestError as e:
                raise WeatherAPIException(f"Network error contacting weather API: {str(e)}")

        current_raw = w_data.get("current", {})
        code = current_raw.get("weather_code", 0)
        desc = WMO_DESCRIPTIONS.get(code, "Variable Weather")

        temp = float(current_raw.get("temperature_2m", 20.0))
        apparent_temp = float(current_raw.get("apparent_temperature", temp))
        humidity = int(current_raw.get("relative_humidity_2m", 50))
        precip = float(current_raw.get("precipitation", 0.0))
        rain = float(current_raw.get("rain", 0.0))
        wind_speed = float(current_raw.get("wind_speed_10m", 10.0))
        wind_gusts = float(current_raw.get("wind_gusts_10m", wind_speed * 1.3))
        is_day = int(current_raw.get("is_day", 1))

        current_obj = CurrentWeather(
            temperature=temp,
            apparent_temperature=apparent_temp,
            relative_humidity=humidity,
            precipitation=precip,
            rain=rain,
            wind_speed=wind_speed,
            wind_gusts=wind_gusts,
            weather_code=code,
            weather_description=desc,
            is_day=is_day
        )

        # Parse daily forecasts
        daily_raw = w_data.get("daily", {})
        daily_list: List[DailyWeatherForecast] = []
        dates = daily_raw.get("time", [])
        for i in range(min(5, len(dates))):
            d_code = daily_raw.get("weather_code", [0])[i]
            daily_list.append(
                DailyWeatherForecast(
                    date=dates[i],
                    temperature_max=float(daily_raw.get("temperature_2m_max", [temp])[i]),
                    temperature_min=float(daily_raw.get("temperature_2m_min", [temp])[i]),
                    precipitation_probability=int(daily_raw.get("precipitation_probability_max", [0])[i] or 0),
                    wind_speed_max=float(daily_raw.get("wind_speed_10m_max", [wind_speed])[i]),
                    weather_description=WMO_DESCRIPTIONS.get(d_code, "Clear")
                )
            )

        # 3. Derive Civil Engineering Decision Matrix
        advisories, site_status, primary_risk = self._evaluate_civil_protocols(
            temp=temp,
            apparent_temp=apparent_temp,
            humidity=humidity,
            precip=precip,
            wind_speed=wind_speed,
            wind_gusts=wind_gusts,
            code=code
        )

        return WeatherResponse(
            location_name=resolved_city,
            latitude=target_lat,
            longitude=target_lon,
            current=current_obj,
            forecast_days=daily_list,
            overall_site_status=site_status,
            primary_weather_risk=primary_risk,
            construction_advisories=advisories,
            timestamp=datetime.now(timezone.utc).isoformat()
        )

    def _evaluate_civil_protocols(
        self,
        temp: float,
        apparent_temp: float,
        humidity: int,
        precip: float,
        wind_speed: float,
        wind_gusts: float,
        code: int
    ) -> tuple[List[ConstructionAdvisoryItem], str, str]:
        advisories: List[ConstructionAdvisoryItem] = []
        is_raining = precip > 0.5 or code in [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99]
        is_thunderstorm = code in [95, 96, 99]

        danger_count = 0
        warning_count = 0
        primary_risks: List[str] = []

        # 1. Concrete Pouring
        if is_raining:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Concrete Pouring & Curing",
                    status="Prohibited / Unsafe",
                    severity_level="danger",
                    recommendation="Active rain will dilute water-cement ratio and wash out unhydrated paste. Suspend unshielded slab pours.",
                    threshold_info="Precipitation > 0.5mm / Active Rainfall"
                )
            )
            danger_count += 1
            primary_risks.append("Rain washout of fresh concrete")
        elif temp > 35.0:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Concrete Pouring & Curing",
                    status="Caution Required",
                    severity_level="warning",
                    recommendation="Hot weather concreting (ACI 305R): high risk of plastic shrinkage cracks. Use chilled mix water, retarders, and immediate wet curing.",
                    threshold_info="Ambient Temp > 35°C (95°F)"
                )
            )
            warning_count += 1
            primary_risks.append("Hot-weather plastic shrinkage")
        elif temp < 5.0:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Concrete Pouring & Curing",
                    status="Caution Required",
                    severity_level="warning",
                    recommendation="Cold weather concreting (ACI 306R): hydration slows drastically. Insulate formwork and maintain concrete temp above 10°C for 72h.",
                    threshold_info="Ambient Temp < 5°C (41°F)"
                )
            )
            warning_count += 1
            primary_risks.append("Cold temperature hydration retardation")
        else:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Concrete Pouring & Curing",
                    status="Safe / Favorable",
                    severity_level="safe",
                    recommendation="Optimal ambient temperature and moisture for standard concrete placement and curing.",
                    threshold_info="10°C - 32°C, moderate humidity"
                )
            )

        # 2. Crane & Working at Height
        if is_thunderstorm or wind_gusts > 50.0:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Crane Lifts & Working at Heights",
                    status="Prohibited / Unsafe",
                    severity_level="danger",
                    recommendation="Cease all tower crane lifts, mobile crane hoisting, and suspended cradle operations immediately. Secure jibs into weathervane mode.",
                    threshold_info="Wind Gusts > 50 km/h or Active Lightning"
                )
            )
            danger_count += 1
            primary_risks.append("Dangerous wind gusts / lightning hazard")
        elif wind_gusts > 35.0 or wind_speed > 25.0:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Crane Lifts & Working at Heights",
                    status="Caution Required",
                    severity_level="warning",
                    recommendation="Review sail area of large panel loads. Cease high-elevation sheet installation; mandatory 100% harness tie-off.",
                    threshold_info="Wind Gusts 35-50 km/h"
                )
            )
            warning_count += 1
            primary_risks.append("Elevated wind shear at height")
        else:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Crane Lifts & Working at Heights",
                    status="Safe / Favorable",
                    severity_level="safe",
                    recommendation="Winds within permissible thresholds for standard rigging, hoisting, and scaffolding access.",
                    threshold_info="Wind Speed < 25 km/h"
                )
            )

        # 3. Painting, Coating & Waterproofing
        if is_raining or humidity > 85:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="External Painting & Waterproofing Membranes",
                    status="Prohibited / Unsafe",
                    severity_level="danger",
                    recommendation="Substrate moisture will prevent primer adhesion and cause blister delamination. Postpone torch-on and liquid waterproofing.",
                    threshold_info="Relative Humidity > 85% or Wet Substrate"
                )
            )
            danger_count += 1
            primary_risks.append("High humidity / coating delamination")
        elif humidity > 75:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="External Painting & Waterproofing Membranes",
                    status="Caution Required",
                    severity_level="warning",
                    recommendation="Drying times substantially prolonged. Test moisture content with concrete moisture meter (< 4% threshold) before application.",
                    threshold_info="Relative Humidity 75-85%"
                )
            )
            warning_count += 1
        else:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="External Painting & Waterproofing Membranes",
                    status="Safe / Favorable",
                    severity_level="safe",
                    recommendation="Excellent dry substrate conditions. Rapid film formation and primer penetration expected.",
                    threshold_info="Relative Humidity < 75%, Dry"
                )
            )

        # 4. Worker Heat Stress & Safety
        if apparent_temp > 40.0:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Personnel Heat-Stress Management",
                    status="Prohibited / Unsafe",
                    severity_level="danger",
                    recommendation="OSHA Extreme Heat Hazard: Mandate 15-minute rest breaks every 45 minutes in shaded/air-conditioned zones. Provide electrolyte hydration.",
                    threshold_info="Heat Index > 40°C (104°F)"
                )
            )
            danger_count += 1
            primary_risks.append("Extreme worker heat exhaustion risk")
        elif apparent_temp > 32.0:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Personnel Heat-Stress Management",
                    status="Caution Required",
                    severity_level="warning",
                    recommendation="Elevated thermal stress. Schedule heavy physical earthworks during early morning hours and deploy buddy monitoring.",
                    threshold_info="Heat Index 32°C - 40°C"
                )
            )
            warning_count += 1
        else:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Personnel Thermal Comfort",
                    status="Safe / Favorable",
                    severity_level="safe",
                    recommendation="Normal thermal conditions for continuous full-shift productivity without extra heat-stress breaks.",
                    threshold_info="Heat Index < 32°C"
                )
            )

        # 5. Earthworks & Excavation
        if precip > 10.0 or is_thunderstorm:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Excavation, Shoring & Earthwork",
                    status="Prohibited / Unsafe",
                    severity_level="danger",
                    recommendation="Heavy saturated soils create severe trench wall collapse hazard. Clear personnel from excavations > 1.2m deep.",
                    threshold_info="Heavy Rain / Soil Liquefaction Risk"
                )
            )
            danger_count += 1
            primary_risks.append("Trench wall slippage / mud inundation")
        else:
            advisories.append(
                ConstructionAdvisoryItem(
                    activity="Excavation, Shoring & Earthwork",
                    status="Safe / Favorable",
                    severity_level="safe",
                    recommendation="Stable subgrade conditions for compaction, grading, and backfilling operations.",
                    threshold_info="Dry soil condition"
                )
            )

        # Overall Status
        if danger_count >= 1 or is_thunderstorm:
            site_status = "Red (Stop Work Hazard)"
            primary_summary = "; ".join(primary_risks[:2]) if primary_risks else "Severe meteorological risk"
        elif warning_count >= 2:
            site_status = "Yellow (Precautionary Operations)"
            primary_summary = "; ".join(primary_risks[:2]) if primary_risks else "Moderate weather precautions required"
        else:
            site_status = "Green (Full Operations)"
            primary_summary = "Favorable weather for all critical civil works"

        return advisories, site_status, primary_summary


weather_service = WeatherService()
