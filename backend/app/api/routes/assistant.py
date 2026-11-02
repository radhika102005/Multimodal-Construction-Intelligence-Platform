"""
Daily Site Assistant Chat Route.
"""
from fastapi import APIRouter
from app.schemas.assistant import ChatRequest, ChatResponse
from app.services.assistant import daily_assistant_service

router = APIRouter(prefix="/api/v1/assistant", tags=["Daily Site Assistant"])


@router.post("/chat", response_model=ChatResponse)
async def chat_with_site_assistant(req: ChatRequest):
    """
    Field engineer assistant for concrete curing, slump tests, formwork stripping,
    waterproofing, site logistics, and OSHA toolbox talks.
    """
    return await daily_assistant_service.chat(req)
