from langchain_ollama import OllamaEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import (
    PyPDFLoader,
    Docx2txtLoader,
    UnstructuredMarkdownLoader,
    TextLoader,
    CSVLoader,
    UnstructuredExcelLoader,
    UnstructuredPowerPointLoader,
    UnstructuredHTMLLoader
)
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.document import DocumentChunk
from app.core.config import settings
import logging
from pathlib import Path
import uuid
import datetime
from io import BytesIO
import asyncio
import tempfile
import os

logger = logging.getLogger(__name__)

# Lazy initialization - create only when needed
_text_splitter = None
_embeddings_model = None

# Configuration for optimal accuracy
CHUNK_SIZE = 1000  # Characters per chunk
CHUNK_OVERLAP = 200  # Overlap between chunks for context continuity
BATCH_SIZE = 200  # Process embeddings in batches
MAX_RETRIES = 3  # Retry failed batches

# Document loader mapping for different file types
LOADER_MAPPING = {
    '.pdf': PyPDFLoader,
    '.docx': Docx2txtLoader,
    '.doc': Docx2txtLoader,
    '.md': UnstructuredMarkdownLoader,
    '.txt': TextLoader,
    '.csv': CSVLoader,
    '.xlsx': UnstructuredExcelLoader,
    '.xls': UnstructuredExcelLoader,
    '.pptx': UnstructuredPowerPointLoader,
    '.ppt': UnstructuredPowerPointLoader,
    '.html': UnstructuredHTMLLoader,
    '.htm': UnstructuredHTMLLoader
}

def get_text_splitter():
    """Lazy load text splitter with recursive character splitting."""
    global _text_splitter
    if _text_splitter is None:
        _text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
            length_function=len,
            is_separator_regex=False,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    return _text_splitter

def get_embeddings_model():
    """Lazy load embeddings model (singleton)."""
    global _embeddings_model
    if _embeddings_model is None:
        _embeddings_model = OllamaEmbeddings(
            model=settings.embedding_model,
            base_url=settings.ollama_base_url
        )
    return _embeddings_model

def get_document_loader(file_path: str, file_extension: str):
    """Get appropriate LangChain document loader based on file type."""
    loader_class = LOADER_MAPPING.get(file_extension.lower())
    if not loader_class:
        raise ValueError(f"Unsupported file type: {file_extension}")
    return loader_class(file_path)

async def ingest_file(
    db: AsyncSession,
    file_bytes: bytes,
    doc_id: str,
    filename: str,
    save_file: bool = True  # ← Option to save file
) -> int:
    """
    Parse document with LangChain loaders, chunk it, create embeddings, and store in DB.
    Uses optimized LangChain document loaders for better RAG performance.
    Optionally saves the original file to disk.
    """
    temp_file_path = None
    try:
        # Get file extension
        file_extension = Path(filename).suffix.lower()

        # Create temporary file for LangChain loaders (they need file paths)
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_extension) as temp_file:
            temp_file.write(file_bytes)
            temp_file_path = temp_file.name

        # Optionally save file to uploads folder
        if save_file:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            file_path = settings.upload_dir / f"{timestamp}_{doc_id}_{filename}"
            file_path.write_bytes(file_bytes)
            logger.info(f"Saved file to {file_path}")

        # Delete existing chunks for this doc_id
        await db.execute(
            delete(DocumentChunk).where(DocumentChunk.doc_id == doc_id)
        )
        await db.commit()

        # Load document using appropriate LangChain loader
        logger.info(f"Loading document with LangChain: {filename}")
        loader = get_document_loader(temp_file_path, file_extension)
        documents = loader.load()

        if not documents:
            raise ValueError("No content extracted from document")

        logger.info(f"Loaded {len(documents)} document(s)")

        # Extract text from LangChain documents
        full_text = "\n\n".join([doc.page_content for doc in documents])

        if not full_text or not full_text.strip():
            raise ValueError("No text extracted from document")

        # Split text into chunks using RecursiveCharacterTextSplitter
        logger.info(f"Splitting text into chunks (size={CHUNK_SIZE}, overlap={CHUNK_OVERLAP})")
        text_splitter = get_text_splitter()

        # Use split_documents for better metadata preservation
        text_documents = text_splitter.create_documents([full_text])
        chunk_texts = [doc.page_content for doc in text_documents]

        if not chunk_texts:
            raise ValueError("No chunks generated from document")

        logger.info(f"Generated {len(chunk_texts)} chunks")

        # Create embeddings in batches for efficiency
        logger.info(f"Creating embeddings for {len(chunk_texts)} chunks (batch_size={BATCH_SIZE})")
        embeddings = []
        embeddings_model = get_embeddings_model()

        # Process in batches
        for batch_start in range(0, len(chunk_texts), BATCH_SIZE):
            batch_end = min(batch_start + BATCH_SIZE, len(chunk_texts))
            batch_texts = chunk_texts[batch_start:batch_end]

            logger.info(f"Processing batch {batch_start//BATCH_SIZE + 1}/{(len(chunk_texts) + BATCH_SIZE - 1)//BATCH_SIZE} (chunks {batch_start+1}-{batch_end})")

            # Retry logic for batch processing
            for attempt in range(MAX_RETRIES):
                try:
                    # Batch embedding using aembed_documents
                    batch_embeddings = await embeddings_model.aembed_documents(batch_texts)
                    embeddings.extend(batch_embeddings)
                    logger.info(f"✓ Batch {batch_start//BATCH_SIZE + 1} completed ({len(batch_embeddings)} embeddings)")
                    break  # Success, exit retry loop

                except Exception as e:
                    if attempt < MAX_RETRIES - 1:
                        logger.warning(f"Batch failed (attempt {attempt + 1}/{MAX_RETRIES}): {str(e)[:100]}")
                        logger.info(f"Retrying batch in 2 seconds...")
                        await asyncio.sleep(2)
                    else:
                        # On final failure, try processing batch items individually
                        logger.error(f"Batch failed after {MAX_RETRIES} attempts, processing individually...")
                        for idx, text in enumerate(batch_texts):
                            try:
                                embedding = await embeddings_model.aembed_query(text)
                                embeddings.append(embedding)
                            except Exception as ind_e:
                                logger.warning(f"Chunk {batch_start + idx + 1} failed: {str(ind_e)[:50]}")
                                # Create zero embedding as placeholder for failed chunk
                                embeddings.append([0.0] * 768)

        if not embeddings:
            raise ValueError("No embeddings could be created")

        logger.info(f"Created {len(embeddings)} embeddings for {len(chunk_texts)} chunks")

        # Store chunks in database
        logger.info(f"Storing {len(embeddings)} chunks in database")
        db_chunks = []

        for idx, (chunk_text, embedding) in enumerate(zip(chunk_texts, embeddings)):
            try:
                chunk_metadata = {
                    "filename": filename,
                    "chunk_index": idx,
                    "chunk_size": len(chunk_text)
                }
                db_chunk = DocumentChunk(
                    doc_id=doc_id,
                    chunk_id=idx,
                    content=chunk_text,
                    embedding=embedding,
                    chunk_metadata=chunk_metadata
                )
                db_chunks.append(db_chunk)
            except Exception as e:
                logger.warning(f"Failed to prepare chunk {idx}: {e}")
                continue

        # Bulk insert for better performance
        if db_chunks:
            db.add_all(db_chunks)
            await db.commit()
            logger.info(f"Successfully ingested {len(db_chunks)}/{len(chunk_texts)} chunks")
            return len(db_chunks)
        else:
            logger.error("No chunks to store")
            return 0

    except Exception as e:
        await db.rollback()
        logger.error(f"Error during ingestion: {str(e)}")
        raise

    finally:
        # Clean up temporary file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except Exception as e:
                logger.warning(f"Failed to delete temp file: {e}")
