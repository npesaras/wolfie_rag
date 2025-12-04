from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.models.document import DocumentChunk
from app.core.config import settings
from app.schemas.document import SourceChunk
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)

# Initialize models
embeddings_model = GoogleGenerativeAIEmbeddings(
    model=settings.embedding_model,
    google_api_key=settings.google_api_key
)

chat_model = ChatGoogleGenerativeAI(
    model=settings.chat_model,
    google_api_key=settings.google_api_key,
    temperature=0.7
)

async def retrieve_chunks(
    db: AsyncSession,
    question: str,
    top_k: int = 5
) -> List[Tuple[DocumentChunk, float]]:
    """
    Retrieve most similar chunks using pgvector cosine similarity.
    Returns list of (chunk, similarity_score) tuples.
    """
    # Create embedding for the question
    question_embedding = await embeddings_model.aembed_query(question)

    # Query using pgvector cosine similarity
    query = text("""
        SELECT
            id, doc_id, chunk_id, content, metadata,
            1 - (embedding <=> :query_embedding) as similarity
        FROM document_chunks
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> :query_embedding
        LIMIT :top_k
    """)

    result = await db.execute(
        query,
        {"query_embedding": question_embedding, "top_k": top_k}
    )

    rows = result.fetchall()

    chunks_with_similarity = []
    for row in rows:
        chunk = DocumentChunk(
            id=row[0],
            doc_id=row[1],
            chunk_id=row[2],
            content=row[3],
            metadata=row[4]
        )
        similarity = row[5]
        chunks_with_similarity.append((chunk, similarity))

    return chunks_with_similarity

async def answer_question(
    db: AsyncSession,
    question: str,
    top_k: int = 5
) -> Tuple[str, List[SourceChunk]]:
    """
    Answer a question using RAG:
    1. Retrieve relevant chunks
    2. Build context
    3. Generate answer with Gemini

    Returns (answer, sources)
    """
    # Retrieve relevant chunks
    logger.info(f"Retrieving top {top_k} chunks for question")
    chunks_with_sim = await retrieve_chunks(db, question, top_k)

    if not chunks_with_sim:
        return "I don't have enough information to answer this question.", []

    # Build context from chunks
    context_parts = []
    sources = []

    for idx, (chunk, similarity) in enumerate(chunks_with_sim, 1):
        context_parts.append(f"[{idx}] {chunk.content}")
        sources.append(SourceChunk(
            doc_id=chunk.doc_id,
            chunk_id=chunk.chunk_id,
            content=chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content,
            similarity=float(similarity)
        ))

    context = "\n\n".join(context_parts)

    # Generate answer with Gemini
    prompt = f"""You are a helpful assistant that answers questions based on the provided context.

Context:
{context}

Question: {question}

Instructions:
- Answer the question using only information from the context above
- If the context doesn't contain enough information, say so
- Be concise and accurate
- Reference specific sources using [1], [2], etc. when applicable

Answer:"""

    logger.info("Generating answer with Gemini")
    response = await chat_model.ainvoke(prompt)
    answer = response.content

    return answer, sources
