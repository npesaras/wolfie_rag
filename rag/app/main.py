from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import ingestion, query
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

app = FastAPI(
    title="RAG System API",
    description="FastAPI + Docling + PostgreSQL + LangChain + Gemini",
    version="1.0.0"
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
app.include_router(ingestion.router, prefix="/api/v1")
app.include_router(query.router, prefix="/api/v1")

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
