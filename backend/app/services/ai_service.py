"""
Provider-independent AI Service Layer.
Connects to Google Gemini API (default) or OpenAI-compatible multimodal endpoints
using asynchronous HTTPX requests without loading heavy local models or PyTorch.
Ensures compatibility with Render 512MB RAM constraints.
"""
import logging
from typing import Optional, Dict, Any
import httpx
from app.config import settings
from app.utils.response_formatter import extract_json_from_llm

logger = logging.getLogger(__name__)


class AIService:
    def __init__(self):
        self.provider = settings.AI_PROVIDER.lower()
        self.api_key = settings.AI_API_KEY.strip() if settings.AI_API_KEY else ""
        self.model = settings.AI_MODEL
        self.timeout = settings.REQUEST_TIMEOUT_SECONDS

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and len(self.api_key) > 5)

    async def call_multimodal_vision(
        self,
        prompt: str,
        image_b64: str,
        mime_type: str,
        system_instruction: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Sends an image + prompt to the configured multimodal LLM.
        Returns parsed JSON dict, or None if API key is not configured or fails.
        """
        if not self.is_configured:
            logger.info("AI_API_KEY not configured. Falling back to engineering heuristic engine.")
            return None

        try:
            if self.provider == "gemini":
                return await self._call_gemini_vision(prompt, image_b64, mime_type, system_instruction)
            elif self.provider == "openai":
                return await self._call_openai_vision(prompt, image_b64, mime_type, system_instruction)
            else:
                logger.warning(f"Unsupported AI provider: {self.provider}")
                return None
        except Exception as e:
            logger.error(f"Error calling multimodal AI service: {str(e)}")
            return None

    async def call_text_generation(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        expect_json: bool = False
    ) -> Optional[Any]:
        """
        Sends a text prompt to the LLM.
        Returns either parsed JSON dict (if expect_json=True) or response string.
        """
        if not self.is_configured:
            return None

        try:
            if self.provider == "gemini":
                return await self._call_gemini_text(prompt, system_instruction, expect_json)
            elif self.provider == "openai":
                return await self._call_openai_text(prompt, system_instruction, expect_json)
            else:
                return None
        except Exception as e:
            logger.error(f"Error calling text AI service: {str(e)}")
            return None

    # -------------------------------------------------------------
    # Google Gemini Implementations
    # -------------------------------------------------------------
    async def _call_gemini_vision(
        self,
        prompt: str,
        image_b64: str,
        mime_type: str,
        system_instruction: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        full_prompt = prompt
        if system_instruction:
            full_prompt = f"{system_instruction}\n\nTask:\n{prompt}"

        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": full_prompt},
                        {
                            "inline_data": {
                                "mime_type": mime_type,
                                "data": image_b64
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 2048,
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                logger.error(f"Gemini API returned status {resp.status_code}: {resp.text}")
                return None

            result = resp.json()
            candidates = result.get("candidates", [])
            if not candidates:
                return None

            text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return extract_json_from_llm(text_content)

    async def _call_gemini_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        expect_json: bool = False
    ) -> Optional[Any]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"

        full_prompt = prompt
        if system_instruction:
            full_prompt = f"{system_instruction}\n\nUser Question:\n{prompt}"

        payload: Dict[str, Any] = {
            "contents": [{"parts": [{"text": full_prompt}]}],
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 2048
            }
        }
        if expect_json:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code != 200:
                logger.error(f"Gemini API error: {resp.text}")
                return None

            result = resp.json()
            candidates = result.get("candidates", [])
            if not candidates:
                return None

            text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            if expect_json:
                return extract_json_from_llm(text_content)
            return text_content.strip()

    # -------------------------------------------------------------
    # OpenAI Implementations (Fallback provider)
    # -------------------------------------------------------------
    async def _call_openai_vision(
        self,
        prompt: str,
        image_b64: str,
        mime_type: str,
        system_instruction: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})

        messages.append({
            "role": "user",
            "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:{mime_type};base64,{image_b64}"}}
            ]
        })

        payload = {
            "model": self.model if "gpt" in self.model else "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.2,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                logger.error(f"OpenAI API error: {resp.text}")
                return None

            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            return extract_json_from_llm(content)

    async def _call_openai_text(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        expect_json: bool = False
    ) -> Optional[Any]:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})
        messages.append({"role": "user", "content": prompt})

        payload: Dict[str, Any] = {
            "model": self.model if "gpt" in self.model else "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.4
        }
        if expect_json:
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            resp = await client.post(url, headers=headers, json=payload)
            if resp.status_code != 200:
                return None

            content = resp.json()["choices"][0]["message"]["content"]
            if expect_json:
                return extract_json_from_llm(content)
            return content.strip()


ai_service = AIService()
