from docling.document_converter import DocumentConverter
from docling_core.transforms.chunker import HierarchicalChunker
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.document import DocumentChunk
from app.core.config import settings
import logging
from pathlib import Path
import uuid

logger = logging.getLogger(__name__)

# Initialize Docling and embeddings
converter = DocumentConverter()
chunker = HierarchicalChunker()
embeddings_model = GoogleGenerativeAIEmbeddings(
    model=settings.embedding_model,
    google_api_key=settings.google_api_key
)

async def ingest_file(
    db: AsyncSession,
    file_bytes: bytes,
    doc_id: str,
    filename: str,
    save_file: bool = True  # ← Option to save file
) -> int:
    """
    Parse document with Docling, chunk it, create embeddings, and store in DB.
    Optionally saves the original file to disk.
    """
    try:
        # Optionally save file to uploads folder
        if save_file:
            file_path = settings.upload_dir / f"{doc_id}_{filename}"
            file_path.write_bytes(file_bytes)
            logger.info(f"Saved file to {file_path}")

        # Delete existing chunks for this doc_id
        await db.execute(
            delete(DocumentChunk).where(DocumentChunk.doc_id == doc_id)
        )
        await db.commit()

        # Parse document with Docling
        logger.info(f"Parsing document: {filename}")
        result = converter.convert_single_bytes(file_bytes, filename=filename)
        doc = result.document

        # Chunk the document
        logger.info("Chunking document")
        chunks = list(chunker.chunk(doc))

        if not chunks:
            raise ValueError("No chunks generated from document")

        # Extract text from chunks
        chunk_texts = []
        for chunk in chunks:
            try:
                chunk_texts.append(chunk.text)
            except AttributeError as e:
                logger.warning(f"Failed to extract text from chunk: {e}")
                continue

        # Create embeddings for all chunks (batch)
        logger.info(f"Creating embeddings for {len(chunk_texts)} chunks")
        embeddings = await embeddings_model.aembed_documents(chunk_texts)

        # Store chunks in database
        logger.info("Storing chunks in database")
        for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            try:
                page = getattr(chunk.meta, 'page', None) if hasattr(chunk, 'meta') else None
                metadata = {
                    "filename": filename,
                    "page": page
                }
                db_chunk = DocumentChunk(
                    doc_id=doc_id,
                    chunk_id=idx,
                    content=chunk.text,
                    embedding=embedding,
                    metadata=metadata
                )
                db.add(db_chunk)
            except AttributeError as e:
                logger.warning(f"Failed to process chunk {idx}: {e}")
                continue

        await db.commit()
        logger.info(f"Successfully ingested {len(chunks)} chunks")

        return len(chunks)

    except Exception as e:
        await db.rollback()
        logger.error(f"Error during ingestion: {str(e)}")
        raise
