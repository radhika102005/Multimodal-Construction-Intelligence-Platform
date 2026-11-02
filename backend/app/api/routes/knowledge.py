"""
Construction Knowledge Assistant Route.
"""
from fastapi import APIRouter
from app.schemas.knowledge import KnowledgeRequest, KnowledgeResponse
from app.services.knowledge_service import knowledge_service

router = APIRouter(prefix="/api/v1/knowledge", tags=["Knowledge Assistant"])


@router.post("/ask", response_model=KnowledgeResponse)
async def ask_knowledge_assistant(req: KnowledgeRequest):
    """
    Answers construction methods, building standards (ACI, ASTM, OSHA, Eurocodes, IS Codes),
    material specifications, and provides QA/QC inspection checklists.
    """
    return await knowledge_service.ask_question(req)
