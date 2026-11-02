"""
Schemas for Daily Site Assistant conversational module.
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_history: List[ChatMessage] = Field(default_factory=list)
    site_context: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    suggested_followups: List[str] = []
    safety_tips: List[str] = []
    relevant_standards_hint: Optional[str] = None
    timestamp: str
    is_simulated: bool = False
