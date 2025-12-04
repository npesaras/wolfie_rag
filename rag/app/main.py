from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api.v1 import ingestion, query
from app.core.db import get_db
from app.services.ingestion import ingest_file
from app.core.config import settings
import logging
import asyncio
import os
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import threading

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

class DataFileHandler(FileSystemEventHandler):
    """Handle file system events for the data directory."""

    def __init__(self, data_dir: Path):
        self.data_dir = data_dir
        self.source_dir = data_dir / "source"
        self.uploads_dir = data_dir / "uploads"
        self.processing_files = set()  # Track files being processed

    def on_created(self, event):
        """Called when a file is created in the watched directory."""
        if event.is_directory:
            return

        file_path = Path(event.src_path)

        # Skip files in source and uploads directories
        if self.source_dir in file_path.parents or self.uploads_dir in file_path.parents:
            return

        # Skip if file is already being processed
        if file_path in self.processing_files:
            return

        # Check if file extension is allowed
        if file_path.suffix.lower() not in settings.allowed_extensions:
            logger.info(f"Skipping file {file_path.name}: unsupported extension")
            return

        # Check file size
        try:
            file_size = file_path.stat().st_size
            if file_size > settings.max_file_size:
                logger.warning(f"Skipping file {file_path.name}: too large ({file_size} bytes)")
                return
        except OSError:
            return

        # Process the file asynchronously
        logger.info(f"New file detected: {file_path.name}")
        self.processing_files.add(file_path)

        # Run processing in a separate thread to avoid blocking
        threading.Thread(
            target=self._process_file_sync,
            args=(file_path,),
            daemon=True
        ).start()

    def _process_file_sync(self, file_path: Path):
        """Process a file synchronously (called from thread)."""
        try:
            # Create new event loop for async operations
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)

            # Run the async processing
            loop.run_until_complete(self._process_file_async(file_path))

        except Exception as e:
            logger.error(f"Error processing file {file_path.name}: {e}")
        finally:
            self.processing_files.discard(file_path)
            try:
                loop.close()
            except:
                pass

    async def _process_file_async(self, file_path: Path):
        """Process a file asynchronously."""
        try:
            # Get database session
            async for db in get_db():
                # Read file
                file_bytes = file_path.read_bytes()

                # Generate doc_id from filename
                doc_id = file_path.stem

                # Ingest file (save to uploads since it's from data dir)
                chunks_count = await ingest_file(
                    db=db,
                    file_bytes=file_bytes,
                    doc_id=doc_id,
                    filename=file_path.name,
                    save_file=True  # Save to uploads
                )

                logger.info(f"Auto-processed {chunks_count} chunks from {file_path.name}")
                break  # Exit the async for loop

        except Exception as e:
            logger.error(f"Failed to process {file_path.name}: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle application startup and shutdown events."""
    # Startup: Process source files and start file watcher
    logger.info("Starting background processing of source files...")
    asyncio.create_task(process_source_files())

    # Start file watcher for data directory
    logger.info("Starting file watcher for data directory...")
    observer = Observer()
    data_dir = Path(settings.data_dir)
    event_handler = DataFileHandler(data_dir)
    observer.schedule(event_handler, str(data_dir), recursive=True)
    observer.start()

    yield

    # Shutdown: Stop file watcher and clean up
    logger.info("Stopping file watcher...")
    observer.stop()
    observer.join()
    logger.info("Shutting down RAG API...")

async def clear_all_embeddings():
    """Clear all embeddings from database on startup for fresh training."""
    logger.info("🔄 Clearing all existing embeddings from database...")
    try:
        async for db in get_db():
            from sqlalchemy import text
            await db.execute(text("TRUNCATE TABLE document_chunks;"))
            await db.commit()
            logger.info("✓ Database cleared successfully")
            break
    except Exception as e:
        logger.error(f"Failed to clear database: {e}")
        raise

async def process_source_files():
    """Process all files in the source directory on startup."""
    # Clear all old embeddings first for fresh training
    await clear_all_embeddings()

    source_dir = Path(settings.source_dir)
    if not source_dir.exists():
        logger.warning(f"Source directory {source_dir} does not exist")
        return

    # Get list of files to process
    files_to_process = [
        f for f in source_dir.iterdir()
        if f.is_file() and f.suffix.lower() in settings.allowed_extensions
    ]

    if not files_to_process:
        logger.info("No files to process in source directory")
        return

    logger.info(f"📚 Starting fresh training with {len(files_to_process)} files")

    # Get database session
    async for db in get_db():
        try:
            total_chunks = 0
            successful_files = 0

            # Process each file in source directory
            for file_path in files_to_process:
                try:
                    logger.info(f"Processing: {file_path.name}")

                    # Read file
                    file_bytes = file_path.read_bytes()

                    # Generate doc_id from filename
                    doc_id = file_path.stem

                    # Ingest file (don't save again since it's already in source)
                    chunks_count = await ingest_file(
                        db=db,
                        file_bytes=file_bytes,
                        doc_id=doc_id,
                        filename=file_path.name,
                        save_file=False  # Don't save to uploads since it's source
                    )

                    total_chunks += chunks_count
                    successful_files += 1
                    logger.info(f"✓ {file_path.name}: {chunks_count} chunks")

                except Exception as e:
                    logger.error(f"✗ {file_path.name}: {str(e)[:100]}")
                    continue  # Continue with next file on error

            logger.info(f"✅ Fresh training complete: {successful_files}/{len(files_to_process)} files, {total_chunks} total chunks")
            logger.info(f"📊 System ready - Watchdog will monitor for file updates")

        except Exception as e:
            logger.error(f"Error processing source files: {e}")
        finally:
            break  # Exit the async for loop after one iteration

app = FastAPI(
    title="RAG System API",
    description="FastAPI + Docling + PostgreSQL + LangChain + Ollama",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ingestion, prefix="/api/v1")
app.include_router(query, prefix="/api/v1")

@app.get("/")
async def root():
    return {
        "message": "RAG System API",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/status")
async def status():
    """Get system status including document counts."""
    from sqlalchemy import text
    try:
        async for db in get_db():
            # Get document counts
            result = await db.execute(
                text("SELECT doc_id, COUNT(*) as chunks FROM document_chunks GROUP BY doc_id ORDER BY doc_id")
            )
            docs = [{"doc_id": row[0], "chunks": row[1]} for row in result.fetchall()]

            # Get total chunks
            total_result = await db.execute(
                text("SELECT COUNT(*) FROM document_chunks")
            )
            total_chunks = total_result.scalar()

            return {
                "status": "healthy",
                "documents": len(docs),
                "total_chunks": total_chunks,
                "documents_detail": docs
            }
    except Exception as e:
        logger.error(f"Status check failed: {e}")
        return {"status": "error", "message": str(e)}
