// TypeScript Domain Types for Multimodal Construction Intelligence

export type SeverityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type SiteStatus = 'Green (Full Operations)' | 'Yellow (Precautionary Operations)' | 'Red (Stop Work Hazard)';

// Health Status
export interface HealthStatus {
  status: string;
  version: string;
  environment: string;
  ai_provider: string;
  ai_configured: boolean;
  ai_model: string;
  memory_usage_mb?: number;
  render_free_tier_optimized: boolean;
}

// Module 1: Dashboard
export interface MetricItem {
  title: string;
  value: number;
  change_pct: number;
  trend: 'up' | 'down' | 'neutral';
  period: string;
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  module: 'safety' | 'crack' | 'valuation' | 'planning' | 'weather';
  title: string;
  site_name: string;
  status: string;
  severity?: string;
}

export interface ProjectStatusDistribution {
  planning: number;
  foundation: number;
  superstructure: number;
  mep_finishes: number;
  commissioning: number;
}

export interface SafetyRiskBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
  safe_audits: number;
}

export interface RecommendationItem {
  id: string;
  category: string;
  title: string;
  action: string;
  urgency: 'Immediate' | 'Priority' | 'Routine';
  timestamp: string;
}

export interface DashboardSummary {
  total_projects: number;
  active_projects: number;
  safety_analyses_performed: number;
  structural_crack_analyses: number;
  property_valuations: number;
  weather_advisories_checked: number;
  metrics: MetricItem[];
  project_status_overview: ProjectStatusDistribution;
  safety_summary: SafetyRiskBreakdown;
  recent_activities: ActivityItem[];
  recent_recommendations: RecommendationItem[];
  ai_status: {
    provider: string;
    configured: boolean;
    model: string;
    mode: string;
  };
}

// Module 2: Safety Monitoring
export interface HazardItem {
  id: string;
  category: string;
  severity: SeverityLevel;
  title: string;
  description: string;
  location_in_image: string;
  corrective_action: string;
  preventive_measure: string;
  regulatory_reference: string;
}

export interface SafetyAnalysisResponse {
  is_construction_site: boolean;
  overall_safety_score: number;
  overall_assessment: string;
  risk_level: SeverityLevel;
  detected_hazards: HazardItem[];
  positive_observations: string[];
  confidence_score: number;
  inspection_disclaimer: string;
  site_name?: string;
  timestamp: string;
  is_simulated: boolean;
  warning?: string;
}

// Module 3: Crack Detection
export interface DefectItem {
  defect_type: string;
  pattern_and_orientation: string;
  visual_width_category: string;
  location: string;
  severity: SeverityLevel;
  possible_causes: string[];
  recommended_actions: string[];
}

export interface CrackAnalysisResponse {
  element_type: string;
  structural_integrity_risk: 'Low' | 'Moderate' | 'Significant' | 'Critical';
  overall_assessment: string;
  detected_defects: DefectItem[];
  surface_deterioration_notes?: string;
  moisture_corrosion_indicators?: string;
  requires_professional_inspection: boolean;
  urgent_evacuation_needed: boolean;
  engineering_disclaimer: string;
  timestamp: string;
  is_simulated: boolean;
  warning?: string;
}

// Module 4: Valuation
export interface ValuationRequest {
  property_name?: string;
  location: string;
  property_type: string;
  built_up_area_sqft: number;
  land_area_sqft?: number;
  bedrooms?: number;
  bathrooms?: number;
  property_age_years: number;
  floor_number?: number;
  total_floors?: number;
  construction_quality: string;
  furnishing_status: string;
  parking_spaces: number;
  nearby_amenities: string[];
  additional_details?: string;
}

export interface ValuationBreakdown {
  base_construction_value: number;
  land_or_location_component: number;
  depreciation_deduction: number;
  amenity_and_spec_premium: number;
  furnishing_premium: number;
}

export interface ValuationResponse {
  estimated_property_value: number;
  estimated_price_per_sqft: number;
  valuation_range: {
    min_value: number;
    max_value: number;
  };
  currency: string;
  property_summary: string;
  valuation_breakdown: ValuationBreakdown;
  positive_valuation_factors: string[];
  negative_valuation_factors: string[];
  value_improvement_suggestions: string[];
  methodology_disclaimer: string;
  timestamp: string;
  is_simulated: boolean;
}

// Module 5: Planning
export interface PlanningRequest {
  project_name: string;
  project_type: string;
  location: string;
  plot_area_sqft?: number;
  built_up_area_sqft: number;
  number_of_floors: number;
  expected_start_date: string;
  expected_completion_date?: string;
  estimated_budget: number;
  currency: string;
  project_description?: string;
}

export interface PhaseItem {
  phase_id: number;
  phase_name: string;
  duration_days: number;
  start_day: number;
  end_day: number;
  estimated_cost_share_pct: number;
  estimated_cost: number;
  suggested_activities: string[];
  dependencies: string[];
  milestones: string[];
  resource_requirements: string[];
  risk_factors: string[];
  mitigation_strategy: string;
}

export interface BudgetAllocationItem {
  category: string;
  percentage: number;
  amount: number;
}

export interface PlanningResponse {
  project_name: string;
  project_type: string;
  location: string;
  total_duration_days: number;
  estimated_budget: number;
  currency: string;
  project_summary: string;
  phases: PhaseItem[];
  budget_allocation: BudgetAllocationItem[];
  critical_path_notes: string;
  disclaimer: string;
  timestamp: string;
  is_simulated: boolean;
  warning?: string;
}

// Module 6: Daily Assistant
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  message: string;
  conversation_history: ChatMessage[];
  site_context?: string;
}

export interface ChatResponse {
  reply: string;
  suggested_followups: string[];
  safety_tips: string[];
  relevant_standards_hint?: string;
  timestamp: string;
  is_simulated: boolean;
}

// Module 7: Weather
export interface ConstructionAdvisoryItem {
  activity: string;
  status: string;
  severity_level: 'safe' | 'warning' | 'danger';
  recommendation: string;
  threshold_info: string;
}

export interface CurrentWeather {
  temperature: number;
  apparent_temperature: number;
  relative_humidity: number;
  precipitation: number;
  rain: number;
  wind_speed: number;
  wind_gusts: number;
  weather_code: number;
  weather_description: string;
  is_day: number;
}

export interface DailyWeatherForecast {
  date: string;
  temperature_max: number;
  temperature_min: number;
  precipitation_probability: number;
  wind_speed_max: number;
  weather_description: string;
}

export interface WeatherResponse {
  location_name: string;
  latitude: number;
  longitude: number;
  current: CurrentWeather;
  forecast_days: DailyWeatherForecast[];
  overall_site_status: string;
  primary_weather_risk: string;
  construction_advisories: ConstructionAdvisoryItem[];
  timestamp: string;
}

// Module 8: Knowledge Assistant
export interface ChecklistItem {
  step: string;
  purpose: string;
  acceptance_criterion: string;
}

export interface KnowledgeRequest {
  question: string;
  category?: string;
  jurisdiction_or_code?: string;
}

export interface KnowledgeResponse {
  query: string;
  answer: string;
  category: string;
  standards_and_citations: string[];
  field_guidelines: string[];
  qa_inspection_checklist: ChecklistItem[];
  jurisdictional_disclaimer: string;
  timestamp: string;
  is_simulated: boolean;
}
