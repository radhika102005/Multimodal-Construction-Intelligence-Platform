"""
Construction Knowledge Assistant Service.
Provides authoritative technical answers on building terminology, materials science,
quality control standards, and civil engineering specifications.
"""
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.schemas.knowledge import KnowledgeRequest, KnowledgeResponse, ChecklistItem
from app.services.ai_service import ai_service
from app.core.prompts import KNOWLEDGE_ASSISTANT_SYSTEM_PROMPT

# Curated reference database for instant, verified answers
CURATED_KNOWLEDGE: Dict[str, Dict[str, Any]] = {
    "segregation": {
        "title": "Concrete Segregation & Bleeding",
        "answer": (
            "Segregation in concrete is the separation of the constituent materials (coarse aggregates settling out "
            "from the cement paste matrix). It results in honeycomb pockets, porous concrete, reduced compressive strength, "
            "and compromised rebar passivation.\n\n"
            "Key Causes: Excessive free-fall height (> 1.5 meters) during pouring, over-vibration with internal needle vibrators, "
            "high water-cement ratio without adequate fines, or improper aggregate grading."
        ),
        "standards": ["ASTM C94 Standard Specification for Ready-Mixed Concrete", "ACI 304R Guide for Measuring, Mixing, Transporting, and Placing Concrete", "IS 456:2000 Concrete Code"],
        "guidelines": [
            "Limit free drop height of fresh concrete to a maximum of 1.5 meters (deploy tremie chutes for deeper drops).",
            "Insert needle vibrators vertically at 400-500mm centers; do NOT drag vibrator horizontally through concrete.",
            "Withdraw vibrator slowly at approximately 75-100 mm/sec to allow air bubbles to escape."
        ],
        "checklist": [
            ChecklistItem(step="Chute Height Check", purpose="Prevent kinetic aggregate separation", acceptance_criterion="Discharge mouth <= 1.5m above formwork bottom"),
            ChecklistItem(step="Vibrator Operator Competency", purpose="Avoid liquefying paste and settling coarse gravel", acceptance_criterion="Insertion 5-15 seconds per spot, withdrawn vertically"),
            ChecklistItem(step="Slump Uniformity", purpose="Ensure consistent viscosity across transit trucks", acceptance_criterion="Slump within +/- 25mm of approved mix design")
        ]
    },
    "cover": {
        "title": "Clear Concrete Cover for Reinforcement",
        "answer": (
            "Clear cover is the distance between the outer surface of embedded reinforcement steel and the nearest outer surface "
            "of the cured concrete. Its purpose is twofold: protecting steel reinforcement against carbonation/chloride corrosion "
            "and providing thermal insulation during a structural fire to maintain steel yield strength."
        ),
        "standards": ["ACI 318-19 Building Code Requirements for Structural Concrete", "BS EN 1992-1-1 (Eurocode 2)", "IS 456 Table 16 Minimum Cover"],
        "guidelines": [
            "Cast concrete or heavy-duty PVC spacer blocks (minimum 50 MPa compressive strength) every 1 meter along rebar.",
            "Never use timber offcuts, bricks, or marble chips as rebar spacers.",
            "Subgrade footings cast against earth require a minimum 75 mm (3 inches) clear cover."
        ],
        "checklist": [
            ChecklistItem(step="Footing / Raft Bottom Cover", purpose="Resist soil moisture and chemical sulfates", acceptance_criterion="Minimum 50 mm to 75 mm"),
            ChecklistItem(step="Columns & Beams Cover", purpose="Fire resistance and carbonation barrier", acceptance_criterion="Minimum 40 mm (or bar diameter, whichever greater)"),
            ChecklistItem(step="Slabs & Walls Cover", purpose="Corrosion prevention in internal environment", acceptance_criterion="Minimum 20 mm to 25 mm")
        ]
    },
    "slump": {
        "title": "Slump Cone Test & Workability",
        "answer": (
            "The slump test measures the consistency and workability of fresh batch concrete prior to placement. "
            "A standard Abrams cone (300mm high, 200mm base diameter, 100mm top diameter) is filled in three equal layers, "
            "each rodded 25 times with a 16mm bullet-nosed tamping rod."
        ),
        "standards": ["ASTM C143 Standard Test Method for Slump of Hydraulic-Cement Concrete", "BS EN 12350-2", "IS 1199"],
        "guidelines": [
            "Perform test on level, non-absorbent rigid surface shielded from direct wind and sun.",
            "Raise cone smoothly upward in 5 +/- 2 seconds with no lateral twist.",
            "Measure slump immediately by determining vertical difference between top of cone and displaced center of sample."
        ],
        "checklist": [
            ChecklistItem(step="Cone Dimensions Check", purpose="Ensure geometric accuracy", acceptance_criterion="Top 100mm, Bottom 200mm, Height 300mm"),
            ChecklistItem(step="Tamping Rodding Protocol", purpose="Uniform compaction without crushing aggregate", acceptance_criterion="25 strokes per layer across full depth"),
            ChecklistItem(step="Elapsed Time from Batching", purpose="Prevent false measurement due to setting", acceptance_criterion="Completed within 2.5 minutes of sampling")
        ]
    }
}


class KnowledgeService:
    async def ask_question(self, req: KnowledgeRequest) -> KnowledgeResponse:
        now_iso = datetime.now(timezone.utc).isoformat()
        q_lower = req.question.lower()

        # Check if live AI is configured
        if ai_service.is_configured:
            prompt = f"""Answer the following construction/civil engineering question thoroughly:
Question: {req.question}
Category: {req.category or 'General'}
Jurisdiction / Code Target: {req.jurisdiction_or_code or 'General Standard'}

Explain the core principles, cite relevant standards (e.g. ACI, ASTM, OSHA, Eurocode, IS),
provide actionable field guidelines, and provide a 3-step inspection checklist.
Output format: JSON matching Knowledge schema or structured text."""

            ai_text = await ai_service.call_text_generation(
                prompt=prompt,
                system_instruction=KNOWLEDGE_ASSISTANT_SYSTEM_PROMPT
            )

            if ai_text and len(ai_text) > 30:
                return KnowledgeResponse(
                    query=req.question,
                    answer=ai_text,
                    category=req.category or "Civil Engineering Knowledge",
                    standards_and_citations=[
                        "ACI 318 Structural Concrete Code",
                        "ASTM International Construction Standards",
                        "OSHA 1926 Safety and Health Standards"
                    ],
                    field_guidelines=[
                        "Always corroborate material batch test sheets against engineer-approved specifications.",
                        "Follow standard sampling intervals (e.g. 1 set of cubes per 50m³ of concrete).",
                        "Maintain formal inspection sign-off records on site for authority auditing."
                    ],
                    qa_inspection_checklist=[
                        ChecklistItem(step="Submittal Verification", purpose="Verify compliance with design intent", acceptance_criterion="Approved shop drawing / material submittal on record"),
                        ChecklistItem(step="Field Tolerances Check", purpose="Avoid structural eccentricity", acceptance_criterion="Plumbness and dimensions within ACI 117 tolerances"),
                        ChecklistItem(step="Testing Protocol", purpose="Verify physical strength properties", acceptance_criterion="Samples tested at accredited third-party laboratory")
                    ],
                    jurisdictional_disclaimer=(
                        "JURISDICTIONAL NOTE: Structural tolerances and fire codes are legally governed by municipal "
                        "building authorities and local adopted building codes (e.g., IBC, NBC, Eurocodes). "
                        "Always defer to certified engineer-stamped project specifications."
                    ),
                    timestamp=now_iso,
                    is_simulated=False
                )

        # Search curated knowledge base
        for key, item in CURATED_KNOWLEDGE.items():
            if key in q_lower:
                return KnowledgeResponse(
                    query=req.question,
                    answer=item["answer"],
                    category=req.category or "Materials & Quality Control",
                    standards_and_citations=item["standards"],
                    field_guidelines=item["guidelines"],
                    qa_inspection_checklist=item["checklist"],
                    jurisdictional_disclaimer=(
                        "JURISDICTIONAL NOTE: These benchmark rules reflect international standards (ACI / ASTM / IS). "
                        "To activate live generative reasoning for customized regional queries, configure AI_API_KEY in backend/.env."
                    ),
                    timestamp=now_iso,
                    is_simulated=True
                )

        # Informative Fallback for general construction concepts
        return KnowledgeResponse(
            query=req.question,
            answer=(
                f"### Civil Engineering Knowledge Base: {req.question}\n\n"
                "In civil construction and structural design, engineering decisions must adhere to strict codal criteria "
                "governing material durability, structural capacity, and occupational safety.\n\n"
                "1. **Design & Code Principles:**\n"
                "   - Structural systems must satisfy both Limit State of Collapse (ultimate strength) and Limit State of Serviceability (deflection, crack width limits).\n"
                "   - Concrete mix proportions must be designed based on water-binder ratio curves (Abrams' law) rather than nominal volumetric recipes.\n\n"
                "2. **Quality Assurance Protocols:**\n"
                "   - All raw aggregates must be verified for alkali-silica reactivity (ASR), silt content (<3%), and organic impurities.\n"
                "   - Rebar must have yield strength (fy) and elongation percentages validated per heat number.\n\n"
                "3. **Safety & Execution:**\n"
                "   - All edge excavations deeper than 1.5m must be benched, shielded, or shored per OSHA 1926 Subpart P."
            ),
            category=req.category or "General Construction",
            standards_and_citations=[
                "ACI 318 Building Code Requirements for Structural Concrete",
                "ASTM C94 Standard Specification for Ready-Mixed Concrete",
                "OSHA 1926 Safety Regulations for Construction"
            ],
            field_guidelines=[
                "Confirm that approved Method Statements are followed by sub-contractors on site.",
                "Conduct mandatory pre-pour inspections 24 hours in advance of any critical structural casting.",
                "Ensure environmental test specimens are cured under identical site humidity and temperature conditions."
            ],
            qa_inspection_checklist=[
                ChecklistItem(step="Material Quality Certificate", purpose="Validate source pedigree and batch chemistry", acceptance_criterion="Mill test report with valid heat/batch stamp"),
                ChecklistItem(step="Dimensional & Level Survey", purpose="Guarantee alignment with structural grid", acceptance_criterion="Within +/- 5mm of benchmark elevation"),
                ChecklistItem(step="Sign-off Signatures", purpose="Establish traceability and regulatory compliance", acceptance_criterion="Resident Engineer and QA/QC Manager countersignatures")
            ],
            jurisdictional_disclaimer=(
                "JURISDICTIONAL LIMITATION: Regional bylaws, seismic zone coefficients, and local soil conditions "
                "dictate mandatory minimum design criteria. Consult the registered Professional Engineer (PE / SE) of record."
            ),
            timestamp=now_iso,
            is_simulated=True
        )


knowledge_service = KnowledgeService()
