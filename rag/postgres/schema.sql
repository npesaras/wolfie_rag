-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Document chunks table
CREATE TABLE IF NOT EXISTS document_chunks (
    id SERIAL PRIMARY KEY,
    doc_id VARCHAR(255) NOT NULL,
    chunk_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768),  -- Gemini embedding dimension
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doc_id, chunk_id)
);

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS embedding_idx ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index for doc_id lookups
CREATE INDEX IF NOT EXISTS doc_id_idx ON document_chunks(doc_id);
