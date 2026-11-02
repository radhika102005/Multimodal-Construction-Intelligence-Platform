"""
Real Estate Valuation Service.
Calculates indicative property valuations using a transparent hedonic replacement-cost
and location-adjustment model. Decoupled from live proprietary MLS feeds so custom real estate
datasets or municipal guidance registries can be plugged in easily.
"""
from datetime import datetime, timezone
from typing import Dict, List
from app.schemas.valuation import (
    ValuationRequest,
    ValuationResponse,
    ValuationRange,
    ValuationBreakdown
)
from app.services.ai_service import ai_service

# Regional benchmark reference rates per sq.ft (baseline reference metrics)
BASE_RATES_BY_TYPE = {
    "Residential Apartment": 180.0,
    "Independent House / Villa": 220.0,
    "Commercial Office": 250.0,
    "Retail Shop": 310.0,
    "Industrial Warehouse": 95.0,
    "Plot / Land": 120.0
}

QUALITY_MULTIPLIERS = {
    "Budget": 0.85,
    "Standard": 1.00,
    "Premium": 1.25,
    "Luxury": 1.55
}

FURNISHING_ADDON_PER_SQFT = {
    "Unfurnished": 0.0,
    "Semi-Furnished": 15.0,
    "Fully Furnished": 35.0
}

AMENITY_VALUES = {
    "metro": 15000.0,
    "school": 8000.0,
    "hospital": 10000.0,
    "shopping": 12000.0,
    "highway": 9000.0,
    "park": 6000.0,
    "gym": 5000.0,
    "security": 7000.0
}


class ValuationService:
    async def estimate_valuation(self, req: ValuationRequest) -> ValuationResponse:
        area = max(req.built_up_area_sqft, 100.0)
        base_rate = BASE_RATES_BY_TYPE.get(req.property_type, 180.0)

        # Quality index
        q_mult = QUALITY_MULTIPLIERS.get(req.construction_quality, 1.0)
        base_construction_value = area * base_rate * q_mult

        # Depreciation (straight line with 35% residual floor)
        annual_depreciation_rate = 0.012  # 1.2% per year
        depreciation_pct = min(req.property_age_years * annual_depreciation_rate, 0.65)
        depreciation_deduction = base_construction_value * depreciation_pct

        # Land component (if independent villa or plot)
        land_value = 0.0
        if req.land_area_sqft and req.land_area_sqft > 0:
            land_value = req.land_area_sqft * (base_rate * 0.75)
        else:
            # Imputed undivided share of land for apartments
            land_value = area * (base_rate * 0.40)

        # Amenity additions
        amenity_total = 0.0
        amenity_lower = [a.lower() for a in req.nearby_amenities]
        for key, val in AMENITY_VALUES.items():
            if any(key in a for a in amenity_lower):
                amenity_total += val

        # Parking premium
        amenity_total += max(req.parking_spaces, 0) * 12000.0

        # Furnishing premium
        furnishing_premium = area * FURNISHING_ADDON_PER_SQFT.get(req.furnishing_status, 15.0)

        # Floor premium/discount
        floor_multiplier = 1.0
        if req.floor_number and req.total_floors:
            if req.floor_number > 15:
                floor_multiplier = 1.05  # High-rise view premium
            elif req.floor_number == 1 and req.property_type == "Residential Apartment":
                floor_multiplier = 0.96  # Ground floor noise discount

        # Net estimated value
        raw_estimated = (
            (base_construction_value - depreciation_deduction + land_value + amenity_total + furnishing_premium)
            * floor_multiplier
        )
        estimated_value = round(raw_estimated, 2)
        price_per_sqft = round(estimated_value / area, 2)

        # Valuation range (typically +/- 8% to 10% market variance)
        min_value = round(estimated_value * 0.92, 2)
        max_value = round(estimated_value * 1.08, 2)

        # Positive & Negative Factors
        positives = []
        negatives = []
        improvements = []

        if q_mult >= 1.25:
            positives.append(f"{req.construction_quality} grade structural specifications and high-tier architectural finishes.")
        if req.parking_spaces >= 2:
            positives.append(f"Dedicated multi-vehicle parking ({req.parking_spaces} spaces) provides strong liquidity premium.")
        if len(req.nearby_amenities) >= 3:
            positives.append(f"Rich urban infrastructure access ({', '.join(req.nearby_amenities[:3])}) bolsters demand.")

        if req.property_age_years > 20:
            negatives.append(f"Building age of {req.property_age_years} years imposes higher cumulative structural depreciation.")
            improvements.append("Conduct MEP overhaul and seismic retrofitting verification to improve property lifespan.")
        elif req.property_age_years <= 5:
            positives.append("Near-new structural asset with minimal deferred maintenance liability.")

        if req.furnishing_status == "Unfurnished":
            negatives.append("Unfurnished handover condition requires immediate capital outlay from incoming buyer/tenant.")
            improvements.append("Equip modern modular kitchen and smart lighting to elevate market rental yield by 12-18%.")
        else:
            positives.append(f"{req.furnishing_status} condition accelerates tenancy occupancy readiness.")

        improvements.append("Install energy-efficient heat-reflective roof membrane / double glazing to earn green-building certification.")
        improvements.append("Procure certified structural durability warranty to substantiate valuation near upper bound range.")

        breakdown = ValuationBreakdown(
            base_construction_value=round(base_construction_value, 2),
            land_or_location_component=round(land_value, 2),
            depreciation_deduction=round(depreciation_deduction, 2),
            amenity_and_spec_premium=round(amenity_total, 2),
            furnishing_premium=round(furnishing_premium, 2)
        )

        now_iso = datetime.now(timezone.utc).isoformat()

        # Optional AI enhancement for personalized commentary if API key is present
        summary_text = (
            f"Indicative baseline appraisal for {req.property_type} in {req.location}. "
            f"Evaluates {area:,.0f} sq.ft with {req.construction_quality.lower()} construction quality "
            f"and age of {req.property_age_years} years. Resulting indicative unit rate is ${price_per_sqft:,.2f}/sq.ft."
        )

        if ai_service.is_configured:
            ai_prompt = f"""Generate a concise professional property appraisal summary (2-3 sentences) for:
Location: {req.location}
Type: {req.property_type}
Area: {area} sqft
Age: {req.property_age_years} years
Quality: {req.construction_quality}
Estimated Value: ${estimated_value:,.2f} (${price_per_sqft:,.2f}/sqft)"""
            ai_summary = await ai_service.call_text_generation(ai_prompt)
            if ai_summary and len(ai_summary) > 20:
                summary_text = ai_summary

        return ValuationResponse(
            estimated_property_value=estimated_value,
            estimated_price_per_sqft=price_per_sqft,
            valuation_range=ValuationRange(min_value=min_value, max_value=max_value),
            currency="USD",
            property_summary=summary_text,
            valuation_breakdown=breakdown,
            positive_valuation_factors=positives if positives else ["Standard urban utility access"],
            negative_valuation_factors=negatives if negatives else ["Normal market fluctuation exposure"],
            value_improvement_suggestions=improvements,
            methodology_disclaimer=(
                "INDICATIVE APPRAISAL NOTICE: This valuation is generated using a hedonic replacement cost model "
                "with regional baseline parameters. It does not replace a physical on-site certified appraiser inspection "
                "or legal title diligence."
            ),
            timestamp=now_iso,
            is_simulated=not ai_service.is_configured
        )


valuation_service = ValuationService()
