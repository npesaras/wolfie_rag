from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.db import get_db
from app.services.ingestion import ingest_file
from app.schemas.document import IngestResponse
import logging
from pathlib import Path
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ingest", tags=["ingestion"])

@router.post("", response_model=IngestResponse)
async def ingest_document(
    doc_id: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload and ingest a document:
    - Parses with Docling
    - Chunks the content
    - Creates embeddings
    - Stores in PostgreSQL with pgvector
    """
    try:
        # Validate file type
        allowed_types = [
            "application/pdf",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ]

        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"File type {file.content_type} not supported"
            )

        # Read file content
        content = await file.read()

        if len(content) == 0:
            raise HTTPException(status_code=400, detail="Empty file")

        # Ingest the file
        chunks_created = await ingest_file(
            db=db,
            file_bytes=content,
            doc_id=doc_id,
            filename=file.filename
        )

        return IngestResponse(
            status="success",
            doc_id=doc_id,
            chunks_created=chunks_created
        )

    except Exception as e:
        logger.error(f"Ingestion error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ingest-from-folder")
async def ingest_from_source_folder(
    db: AsyncSession = Depends(get_db)
):
    """
    Batch ingest all documents from the data/source folder.
    Useful for initial setup with pre-existing documents.
    """
    source_dir = settings.source_dir

    if not source_dir.exists():
        raise HTTPException(
            status_code=404,
            detail=f"Source directory not found: {source_dir}"
        )

    results = []
    allowed_extensions = tuple(settings.allowed_extensions)

    for file_path in source_dir.glob("*"):
        if not file_path.suffix.lower() in allowed_extensions:
            continue

        try:
            logger.info(f"Processing {file_path.name}")

            # Read file
            file_bytes = file_path.read_bytes()

            # Use filename (without extension) as doc_id
            doc_id = file_path.stem

            # Ingest
            chunks_created = await ingest_file(
                db=db,
                file_bytes=file_bytes,
                doc_id=doc_id,
                filename=file_path.name,
                save_file=False  # Already on disk
            )

            results.append({
                "filename": file_path.name,
                "doc_id": doc_id,
                "status": "success",
                "chunks_created": chunks_created
            })

        except Exception as e:
            logger.error(f"Error processing {file_path.name}: {str(e)}")
            results.append({
                "filename": file_path.name,
                "status": "error",
                "error": str(e)
            })

    return {
        "total_files": len(results),
        "results": results
    }

@router.get("/source-files")
async def list_source_files():
    """List all files available in the source folder"""
    source_dir = settings.source_dir

    if not source_dir.exists():
        return {"files": []}

    files = []
    for file_path in source_dir.glob("*"):
        if file_path.is_file():
            files.append({
                "filename": file_path.name,
                "size_bytes": file_path.stat().st_size,
                "extension": file_path.suffix
            })

    return {
        "source_directory": str(source_dir),
        "total_files": len(files),
        "files": files
    }
