"""
Crack Detection & Structural Image Analysis Service.
Conducts visual forensic evaluation of walls, beams, columns, slabs, and masonry,
categorizing crack patterns, visual width categories, moisture/corrosion signs, and structural risks.
"""
from datetime import datetime, timezone
from typing import Optional
from fastapi import UploadFile

from app.schemas.crack import CrackAnalysisResponse, DefectItem
from app.utils.image_validation import validate_and_read_image
from app.services.ai_service import ai_service
from app.core.prompts import CRACK_ANALYSIS_SYSTEM_PROMPT


class CrackAnalysisService:
    async def analyze_structural_image(
        self,
        file: UploadFile,
        element_type: str = "Wall",
        age_years: Optional[int] = None,
        notes: Optional[str] = None
    ) -> CrackAnalysisResponse:
        _, b64_str, mime_type = await validate_and_read_image(file)

        prompt = f"""Conduct a forensic structural crack analysis on this image.
Structural Element Type: {element_type}
Estimated Structure Age: {f'{age_years} years' if age_years else 'Unknown'}
Field Notes: {notes or 'Visual inspection of surface cracking'}

Analyze visible cracks, trajectories, approximate width category (Hairline, Fine, Medium, Severe),
signs of concrete spalling, efflorescence, water leaching, or rebar corrosion.
Format response strictly as the required JSON schema."""

        ai_data = await ai_service.call_multimodal_vision(
            prompt=prompt,
            image_b64=b64_str,
            mime_type=mime_type,
            system_instruction=CRACK_ANALYSIS_SYSTEM_PROMPT
        )

        now_iso = datetime.now(timezone.utc).isoformat()

        if ai_data and isinstance(ai_data, dict) and "structural_integrity_risk" in ai_data:
            defects = []
            for d in ai_data.get("detected_defects", []):
                defects.append(
                    DefectItem(
                        defect_type=d.get("defect_type", "Surface Crack"),
                        pattern_and_orientation=d.get("pattern_and_orientation", "Irregular trajectory"),
                        visual_width_category=d.get("visual_width_category", "Fine (1-2mm)"),
                        location=d.get("location", f"Central zone of {element_type}"),
                        severity=d.get("severity", "Medium"),
                        possible_causes=d.get("possible_causes", ["Thermal expansion / contraction"]),
                        recommended_actions=d.get("recommended_actions", ["Monitor with calibrated crack card"])
                    )
                )

            return CrackAnalysisResponse(
                element_type=ai_data.get("element_type", element_type),
                structural_integrity_risk=ai_data.get("structural_integrity_risk", "Moderate"),
                overall_assessment=ai_data.get("overall_assessment", "Visual defect assessment completed."),
                detected_defects=defects,
                surface_deterioration_notes=ai_data.get("surface_deterioration_notes", "Minor surface weathering noted."),
                moisture_corrosion_indicators=ai_data.get("moisture_corrosion_indicators", "No active water efflorescence visible."),
                requires_professional_inspection=ai_data.get("requires_professional_inspection", True),
                urgent_evacuation_needed=ai_data.get("urgent_evacuation_needed", False),
                engineering_disclaimer=ai_data.get(
                    "engineering_disclaimer",
                    "Visual assessment only. A licensed professional structural engineer must inspect on site."
                ),
                timestamp=now_iso,
                is_simulated=False
            )

        # Fallback Engineering Heuristic Baseline
        return self._generate_fallback_crack_report(element_type, now_iso)

    def _generate_fallback_crack_report(self, element_type: str, timestamp: str) -> CrackAnalysisResponse:
        defects = [
            DefectItem(
                defect_type="Diagonal Shear / Stepped Crack",
                pattern_and_orientation="45-degree diagonal pattern extending diagonally from corner boundary",
                visual_width_category="Medium (2-5mm)",
                location=f"Primary shear zone across {element_type.lower()} face",
                severity="High",
                possible_causes=[
                    "Differential foundation settlement causing angular distortion (Hypothesis)",
                    "Inadequate shear reinforcement or load redistribution (Hypothesis)",
                    "Subgrade consolidation or moisture variation beneath footings (Hypothesis)"
                ],
                recommended_actions=[
                    "Install calibrated tell-tale optical crack monitoring gauges across the fissure immediately",
                    "Inspect adjacent structural framing and foundation grade beams for secondary settlement signs",
                    "Conduct Ultrasonic Pulse Velocity (UPV) and rebound hammer non-destructive testing (NDT)",
                    "Refrain from cosmetic plaster patching until crack stabilization is scientifically verified"
                ]
            ),
            DefectItem(
                defect_type="Surface Crazing & Shrinkage Micro-cracks",
                pattern_and_orientation="Random multi-directional hexagonal map pattern",
                visual_width_category="Hairline (<1mm)",
                location="Surface render / outer concrete skin",
                severity="Low",
                possible_causes=[
                    "Plastic shrinkage during initial hydration due to rapid surface drying (Hypothesis)",
                    "High water-cement ratio in top plaster finish coat (Hypothesis)"
                ],
                recommended_actions=[
                    "Apply elastomeric breathable protective coating to prevent moisture ingress into rebar depth",
                    "Re-check periodically during high thermal fluctuation cycles"
                ]
            )
        ]

        return CrackAnalysisResponse(
            element_type=element_type,
            structural_integrity_risk="Significant",
            overall_assessment=(
                f"Visual inspection reveals noticeable diagonal distress across the inspected {element_type.lower()}. "
                "The 2-5mm diagonal crack orientation indicates possible differential settlement or shear stress "
                "rather than benign cosmetic shrinkage. Immediate engineering monitoring is recommended."
            ),
            detected_defects=defects,
            surface_deterioration_notes="Slight surface spalling observed adjacent to primary diagonal crack edges.",
            moisture_corrosion_indicators="Trace calcium carbonate efflorescence leaching noted, indicating moisture penetration.",
            requires_professional_inspection=True,
            urgent_evacuation_needed=False,
            engineering_disclaimer=(
                "CRITICAL ENGINEERING DISCLAIMER: This tool delivers a visual preliminary screening. Ordinary photography "
                "cannot determine subsurface rebar integrity, concrete core compressive strength, or active load state. "
                "Configure AI_API_KEY in backend/.env for live multimodal model processing. A certified Structural Engineer "
                "must conduct formal non-destructive testing before initiating structural repairs."
            ),
            timestamp=timestamp,
            is_simulated=True,
            warning="AI_API_KEY not configured. Displaying forensic civil engineering benchmark baseline."
        )


crack_service = CrackAnalysisService()
