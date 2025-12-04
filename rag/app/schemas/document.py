from pydantic import BaseModel
from typing import Optional, List

class IngestRequest(BaseModel):
    doc_id: str

class IngestResponse(BaseModel):
    status: str
    doc_id: str
    chunks_created: int

class QueryRequest(BaseModel):
    question: str
    top_k: Optional[int] = 5

class SourceChunk(BaseModel):
    doc_id: str
    chunk_id: int
    content: str
    similarity: float

class QueryResponse(BaseModel):
    answer: str
    sources: List[SourceChunk]
