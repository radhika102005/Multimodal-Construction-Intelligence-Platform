"""
Response parsing and sanitization utilities.
Ensures reliable JSON extraction from LLM outputs.
"""
import json
import re
from typing import Any, Dict, Optional


def extract_json_from_llm(raw_text: str) -> Optional[Dict[str, Any]]:
    """
    Extracts and parses JSON object from an LLM response string.
    Handles Markdown ```json code blocks, extra leading/trailing commentary,
    and trailing commas.
    """
    if not raw_text:
        return None

    cleaned = raw_text.strip()

    # Match ```json ... ``` or ``` ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if match:
        cleaned = match.group(1).strip()

    # Try standard parse
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Attempt to locate first { and last }
    start_idx = cleaned.find("{")
    end_idx = cleaned.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        candidate = cleaned[start_idx : end_idx + 1]
        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            # Clean common trailing commas before closing braces
            sanitized = re.sub(r",\s*([\]}])", r"\1", candidate)
            try:
                return json.loads(sanitized)
            except Exception:
                return None

    return None
