import React, { useState } from 'react';
import {
  Building2,
  DollarSign,
  TrendingUp,
  Sparkles,
  Printer,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Info,
  Layers,
  MapPin,
  Car,
  Home
} from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';
import { AlertBanner } from '../components/AlertBanner';
import { apiService } from '../services/api';
import { ValuationRequest, ValuationResponse } from '../types';

export const Valuation: React.FC = () => {
  const [formData, setFormData] = useState<ValuationRequest>({
    property_name: 'Metro View Premier Apartment',
    location: 'Chicago Downtown Corridor',
    property_type: 'Residential Apartment',
    built_up_area_sqft: 1850,
    land_area_sqft: 0,
    bedrooms: 3,
    bathrooms: 2,
    property_age_years: 5,
    floor_number: 12,
    total_floors: 24,
    construction_quality: 'Premium',
    furnishing_status: 'Fully Furnished',
    parking_spaces: 2,
    nearby_amenities: ['Metro Station', 'International School', 'Supermarket', 'Highway access'],
    additional_details: 'Corner unit with balcony overlooking city skyline'
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValuationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await apiService.estimateValuation(formData);
      setResult(res);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Valuation computation failed.');
    } finally {
      setLoading(false);
    }
  };

  const toggleAmenity = (item: string) => {
    const current = formData.nearby_amenities;
    if (current.includes(item)) {
      setFormData({ ...formData, nearby_amenities: current.filter((a) => a !== item) });
    } else {
      setFormData({ ...formData, nearby_amenities: [...current, item] });
    }
  };

  const allAmenities = [
    'Metro Station',
    'International School',
    'Supermarket',
    'Hospital',
    'Highway access',
    'Public Park',
    'Fitness Center',
    '24/7 Security'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 bg-construction-100 text-construction-700 rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-extrabold text-navy-950 tracking-tight">
              Real Estate Valuation & Appraisal
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Hedonic replacement cost modeling, structural depreciation calculations, and value-enhancement insights.
          </p>
        </div>

        {result && (
          <button
            onClick={() => window.print()}
            className="inline-flex items-center justify-center px-4 py-2 bg-navy-900 hover:bg-navy-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors self-start sm:self-auto"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print Appraisal Report
          </button>
        )}
      </div>

      {error && (
        <AlertBanner
          type="error"
          title="Valuation Processing Error"
          message={error}
        />
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <h2 className="text-base font-bold text-navy-900 flex items-center">
            <Home className="w-4 h-4 mr-2 text-construction-500" />
            Property Parameters
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Property / Development Name
              </label>
              <input
                type="text"
                value={formData.property_name}
                onChange={(e) => setFormData({ ...formData, property_name: e.target.value })}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  City / Location
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Property Type
                </label>
                <select
                  value={formData.property_type}
                  onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                >
                  <option value="Residential Apartment">Residential Apartment</option>
                  <option value="Independent House / Villa">Independent House / Villa</option>
                  <option value="Commercial Office">Commercial Office</option>
                  <option value="Retail Shop">Retail Shop</option>
                  <option value="Industrial Warehouse">Industrial Warehouse</option>
                  <option value="Plot / Land">Plot / Land</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Built-up (Sq Ft)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  value={formData.built_up_area_sqft}
                  onChange={(e) => setFormData({ ...formData, built_up_area_sqft: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Bedrooms
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.bedrooms || ''}
                  onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.property_age_years}
                  onChange={(e) => setFormData({ ...formData, property_age_years: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Construction Quality
                </label>
                <select
                  value={formData.construction_quality}
                  onChange={(e) => setFormData({ ...formData, construction_quality: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                >
                  <option value="Budget">Budget / Standard Builder Grade</option>
                  <option value="Standard">Standard City Spec</option>
                  <option value="Premium">Premium Engineered Finish</option>
                  <option value="Luxury">Luxury High-Spec</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Furnishing Status
                </label>
                <select
                  value={formData.furnishing_status}
                  onChange={(e) => setFormData({ ...formData, furnishing_status: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                >
                  <option value="Unfurnished">Unfurnished</option>
                  <option value="Semi-Furnished">Semi-Furnished</option>
                  <option value="Fully Furnished">Fully Furnished</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Floor Level
                </label>
                <input
                  type="number"
                  value={formData.floor_number || ''}
                  onChange={(e) => setFormData({ ...formData, floor_number: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                  placeholder="e.g. 12"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Parking Spaces
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.parking_spaces}
                  onChange={(e) => setFormData({ ...formData, parking_spaces: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-construction-500 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Amenity Chips */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Nearby Amenities & Accessibility
              </label>
              <div className="flex flex-wrap gap-1.5">
                {allAmenities.map((amenity) => {
                  const selected = formData.nearby_amenities.includes(amenity);
                  return (
                    <button
                      type="button"
                      key={amenity}
                      onClick={() => toggleAmenity(amenity)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all ${
                        selected
                          ? 'bg-construction-500 border-construction-500 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {amenity}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-construction-500 hover:bg-construction-600 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold rounded-xl shadow-md shadow-construction-500/25 transition-all text-sm flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Calculating Valuation Matrix...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Property Valuation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Valuation Results */}
        <div className="lg:col-span-7">
          {!result && !loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[440px]">
              <div className="w-16 h-16 bg-navy-50 text-navy-600 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="w-8 h-8 text-construction-500" />
              </div>
              <h3 className="text-base font-bold text-navy-950 mb-1">
                Awaiting Property Data
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                Fill in the property parameters to compute an indicative market valuation with replacement cost breakdown and value drivers.
              </p>
            </div>
          )}

          {loading && (
            <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center flex flex-col items-center justify-center min-h-[440px] space-y-4">
              <div className="w-12 h-12 border-4 border-construction-500 border-t-transparent rounded-full animate-spin" />
              <div>
                <h3 className="text-sm font-bold text-navy-900">
                  Executing Hedonic Appraisal Algorithm
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Adjusting baseline replacement cost for age depreciation and amenities...
                </p>
              </div>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-5">
              {/* Valuation Hero Card */}
              <div className="bg-gradient-to-br from-navy-950 via-navy-900 to-navy-850 text-white p-6 rounded-2xl shadow-lg border border-navy-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-construction-400">
                  Indicative Market Value
                </span>
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mt-1 mb-4 gap-2">
                  <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    ${result.estimated_property_value.toLocaleString()}
                  </h3>
                  <div className="text-sm text-slate-300 font-semibold bg-white/10 px-3 py-1 rounded-xl">
                    ${result.estimated_price_per_sqft.toLocaleString()} / sq ft
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                  <span>Estimated Valuation Range:</span>
                  <span className="font-bold text-white">
                    ${result.valuation_range.min_value.toLocaleString()} - ${result.valuation_range.max_value.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Property Summary & Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                  Appraisal Summary
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {result.property_summary}
                </p>

                <div className="pt-4 border-t border-slate-100">
                  <h5 className="text-xs font-bold text-navy-950 mb-3">
                    Cost Component Breakdown
                  </h5>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Base Construction Value:</span>
                      <span className="font-semibold text-navy-900">
                        ${result.valuation_breakdown.base_construction_value.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Land / Location Allocation:</span>
                      <span className="font-semibold text-navy-900">
                        ${result.valuation_breakdown.land_or_location_component.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Amenity & Specification Premium:</span>
                      <span className="font-semibold text-navy-900">
                        +${result.valuation_breakdown.amenity_and_spec_premium.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Furnishing Package:</span>
                      <span className="font-semibold text-navy-900">
                        +${result.valuation_breakdown.furnishing_premium.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-rose-600 border-t border-slate-100 pt-1">
                      <span>Depreciation Deduction:</span>
                      <span className="font-semibold">
                        -${result.valuation_breakdown.depreciation_deduction.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Positive and Negative Influencers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <h4 className="text-xs font-bold text-emerald-800 flex items-center mb-2.5">
                    <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                    Positive Valuation Drivers
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {result.positive_valuation_factors.map((f, i) => (
                      <li key={i} className="flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 mr-2 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <h4 className="text-xs font-bold text-rose-800 flex items-center mb-2.5">
                    <XCircle className="w-4 h-4 mr-1.5 text-rose-600" />
                    Value Limiting Factors
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {result.negative_valuation_factors.map((f, i) => (
                      <li key={i} className="flex items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1 mr-2 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggestions to Improve Value */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
                <h4 className="text-xs font-bold text-navy-950 flex items-center">
                  <Lightbulb className="w-4 h-4 mr-1.5 text-construction-500" />
                  Actionable Strategies to Maximize Asset Value
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {result.value_improvement_suggestions.map((s, i) => (
                    <li key={i} className="flex items-start">
                      <span className="w-1.5 h-1.5 rounded-full bg-construction-500 mt-1 mr-2 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="p-3.5 bg-slate-100 rounded-xl text-[11px] text-slate-500 leading-relaxed">
                <span className="font-semibold text-slate-700 block mb-0.5">Appraisal Methodology:</span>
                {result.methodology_disclaimer}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
