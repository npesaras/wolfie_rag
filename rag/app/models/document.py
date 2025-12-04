from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from pgvector.sqlalchemy import Vector
from app.core.db import Base

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    doc_id = Column(String(255), nullable=False, index=True)
    chunk_id = Column(Integer, nullable=False)
    content = Column(Text, nullable=False)
    embedding = Column(Vector(768))  # Gemini embedding dimension
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
