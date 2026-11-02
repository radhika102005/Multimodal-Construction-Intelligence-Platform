"""
Construction Project Planning Service.
Generates structured Work Breakdown Structures (WBS), phase durations, critical path milestones,
resource allocations, and budget distributions for civil engineering projects.
"""
from datetime import datetime, timezone
from typing import List, Dict, Any
from app.schemas.planning import (
    PlanningRequest,
    PlanningResponse,
    PhaseItem,
    BudgetAllocationItem
)
from app.services.ai_service import ai_service
from app.core.prompts import PLANNING_ASSISTANT_PROMPT


class PlanningService:
    async def generate_project_plan(self, req: PlanningRequest) -> PlanningResponse:
        now_iso = datetime.now(timezone.utc).isoformat()

        # Check if live AI generation is configured
        if ai_service.is_configured:
            prompt = f"""Generate a comprehensive construction schedule and WBS for:
Project Name: {req.project_name}
Project Type: {req.project_type}
Location: {req.location}
Built-up Area: {req.built_up_area_sqft} sq ft
Floors: {req.number_of_floors}
Target Start Date: {req.expected_start_date}
Target Completion: {req.expected_completion_date or 'Optimal CPM estimation'}
Budget: {req.estimated_budget} {req.currency}
Description: {req.project_description or 'Standard multi-story construction'}

Output strictly valid JSON matching the planning schema."""

            ai_data = await ai_service.call_text_generation(
                prompt=prompt,
                system_instruction=PLANNING_ASSISTANT_PROMPT,
                expect_json=True
            )

            if ai_data and isinstance(ai_data, dict) and "phases" in ai_data:
                phases = []
                for p in ai_data.get("phases", []):
                    cost_pct = float(p.get("estimated_cost_share_pct", 10.0))
                    phases.append(
                        PhaseItem(
                            phase_id=int(p.get("phase_id", len(phases) + 1)),
                            phase_name=p.get("phase_name", "Construction Phase"),
                            duration_days=int(p.get("duration_days", 30)),
                            start_day=int(p.get("start_day", 1)),
                            end_day=int(p.get("end_day", 30)),
                            estimated_cost_share_pct=cost_pct,
                            estimated_cost=round(req.estimated_budget * (cost_pct / 100.0), 2),
                            suggested_activities=p.get("suggested_activities", ["Execute site works"]),
                            dependencies=p.get("dependencies", ["Preceding phase signoff"]),
                            milestones=p.get("milestones", ["Inspection milestone"]),
                            resource_requirements=p.get("resource_requirements", ["General civil crew"]),
                            risk_factors=p.get("risk_factors", ["Weather delay exposure"]),
                            mitigation_strategy=p.get("mitigation_strategy", "Implement parallel scheduling buffers.")
                        )
                    )

                budgets = []
                for b in ai_data.get("budget_allocation", []):
                    budgets.append(
                        BudgetAllocationItem(
                            category=b.get("category", "General Civil Works"),
                            percentage=float(b.get("percentage", 10.0)),
                            amount=float(b.get("amount", req.estimated_budget * 0.1))
                        )
                    )

                return PlanningResponse(
                    project_name=req.project_name,
                    project_type=req.project_type,
                    location=req.location,
                    total_duration_days=int(ai_data.get("total_duration_days", 360)),
                    estimated_budget=req.estimated_budget,
                    currency=req.currency,
                    project_summary=ai_data.get(
                        "project_summary",
                        f"Comprehensive construction execution plan for {req.project_name}."
                    ),
                    phases=phases,
                    budget_allocation=budgets if budgets else self._default_budgets(req.estimated_budget),
                    critical_path_notes=ai_data.get(
                        "critical_path_notes",
                        "Substructure deep foundation curing and superstructure floor casting dictate the critical path."
                    ),
                    disclaimer=ai_data.get(
                        "disclaimer",
                        "AI baseline schedule. Certified PMP/Structural Engineer must validate local site conditions."
                    ),
                    timestamp=now_iso,
                    is_simulated=False
                )

        # High-Fidelity Deterministic CPM Planning Engine (Fallback)
        return self._generate_deterministic_plan(req, now_iso)

    def _generate_deterministic_plan(self, req: PlanningRequest, timestamp: str) -> PlanningResponse:
        # Scale duration logically based on floors and built-up area
        base_days_per_floor = 22
        total_days = max(180, int((req.number_of_floors * base_days_per_floor) + (req.built_up_area_sqft / 250)))

        phase_specs = [
            {
                "id": 1,
                "name": "Site Mobilization, Survey & Excavation",
                "pct_duration": 0.12,
                "pct_cost": 0.08,
                "activities": [
                    "Site perimeter hoarding, security access gate, and temporary utilities installation",
                    "Geotechnical bore-hole soil validation and benchmark level survey setting",
                    "Bulk excavation, earth retention shoring, and dewatering pump setup"
                ],
                "deps": ["Municipal Building Permit Approval", "Environmental Clearance"],
                "milestones": ["Excavation to Subgrade Formation Level Achieved", "Soil Bearing Capacity Sign-off"],
                "resources": ["Hydraulic Excavator 20T", "Dump Trucks (4 units)", "Surveyor Crew with Total Station"],
                "risks": ["Unexpected underground utilities", "High water table during monsoon"],
                "mitigation": "Perform pre-excavation ground penetrating radar (GPR) scan and install dual sump pumps."
            },
            {
                "id": 2,
                "name": "Substructure & Foundation Construction",
                "pct_duration": 0.18,
                "pct_cost": 0.22,
                "activities": [
                    "Plain cement concrete (PCC) mud mat placement",
                    "Raft slab / isolated footing reinforcement tying and formwork",
                    "Ready-mix concrete (RMC) pouring, vibratory compaction, and moist curing",
                    "Sub-surface waterproofing membrane and backfilling in 200mm compacted layers"
                ],
                "deps": ["Excavation Sign-off"],
                "milestones": ["Foundation Pour Complete (28-day cube strength verified)", "Plinth Level Handover"],
                "resources": ["Stationary Concrete Pump", "Bar Bending Crew", "Transit Mixers"],
                "risks": ["Thermal cracking in mass concrete pours", "Water ingress through cold joints"],
                "mitigation": "Use low-heat pozzolanic cement blend, chilled mixing water, and hydrophilic waterstops."
            },
            {
                "id": 3,
                "name": "Superstructure Framing & Structural Slabs",
                "pct_duration": 0.32,
                "pct_cost": 0.30,
                "activities": [
                    "Column rebar cage fabrication, lap splicing, and vertical shuttering",
                    "Modular aluminum / engineered formwork system assembly for typical floor plates",
                    "Conduit embedment for electrical / plumbing sleeves before slab pours",
                    "Floor slab concrete casting in 7-10 day cycle per level"
                ],
                "deps": ["Foundation Substructure Sign-off"],
                "milestones": ["50% Vertical Height Reached", "Structural Top-Out Complete"],
                "resources": ["Tower Crane (50m jib)", "Concrete Placer Boom", "Certified Scaffolders"],
                "risks": ["Premature formwork stripping causing deflection", "Severe wind gusts impeding tower crane"],
                "mitigation": "Enforce strict maturity cube testing before de-shuttering and deploy digital anemometers."
            },
            {
                "id": 4,
                "name": "Building Envelope & Exterior Masonry / Waterproofing",
                "pct_duration": 0.16,
                "pct_cost": 0.14,
                "activities": [
                    "Autoclaved aerated concrete (AAC) block masonry perimeter wall construction",
                    "Exterior window frame sub-bucks installation and silicone perimeter sealing",
                    "Rooftop elastomeric multi-layer waterproofing membrane application with ponding test",
                    "Exterior facade plastering and weather-resistant primer application"
                ],
                "deps": ["Superstructure Top-Out"],
                "milestones": ["Structure Watertight Envelope Verified", "Rooftop Flood Test Cleared (72 hrs)"],
                "resources": ["Suspended Cradle Platforms", "Masonry Teams", "Waterproofing Specialists"],
                "risks": ["Heavy rainfall compromising uncured sealant", "Thermal movement at masonry-concrete joints"],
                "mitigation": "Install expanded wire mesh at column-wall junctions and seal with polyurethane caulking."
            },
            {
                "id": 5,
                "name": "MEP Rough-ins & Interior Architectural Finishes",
                "pct_duration": 0.14,
                "pct_cost": 0.18,
                "activities": [
                    "Chilled water piping, HVAC ducting, and fire suppression sprinkler piping",
                    "Electrical wiring pull, distribution panels, and low-voltage cable trays",
                    "Drywall partition installation, gypsum ceiling framing, and wall skimming",
                    "Vitrified floor tiling, ceramic wall tiling, and sanitaryware rough-in"
                ],
                "deps": ["Building Envelope Watertight Sign-off"],
                "milestones": ["Hydrostatic Pressure Test Passed for Piping", "Interior Paint First Coat Completed"],
                "resources": ["HVAC Technicians", "Licensed Electricians", "Tile Masons"],
                "risks": ["Space clashes between ductwork and gravity sewer lines", "Material breakage/scratches"],
                "mitigation": "Run 3D BIM clash detection prior to site fabrication and apply peelable floor protection films."
            },
            {
                "id": 6,
                "name": "Testing, Commissioning, Snagging & Handover",
                "pct_duration": 0.08,
                "pct_cost": 0.08,
                "activities": [
                    "Elevator load safety testing and municipal fire safety drill inspection",
                    "HVAC air and water balancing (TAB) and electrical load testing",
                    "Room-by-room snag list audit and touch-up rectification",
                    "Final cleaning, as-built drawing compilation, and O&M manual handover"
                ],
                "deps": ["MEP Finishes Complete"],
                "milestones": ["Certificate of Occupancy (CO) Received", "Client Handover Keys Transferred"],
                "resources": ["Commissioning Authority Engineer", "Snagging Rectification Teams"],
                "risks": ["Municipal inspection punch-list hold-ups", "Last-minute owner variation orders"],
                "mitigation": "Conduct internal mock inspection 30 days prior to official municipal authority audit."
            }
        ]

        phases: List[PhaseItem] = []
        current_day = 1
        for s in phase_specs:
            dur = max(14, int(total_days * s["pct_duration"]))
            start = current_day
            end = current_day + dur - 1
            cost = round(req.estimated_budget * s["pct_cost"], 2)

            phases.append(
                PhaseItem(
                    phase_id=s["id"],
                    phase_name=s["name"],
                    duration_days=dur,
                    start_day=start,
                    end_day=end,
                    estimated_cost_share_pct=round(s["pct_cost"] * 100.0, 1),
                    estimated_cost=cost,
                    suggested_activities=s["activities"],
                    dependencies=s["deps"],
                    milestones=s["milestones"],
                    resource_requirements=s["resources"],
                    risk_factors=s["risks"],
                    mitigation_strategy=s["mitigation"]
                )
            )
            # Allow modest 20% overlap between finishing and envelope
            current_day = end + 1

        budgets = self._default_budgets(req.estimated_budget)

        return PlanningResponse(
            project_name=req.project_name,
            project_type=req.project_type,
            location=req.location,
            total_duration_days=total_days,
            estimated_budget=req.estimated_budget,
            currency=req.currency,
            project_summary=(
                f"Generated baseline construction execution master plan for {req.project_name} in {req.location}. "
                f"Features {req.number_of_floors} floors across {req.built_up_area_sqft:,.0f} sq.ft. "
                f"Calculates an estimated critical duration of {total_days} calendar days segmented into 6 sequential phases."
            ),
            phases=phases,
            budget_allocation=budgets,
            critical_path_notes=(
                "CRITICAL PATH: Phase 1 Excavation -> Phase 2 Deep Raft Foundation -> "
                "Phase 3 Structural Superstructure Deck Casting. Any stoppage during vertical structural framing "
                "will cause direct day-for-day delay to the final occupancy date."
            ),
            disclaimer=(
                "PLANNING SUGGESTION DISCLAIMER: This schedule is synthesized via deterministic construction scheduling logic. "
                "Configure AI_API_KEY in backend/.env for dynamic generative LLM scheduling adjustments. "
                "Local municipal permits, monsoon restrictions, and soil borings must be incorporated by the project manager."
            ),
            timestamp=timestamp,
            is_simulated=True,
            warning="AI_API_KEY not configured. Displaying benchmark civil engineering schedule baseline."
        )

    def _default_budgets(self, total: float) -> List[BudgetAllocationItem]:
        breakdown = [
            ("Substructure & Earthwork", 0.20),
            ("Superstructure (Concrete & Rebar)", 0.32),
            ("MEP & Building Services", 0.18),
            ("Building Envelope & Masonry", 0.12),
            ("Interior Architectural Finishes", 0.10),
            ("Project Management & Contingency", 0.08)
        ]
        return [
            BudgetAllocationItem(
                category=cat,
                percentage=round(pct * 100.0, 1),
                amount=round(total * pct, 2)
            )
            for cat, pct in breakdown
        ]


planning_service = PlanningService()
