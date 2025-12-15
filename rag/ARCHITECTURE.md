# Wolfie RAG System Architecture

## System Overview

This document describes the architecture of the Wolfie RAG (Retrieval-Augmented Generation) system, which combines document processing, vector search, and LLM-powered question answering.

## Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[Next.js Frontend<br/>Wolfie Chat UI]
    end

    subgraph "API Layer - FastAPI Backend"
        API[FastAPI Server<br/>Port 8000]
        IngestAPI[Ingestion API<br/>/api/v1/ingest]
        QueryAPI[Query API<br/>/api/v1/query]
        API --> IngestAPI
        API --> QueryAPI
    end

    subgraph "Service Layer"
        IngestService[Ingestion Service<br/>Document Processing]
        RAGService[RAG Service<br/>Question Answering]
    end

    subgraph "Document Processing Pipeline"
        Loader[LangChain Loaders<br/>PyPDF, Docx, Markdown, etc.]
        Splitter[Text Splitter<br/>Chunk Size: 1000<br/>Overlap: 200]
        EmbedGen[Embedding Generator<br/>Ollama nomic-embed-text]
    end

    subgraph "Storage Layer"
        DB[(PostgreSQL + pgvector<br/>Vector Database)]
        Uploads[/data/uploads/<br/>File Storage]
        Source[/data/source/<br/>Source Documents]
    end

    subgraph "AI Layer"
        Ollama[Ollama Service<br/>Port 11434]
        EmbedModel[Embedding Model<br/>nomic-embed-text]
        ChatModel[Chat Model<br/>llama3.2]
        Ollama --> EmbedModel
        Ollama --> ChatModel
    end

    subgraph "File Monitoring"
        Watchdog[Watchdog<br/>File System Monitor]
    end

    %% Frontend to API
    UI -->|HTTP POST /ingest| IngestAPI
    UI -->|HTTP POST /query| QueryAPI

    %% Ingestion Flow
    IngestAPI -->|Process Document| IngestService
    IngestService --> Loader
    Loader --> Splitter
    Splitter --> EmbedGen
    EmbedGen -->|Request Embeddings| EmbedModel
    EmbedModel -->|Return Vectors| EmbedGen
    EmbedGen -->|Store Chunks + Vectors| DB
    IngestService -->|Save Original File| Uploads

    %% Query Flow
    QueryAPI -->|Answer Question| RAGService
    RAGService -->|1. Embed Question| EmbedModel
    EmbedModel -->|Return Query Vector| RAGService
    RAGService -->|2. Vector Search<br/>Cosine Similarity| DB
    DB -->|Return Top-K Chunks| RAGService
    RAGService -->|3. Generate Answer<br/>with Context| ChatModel
    ChatModel -->|Return Answer| RAGService
    RAGService -->|Response + Sources| QueryAPI
    QueryAPI -->|JSON Response| UI

    %% File Monitoring
    Source -.->|Monitor Changes| Watchdog
    Watchdog -.->|Auto-trigger| IngestService

    style UI fill:#e1f5ff
    style API fill:#fff4e1
    style IngestAPI fill:#fff4e1
    style QueryAPI fill:#fff4e1
    style IngestService fill:#f0f8ff
    style RAGService fill:#f0f8ff
    style DB fill:#e8f5e9
    style Ollama fill:#fce4ec
    style EmbedModel fill:#fce4ec
    style ChatModel fill:#fce4ec
    style Loader fill:#f3e5f5
    style Splitter fill:#f3e5f5
    style EmbedGen fill:#f3e5f5
```

## System Flow

### 1. Document Ingestion Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant IngestAPI
    participant IngestService
    participant Loader
    participant Splitter
    participant Ollama
    participant Database

    User->>Frontend: Upload Document
    Frontend->>IngestAPI: POST /api/v1/ingest<br/>(file + doc_id)
    IngestAPI->>IngestService: ingest_file()
    
    IngestService->>Loader: Load document by type<br/>(PDF/DOCX/MD/etc)
    Loader-->>IngestService: Extracted text
    
    IngestService->>Splitter: Split into chunks<br/>(1000 chars, 200 overlap)
    Splitter-->>IngestService: Text chunks[]
    
    loop For each chunk
        IngestService->>Ollama: Generate embedding<br/>(nomic-embed-text)
        Ollama-->>IngestService: Vector embedding
        IngestService->>Database: Store chunk + vector<br/>(pgvector)
    end
    
    IngestService-->>IngestAPI: chunks_created count
    IngestAPI-->>Frontend: Success response
    Frontend-->>User: Document indexed!
```

### 2. Query & Answer Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant QueryAPI
    participant RAGService
    participant Ollama
    participant Database

    User->>Frontend: Ask question
    Frontend->>QueryAPI: POST /api/v1/query<br/>{question, top_k}
    QueryAPI->>RAGService: answer_question()
    
    RAGService->>Ollama: Embed question<br/>(nomic-embed-text)
    Ollama-->>RAGService: Query vector
    
    RAGService->>Database: Vector similarity search<br/>(cosine distance)
    Database-->>RAGService: Top-K similar chunks
    
    RAGService->>RAGService: Build prompt with<br/>question + context
    RAGService->>Ollama: Generate answer<br/>(llama3.2)
    Ollama-->>RAGService: Generated response
    
    RAGService-->>QueryAPI: answer + sources[]
    QueryAPI-->>Frontend: JSON response
    Frontend-->>User: Display answer
```

## Component Details

### Frontend Layer
- **Technology**: Next.js 16 with TypeScript
- **Location**: `/src/app/wolfie`
- **Features**:
  - File upload with drag-and-drop
  - Real-time chat interface
  - Document processing progress indicators
  - Source citation display

### API Layer
- **Technology**: FastAPI 0.123.5
- **Port**: 8000
- **Endpoints**:
  - `POST /api/v1/ingest` - Document ingestion
  - `POST /api/v1/query` - Question answering
  - `POST /api/v1/ingest-from-folder` - Batch ingestion
- **Features**:
  - CORS enabled for cross-origin requests
  - Async request handling
  - File type validation
  - Error handling and logging

### Document Processing Pipeline
1. **Loaders** (LangChain Community)
   - PyPDFLoader (with OCR support via Unstructured)
   - Docx2txtLoader
   - UnstructuredMarkdownLoader
   - CSVLoader, UnstructuredExcelLoader
   - UnstructuredPowerPointLoader, UnstructuredHTMLLoader

2. **Text Splitter**
   - Type: RecursiveCharacterTextSplitter
   - Chunk size: 1000 characters
   - Overlap: 200 characters
   - Separators: `\n\n`, `\n`, `. `, space

3. **Embedding Generation**
   - Model: nomic-embed-text (via Ollama)
   - Batch processing: 200 documents
   - Max retries: 3

### Storage Layer
- **Database**: PostgreSQL 17 with pgvector extension
- **Schema**:
  - Table: `document_chunks`
  - Columns: id, doc_id, chunk_id, content, embedding (vector), chunk_metadata
- **Vector Operations**: Cosine similarity search (`<=>` operator)

### AI Layer
- **Ollama Service**: Port 11434
- **Embedding Model**: nomic-embed-text
- **Chat Model**: llama3.2
  - Temperature: 0.2 (focused responses)
  - Context: 2048 tokens
  - Max predict: 128 tokens

### File Monitoring
- **Technology**: Watchdog library
- **Monitored Directories**:
  - `/data/source` - Auto-ingestion of new documents
  - `/data/uploads` - User-uploaded files
- **Features**:
  - Automatic file processing on creation
  - File size validation (max 10MB)
  - Extension filtering

## Data Flow Summary

1. **Ingestion**: Document → Parse → Chunk → Embed → Store in pgvector
2. **Retrieval**: Question → Embed → Vector Search → Get Top-K chunks
3. **Generation**: Question + Context → LLM → Answer
4. **Response**: Answer + Sources → User

## Configuration

Key settings in `.env`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/rag_db
OLLAMA_BASE_URL=http://localhost:11434
EMBEDDING_MODEL=nomic-embed-text
CHAT_MODEL=llama3.2
CHUNK_SIZE=1000
CHUNK_OVERLAP=200
TOP_K_RESULTS=5
```

## Deployment

### Prerequisites
- Docker & Docker Compose (PostgreSQL + Ollama)
- Node.js 18+ & pnpm (Frontend)
- Python 3.12+ & uv (Backend)

### Services
```bash
# Start infrastructure
docker-compose up -d

# Start RAG backend
cd rag && uv run uvicorn app.main:app --reload --port 8000

# Start frontend
pnpm dev
```

## Performance Considerations

- **Embedding Generation**: Batched processing (200 docs) to optimize throughput
- **Vector Search**: Indexed with pgvector for fast cosine similarity
- **LLM Generation**: Reduced context window and temperature for faster responses
- **Connection Pooling**: AsyncPG with connection pooling for database
- **Lazy Loading**: Models initialized on first use to reduce startup time

## Security

- File type validation on upload
- File size limits (10MB default)
- CORS configuration for production
- Environment-based configuration
- SQL injection prevention with parameterized queries
