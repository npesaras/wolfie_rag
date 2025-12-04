# Wolfie RAG - Complete Setup Guide

This repository contains a complete RAG (Retrieval Augmented Generation) system with automated Docker deployment.

## 🚀 Quick Start

### Prerequisites
- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Clerk account for authentication ([Get free account](https://clerk.com))

### One-Command Setup

```bash
chmod +x setup.sh
./setup.sh
```

This will:
1. ✅ Build all Docker images (frontend, backend, database, Ollama)
2. ✅ Start all services
3. ✅ Download required LLM models (llama3.2, nomic-embed-text)
4. ✅ Initialize database with pgvector
5. ✅ Set up file monitoring for automatic document processing

## 📋 Manual Setup (Alternative)

### 1. Configure Environment

Create a `.env` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
```

### 2. Start Services

```bash
# Build and start all services
docker compose up -d --build

# Pull Ollama models
docker exec rag-ollama ollama pull nomic-embed-text
docker exec rag-ollama ollama pull llama3.2
```

### 3. Add Documents

Place your documents in `./rag/data/source/`:
- Supported formats: PDF, DOCX, TXT, MD, CSV, XLSX, PPTX, HTML
- Files are automatically processed on backend startup
- Use watchdog for runtime updates

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐    ┌──────────────┐    ┌───────────┐ │
│  │   Frontend   │───▶│   Backend    │───▶│  Ollama   │ │
│  │  (Next.js)   │    │  (FastAPI)   │    │  (LLM)    │ │
│  │  Port: 3000  │    │  Port: 8001  │    │Port: 11434│ │
│  └──────────────┘    └──────┬───────┘    └───────────┘ │
│                              │                           │
│                       ┌──────▼───────┐                   │
│                       │  PostgreSQL  │                   │
│                       │  + pgvector  │                   │
│                       │  Port: 5432  │                   │
│                       └──────────────┘                   │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Services

### Frontend (Port 3000)
- Next.js 16 with App Router
- Clerk authentication
- Streaming chat interface
- Production-optimized build

### Backend (Port 8001)
- FastAPI with async support
- LangChain for RAG pipeline
- Auto-document processing
- File watchdog monitoring
- Health check endpoint: `/status`

### Database (Port 5432)
- PostgreSQL 17 with pgvector 0.8.1
- Automatic schema initialization
- Persistent storage with Docker volumes

### Ollama (Port 11434)
- Local LLM inference
- Models: llama3.2 (chat), nomic-embed-text (embeddings)
- GPU support (if available)

## 📂 Project Structure

```
wolfie_rag/
├── rag/                          # Backend
│   ├── Dockerfile                # Backend Docker image
│   ├── app/                      # FastAPI application
│   ├── data/
│   │   ├── source/              # 📥 Put your documents here
│   │   └── uploads/             # Runtime uploads
│   └── postgres/schema.sql      # Database schema
├── src/                          # Frontend
│   └── app/                     # Next.js App Router
├── Dockerfile                    # Frontend Docker image
├── docker-compose.yml           # Service orchestration
├── setup.sh                     # Automated setup script
└── .env                         # Environment variables
```

## 🔧 Configuration

### Environment Variables

**Frontend (.env)**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxx
CLERK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_API_URL=http://localhost:8001  # Optional
```

**Backend (configured in docker-compose.yml)**
```env
DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/rag_db
OLLAMA_BASE_URL=http://ollama:11434
EMBEDDING_MODEL=nomic-embed-text
CHAT_MODEL=llama3.2
```

### RAG Parameters

Edit `rag/app/services/rag.py`:
```python
# LLM Settings
temperature=0.2        # Response randomness (lower = more focused)
num_ctx=2048          # Context window size
num_predict=128       # Max tokens to generate
top_p=0.85            # Token sampling threshold

# Retrieval Settings
top_k=10              # Number of chunks to retrieve
similarity_threshold=0.25  # Minimum similarity score
```

### Chunking Settings

Edit `rag/app/services/ingestion.py`:
```python
chunk_size=1000       # Characters per chunk
chunk_overlap=200     # Overlap between chunks
BATCH_SIZE=200        # Embedding batch size
```

## 📊 Usage

### Check System Status

```bash
curl http://localhost:8001/status
```

### Query the RAG System

```bash
curl -X POST http://localhost:8001/api/v1/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is Computer Science?", "top_k": 5}'
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f ollama
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

## 🐛 Troubleshooting

### Backend not starting
```bash
# Check logs
docker compose logs backend

# Verify database connection
docker compose ps db
```

### Ollama models not found
```bash
# Pull models manually
docker exec rag-ollama ollama pull llama3.2
docker exec rag-ollama ollama pull nomic-embed-text

# List available models
docker exec rag-ollama ollama list
```

### Frontend build errors
```bash
# Rebuild frontend
docker compose build frontend --no-cache
docker compose up -d frontend
```

### Database issues
```bash
# Reset database (⚠️ deletes all data)
docker compose down -v
docker compose up -d
```

## 🔄 Updates & Maintenance

### Update Docker Images

```bash
# Pull latest base images
docker compose pull

# Rebuild with latest changes
docker compose up -d --build
```

### Add New Documents

1. Place files in `./rag/data/source/`
2. Restart backend: `docker compose restart backend`
3. Backend auto-processes all files on startup

### Clear Embeddings

The backend automatically clears old embeddings on startup. To manually reset:

```bash
docker exec rag-postgres psql -U postgres -d rag_db -c "TRUNCATE TABLE document_chunks;"
docker compose restart backend
```

## 🚢 Deployment to Another PC

### Export (on current PC)

```bash
# Save Docker images
docker save -o wolfie-rag-images.tar \
  rag-backend rag-frontend \
  pgvector/pgvector:pg17 ollama/ollama:latest

# Package repository
tar -czf wolfie-rag-repo.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=__pycache__ \
  --exclude=rag/data/uploads \
  .
```

### Import (on new PC)

```bash
# Load Docker images
docker load -i wolfie-rag-images.tar

# Extract repository
tar -xzf wolfie-rag-repo.tar.gz

# Run setup
chmod +x setup.sh
./setup.sh
```

**Or simply clone and run:**
```bash
git clone <repository-url>
cd wolfie_rag
chmod +x setup.sh
./setup.sh
```

## 📈 Performance Tips

1. **GPU Acceleration**: Enable GPU for Ollama (add `deploy.resources` in docker-compose.yml)
2. **Increase Resources**: Allocate more RAM/CPU to Docker Desktop
3. **Optimize Chunks**: Adjust `chunk_size` based on document complexity
4. **Batch Size**: Increase `BATCH_SIZE` for faster embedding on powerful systems
5. **Model Selection**: Use smaller models (qwen2.5:3b) for faster responses

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [LangChain](https://langchain.com) - RAG framework
- [Ollama](https://ollama.ai) - Local LLM inference
- [pgvector](https://github.com/pgvector/pgvector) - Vector similarity search
- [Next.js](https://nextjs.org) - Frontend framework
- [FastAPI](https://fastapi.tiangolo.com) - Backend framework
