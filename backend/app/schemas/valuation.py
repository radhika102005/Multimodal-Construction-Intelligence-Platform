"""
Schemas for Real Estate Valuation module.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class ValuationRequest(BaseModel):
    property_name: Optional[str] = "Subject Property"
    location: str = Field(..., min_length=2, description="City, district, or sub-market area")
    property_type: str = Field("Residential Apartment", description="Residential Apartment, Villa, Commercial Office, Retail, Industrial Warehouse")
    built_up_area_sqft: float = Field(..., gt=50, description="Gross built-up area in square feet")
    land_area_sqft: Optional[float] = Field(None, ge=0, description="Plot or land area if applicable")
    bedrooms: Optional[int] = Field(None, ge=0)
    bathrooms: Optional[int] = Field(None, ge=0)
    property_age_years: int = Field(0, ge=0, description="Structure age in years")
    floor_number: Optional[int] = Field(None, description="Floor level")
    total_floors: Optional[int] = Field(None, ge=1)
    construction_quality: str = Field("Standard", description="Budget, Standard, Premium, Luxury")
    furnishing_status: str = Field("Semi-Furnished", description="Unfurnished, Semi-Furnished, Fully Furnished")
    parking_spaces: int = Field(1, ge=0)
    nearby_amenities: List[str] = Field(default_factory=list, description="Metro, Schools, Hospitals, Highway, Mall")
    additional_details: Optional[str] = None


class ValuationBreakdown(BaseModel):
    base_construction_value: float
    land_or_location_component: float
    depreciation_deduction: float
    amenity_and_spec_premium: float
    furnishing_premium: float


class ValuationRange(BaseModel):
    min_value: float
    max_value: float


class ValuationResponse(BaseModel):
    estimated_property_value: float
    estimated_price_per_sqft: float
    valuation_range: ValuationRange
    currency: str = "USD"
    property_summary: str
    valuation_breakdown: ValuationBreakdown
    positive_valuation_factors: List[str]
    negative_valuation_factors: List[str]
    value_improvement_suggestions: List[str]
    methodology_disclaimer: str
    timestamp: str
    is_simulated: bool = False
