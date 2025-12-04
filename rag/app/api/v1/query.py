from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.services.rag import answer_question
from app.schemas.document import QueryRequest, QueryResponse
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/query", tags=["query"])

@router.post("", response_model=QueryResponse)
async def query_rag(
    request: QueryRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Query the RAG system:
    - Embeds the question
    - Retrieves relevant chunks from pgvector
    - Generates answer with Gemini
    """
    try:
        if not request.question.strip():
            raise HTTPException(status_code=400, detail="Question cannot be empty")

        answer, sources = await answer_question(
            db=db,
            question=request.question,
            top_k=request.top_k or 10  # Increased default for better accuracy
        )

        return QueryResponse(
            answer=answer,
            sources=sources
        )

    except Exception as e:
        logger.error(f"Query error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
