"""
Daily Site Assistant Service.
Provides conversational intelligence for field engineers, superintendents, and foremen
regarding concrete testing, formwork striking times, waterproofing, brickwork, and safety toolbox talks.
"""
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from app.schemas.assistant import ChatRequest, ChatResponse, ChatMessage
from app.services.ai_service import ai_service
from app.core.prompts import DAILY_ASSISTANT_SYSTEM_PROMPT

# Curated expert field responses for common construction queries
COMMON_SITE_TOPICS: Dict[str, Dict[str, Any]] = {
    "curing": {
        "reply": (
            "### Concrete Curing Guidelines (ACI 308R / IS 456)\n\n"
            "1. **Minimum Duration:**\n"
            "   - **Ordinary Portland Cement (OPC):** Minimum 7 days continuous wet curing.\n"
            "   - **Mineral Admixtures (Fly Ash / Slag / Pozzolana):** Minimum 10 to 14 days due to slower pozzolanic hydration.\n"
            "   - **Hot Weather (>30°C / 86°F):** Minimum 10 days with continuous ponding or wet burlap.\n\n"
            "2. **Critical Field Methods:**\n"
            "   - **Slabs & Decks:** Ponding with clay/sand dykes (minimum 25mm water head) or saturated hessian/burlap sheets.\n"
            "   - **Vertical Columns & Shear Walls:** Wrap tightly with wet hessian covers, mist twice daily, or apply certified resin-based curing compound immediately after stripping formwork.\n\n"
            "3. **Quality Check:** Ensure surfaces never dry to white during the first 72 hours; early desiccation causes irreversible micro-shrinkage cracking."
        ),
        "suggested": [
            "What is the permissible slump loss in hot weather?",
            "When can I remove column formwork?",
            "How do I cure high-strength M50 concrete?"
        ],
        "safety_tips": [
            "Avoid slippery wet slab edges without fall arrest safety harness.",
            "Wear waterproof rubber boots and gloves when handling water treated with chemical admixtures."
        ],
        "standards": "ACI 308R Standard Practice for Curing Concrete / IS 456 Clause 13.5"
    },
    "slump": {
        "reply": (
            "### Concrete Slump Test Troubleshooting (ASTM C143 / IS 1199)\n\n"
            "1. **Target Slump Ranges:**\n"
            "   - **Mass Concrete Footings:** 50 - 75 mm (2 - 3 in)\n"
            "   - **Beams & Reinforced Slabs:** 100 - 125 mm (4 - 5 in)\n"
            "   - **Pumped Concrete / Congested Rebar:** 125 - 160 mm (with superplasticizer, not excess water!)\n"
            "   - **Tremie Piles / Diaphragm Walls:** 175 - 200 mm\n\n"
            "2. **Slump Failure Diagnostics:**\n"
            "   - **Shear Slump:** Concrete shears off sideways; indicates lack of cohesion or segregation. Discard sample and retest.\n"
            "   - **Collapse Slump:** Too wet (high w/c ratio); batch must be rejected or dosed with silica fume/binder per mix design.\n"
            "   - **Zero / True Slump Too Low:** Do NOT add raw water on site! Add measured dosage of site-approved superplasticizer (PCE base) and remix at high speed for 3 minutes."
        ),
        "suggested": [
            "How does ambient temperature affect slump loss?",
            "What is the maximum transit time for ready-mix concrete?",
            "How many concrete test cubes should be taken per pour?"
        ],
        "safety_tips": [
            "Ensure concrete chute operator clears swing path before transit mixer discharge.",
            "Wear alkali-resistant nitrile gloves; fresh cement causes severe chemical burns."
        ],
        "standards": "ASTM C143 / AASHTO T119 / IS 1199"
    },
    "formwork": {
        "reply": (
            "### Formwork Striking & De-shuttering Periods (BS 8110 / IS 456)\n\n"
            "Unless accelerated hardening cement or maturity testing is used (ambient temp >= 15°C / 59°F):\n\n"
            "1. **Vertical Walls, Columns & Pier Sides:** 16 to 24 hours (ensure concrete is hard enough not to spall upon removal).\n"
            "2. **Slab Soffits (Props Left In Place):** 3 to 4 days.\n"
            "3. **Beam Soffits (Props Left In Place):** 7 days.\n"
            "4. **Removal of Props Under Slabs:**\n"
            "   - Spans up to 4.5m: 7 days.\n"
            "   - Spans over 4.5m: 14 days.\n"
            "5. **Removal of Props Under Beams & Arches:**\n"
            "   - Spans up to 6m: 14 days.\n"
            "   - Spans over 6m: 21 days.\n\n"
            "*Caution: Always verify field-cured test cylinder/cube compressive strength achieves at least 70% of design characteristic strength before de-propping cantilever or transfer girders.*"
        ),
        "suggested": [
            "What are the inspection checks before pouring a slab?",
            "How do I prevent formwork deflection in high ceilings?",
            "How to treat honeycomb defects after stripping formwork?"
        ],
        "safety_tips": [
            "Never knock out formwork props randomly; release jacks progressively from center of span outward.",
            "Clear exclusion zone below stripping deck and post 'DANGER: OVERHEAD WORK' signs."
        ],
        "standards": "ACI 347 Guide to Formwork for Concrete / IS 456 Clause 11.3"
    },
    "waterproof": {
        "reply": (
            "### Critical Waterproofing Guidelines for Basements & Roofs\n\n"
            "1. **Substrate Preparation (90% of failures happen here!):**\n"
            "   - Round all internal 90° corners with a 50x50mm cementitious fillet (coving/haunch).\n"
            "   - Chip away laitance, honeycomb, and tie-rod cones; patch with non-shrink structural grout.\n"
            "   - Substrate moisture must be < 5% for SBS/APP membranes or bitumen primer.\n\n"
            "2. **Membrane Application:**\n"
            "   - Maintain minimum 100mm side laps and 150mm end laps.\n"
            "   - Stagger end laps by at least 500mm.\n"
            "   - Apply double reinforcement around pipe penetrations, sump drains, and expansion joints.\n\n"
            "3. **Mandatory Acceptance Testing:**\n"
            "   - Flood / Ponding Test: Impound water to a depth of 50mm for minimum 48 to 72 hours.\n"
            "   - Inspect underside slab and wall interfaces for dampness, seepage, or salt sweating."
        ),
        "suggested": [
            "Difference between crystalline vs membrane waterproofing?",
            "How to detail construction joint waterstops in basements?",
            "How to test rooftop screed slopes for water ponding?"
        ],
        "safety_tips": [
            "Confined space protocol mandatory for basement sump waterproofing: continuous ventilation and gas monitoring.",
            "Keep dry-chemical fire extinguisher within 5 meters when torching bituminous membranes."
        ],
        "standards": "ASTM D6152 / BS 8102 Code of Practice for Protection of Below Ground Structures"
    }
}


class DailyAssistantService:
    async def chat(self, req: ChatRequest) -> ChatResponse:
        now_iso = datetime.now(timezone.utc).isoformat()
        user_msg = req.message.strip().lower()

        # If live AI is configured, invoke LLM
        if ai_service.is_configured:
            # Build conversation context
            history_text = ""
            for item in req.conversation_history[-6:]:
                history_text += f"{item.role.upper()}: {item.content}\n"
            history_text += f"USER: {req.message}\n"
            if req.site_context:
                history_text += f"[Context: {req.site_context}]\n"

            prompt = f"Please provide actionable, expert site engineering guidance for the following question:\n\n{history_text}"

            ai_reply = await ai_service.call_text_generation(
                prompt=prompt,
                system_instruction=DAILY_ASSISTANT_SYSTEM_PROMPT
            )

            if ai_reply and len(ai_reply) > 20:
                return ChatResponse(
                    reply=ai_reply,
                    suggested_followups=[
                        "What testing documentation is needed for this activity?",
                        "What safety checks should be included in the morning toolbox talk?",
                        "What is the tolerance limit according to building codes?"
                    ],
                    safety_tips=[
                        "Ensure all operatives are inducted and equipped with site-specific PPE.",
                        "Stop work immediately if unexpected structural movement or severe weather arises."
                    ],
                    relevant_standards_hint="Refer to project engineering specifications and relevant ASTM / ACI / OSHA standards.",
                    timestamp=now_iso,
                    is_simulated=False
                )

        # Contextual Fallback Expert Knowledge Matcher
        matched_key = None
        for key in COMMON_SITE_TOPICS.keys():
            if key in user_msg:
                matched_key = key
                break

        if matched_key:
            data = COMMON_SITE_TOPICS[matched_key]
            return ChatResponse(
                reply=data["reply"],
                suggested_followups=data["suggested"],
                safety_tips=data["safety_tips"],
                relevant_standards_hint=data["standards"],
                timestamp=now_iso,
                is_simulated=True
            )

        # Comprehensive Default Field Advisory
        default_reply = (
            f"### Field Site Advisory: {req.message.strip()}\n\n"
            "As an on-site engineering supervisor, here is the standard protocol for handling this query:\n\n"
            "1. **Verification Against Approved Drawings:**\n"
            "   - Cross-check latest Good for Construction (GFC) drawings and manufacturer specifications before proceeding.\n"
            "   - Verify that any Request for Information (RFI) or structural change notices have been approved by the structural consultant.\n\n"
            "2. **Quality & Workmanship Checkpoints:**\n"
            "   - Check material batch test certificates (MTC) and ensure pre-pour / pre-installation inspection checklists are signed.\n"
            "   - Inspect dimensions, levels, alignments, and tolerances with calibrated surveying instruments.\n\n"
            "3. **Site Safety Precaution:**\n"
            "   - Conduct a 5-minute pre-task Toolbox Talk (TBT) with the frontline trade gang.\n"
            "   - Confirm permit-to-work (PTW) is active for hot work, height work, or trenching.\n\n"
            "*Note: Set AI_API_KEY in backend/.env to enable live generative conversational reasoning.*"
        )

        return ChatResponse(
            reply=default_reply,
            suggested_followups=[
                "How do I cure concrete in hot weather?",
                "What is the standard procedure for slump cone testing?",
                "What are the formwork stripping time requirements?",
                "How to prepare surfaces for basement waterproofing?"
            ],
            safety_tips=[
                "Maintain 100% hard hat and high-vis vest compliance at all times.",
                "Inspect scaffolding tags (Green = Safe, Red = Do Not Use) before permitting personnel access."
            ],
            relevant_standards_hint="OSHA 1926 Safety & Health Regulations for Construction",
            timestamp=now_iso,
            is_simulated=True
        )


daily_assistant_service = DailyAssistantService()
