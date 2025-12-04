from langchain_ollama import ChatOllama, OllamaEmbeddings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from app.models.document import DocumentChunk
from app.core.config import settings
from app.schemas.document import SourceChunk
from typing import List, Tuple
import logging
import time

logger = logging.getLogger(__name__)

# Lazy initialization for models (singleton pattern)
_embeddings_model = None
_chat_model = None

def get_embeddings_model():
    """Get or create embeddings model (singleton)."""
    global _embeddings_model
    if _embeddings_model is None:
        _embeddings_model = OllamaEmbeddings(
            model=settings.embedding_model,
            base_url=settings.ollama_base_url
        )
    return _embeddings_model

def get_chat_model():
    """Get or create chat model (singleton)."""
    global _chat_model
    if _chat_model is None:
        _chat_model = ChatOllama(
            model=settings.chat_model,
            base_url=settings.ollama_base_url,
            temperature=0.2,  # Lower temperature for faster, more focused responses
            num_ctx=2048,  # Reduced context for faster processing
            num_predict=128,  # Shorter responses to prevent timeouts
            top_p=0.85  # Focus on most likely tokens for faster generation
        )
    return _chat_model

async def retrieve_chunks(
    db: AsyncSession,
    question: str,
    top_k: int = 10  # Increased for better accuracy
) -> List[Tuple[DocumentChunk, float]]:
    """
    Retrieve most similar chunks using pgvector cosine similarity.
    Returns list of (chunk, similarity_score) tuples.
    """
    start_time = time.time()
    # Create embedding for the question
    embeddings_model = get_embeddings_model()
    question_embedding = await embeddings_model.aembed_query(question)
    embedding_time = time.time() - start_time
    logger.debug(f"Embedding: {embedding_time:.2f}s")  # Use debug level

    # Convert embedding list to pgvector format string
    embedding_str = str(question_embedding)

    # Query using pgvector cosine similarity
    search_start = time.time()
    query = text("""
        SELECT
            id, doc_id, chunk_id, content, chunk_metadata,
            1 - (embedding <=> CAST(:query_embedding AS vector)) as similarity
        FROM document_chunks
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> CAST(:query_embedding AS vector)
        LIMIT :top_k
    """)

    result = await db.execute(
        query,
        {"query_embedding": embedding_str, "top_k": top_k}
    )

    rows = result.fetchall()
    search_time = time.time() - search_start
    logger.debug(f"Search: {search_time:.2f}s")  # Use debug level

    # Build chunks more efficiently
    chunks_with_similarity = [
        (
            DocumentChunk(
                id=row[0],
                doc_id=row[1],
                chunk_id=row[2],
                content=row[3],
                chunk_metadata=row[4]
            ),
            row[5]  # similarity
        )
        for row in rows
    ]

    return chunks_with_similarity

async def answer_question(
    db: AsyncSession,
    question: str,
    top_k: int = 10  # Increased for better accuracy
) -> Tuple[str, List[SourceChunk]]:
    """
    Answer a question using RAG:
    1. Retrieve relevant chunks
    2. Build context
    3. Generate answer with Ollama

    Returns (answer, sources)
    """
    total_start = time.time()
    # Retrieve relevant chunks
    logger.info(f"Query: '{question[:50]}{'...' if len(question) > 50 else ''}' (top_k={top_k})")
    chunks_with_sim = await retrieve_chunks(db, question, top_k)

    if not chunks_with_sim:
        return "I don't have enough information to answer this question.", []

    # Filter chunks by similarity threshold (more inclusive for accuracy)
    similarity_threshold = 0.25  # Lower threshold for better recall
    relevant_chunks = [(chunk, sim) for chunk, sim in chunks_with_sim if sim >= similarity_threshold]

    if not relevant_chunks:
        return "I don't have enough information to answer this question.", []

    logger.info(f"Using {len(relevant_chunks)} chunks with similarity >= {similarity_threshold}")    # Build context from chunks
    context_parts = []
    sources = []

    for idx, (chunk, similarity) in enumerate(relevant_chunks, 1):
        context_parts.append(f"[{idx}] {chunk.content}")
        sources.append(SourceChunk(
            doc_id=chunk.doc_id,
            chunk_id=chunk.chunk_id,
            content=chunk.content[:200] + "..." if len(chunk.content) > 200 else chunk.content,
            similarity=float(similarity)
        ))

    context = "\n\n".join(context_parts)

    # Generate answer with Ollama
    prompt = f"""Context:
{context}

Question: {question}

Provide a concise, direct answer (2-3 sentences) using ONLY the context information. Be specific and accurate."""

    llm_start = time.time()
    chat_model = get_chat_model()
    response = await chat_model.ainvoke(prompt)
    llm_time = time.time() - llm_start

    answer = response.content
    total_time = time.time() - total_start

    logger.info(f"RAG complete: {total_time:.2f}s (LLM: {llm_time:.2f}s, {len(relevant_chunks)} chunks used)")

    return answer, sources
