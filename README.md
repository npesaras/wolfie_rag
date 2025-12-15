# Wolfie RAG

A Next.js application with RAG (Retrieval-Augmented Generation) capabilities, featuring document processing, Appwrite storage integration, and Clerk authentication.

## Tech Stack

- **Frontend**: Next.js 16 with TypeScript
- **Backend**: FastAPI Python service
- **Database**: PostgreSQL with pgvector extension
- **LLM**: Ollama (llama3.2, nomic-embed-text)
- **Auth**: Clerk
- **Storage**: Appwrite
- **Package Managers**: pnpm (Node.js), uv (Python)

## Prerequisites

- Node.js 18+ and pnpm
- Python 3.12+
- Docker and Docker Compose
- [uv](https://github.com/astral-sh/uv) - Fast Python package installer

## Getting Started

### 1. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-publishable-key
CLERK_SECRET_KEY=your-clerk-secret-key

# Appwrite Configuration
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://sfo.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_PROSPECTUS_BUCKET_ID=your-bucket-id
APPWRITE_API_KEY=your-api-key

# Database (for Python backend)
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/rag_db
OLLAMA_BASE_URL=http://localhost:11434
EMBEDDING_MODEL=nomic-embed-text
CHAT_MODEL=llama3.2
```

### 2. Start Infrastructure with Docker Compose

Start PostgreSQL and Ollama services:

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL with pgvector extension on port 5432
- Start Ollama and automatically pull `nomic-embed-text` and `llama3.2` models on port 11434
- Create necessary volumes for data persistence

Check services are running:
```bash
docker-compose ps
```

### 3. Install uv (Python Package Manager)

Install uv if you haven't already:

```bash
# On macOS/Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Or with pip
pip install uv
```

### 4. Set Up Python Backend (RAG Service)

Navigate to the RAG directory and set up Python environment:

```bash
cd rag

# Create virtual environment
uv venv

# Activate virtual environment
# On Linux/macOS:
source .venv/bin/activate
# On Windows:
.venv\Scripts\activate

# Install dependencies
uv sync

# Run the FastAPI server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The RAG API will be available at http://localhost:8000

### 5. Install Frontend Dependencies

In a new terminal, from the project root:

```bash
pnpm install
```

### 6. Run Next.js Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
wolfie_rag/
├── src/                    # Next.js frontend
│   ├── app/               # App router pages
│   │   ├── prospectus/   # Prospectus download pages
│   │   ├── resources/    # CCS resources download
│   │   └── wolfie/       # AI chat interface
│   ├── components/        # React components
│   └── lib/              # Utilities
├── rag/                   # Python RAG backend
│   ├── app/              # FastAPI application
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Configuration
│   │   ├── models/      # Database models
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Business logic
│   ├── data/            # Document storage
│   └── postgres/        # Database schema
└── docker-compose.yml    # Infrastructure setup
```

## Development Commands

### Frontend (Next.js)
```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run linter
```

### Backend (Python RAG)
```bash
cd rag
uv sync           # Install/update dependencies
uv run uvicorn app.main:app --reload  # Start dev server
uv run python -m pytest                # Run tests
```

### Docker Services
```bash
docker-compose up -d      # Start all services
docker-compose down       # Stop all services
docker-compose logs -f    # View logs
docker-compose ps         # Check status
```

## Features

- **Wolfie Chat**: AI-powered chat using RAG with Ollama
- **Document Processing**: Upload and process PDFs, DOCX files
- **Prospectus Downloads**: Download program prospectuses from Appwrite Storage
- **CCS Resources**: Download institutional forms and documents
- **Authentication**: Secure access with Clerk
- **Responsive Design**: Works on desktop and mobile

## API Documentation

Once the RAG service is running, visit:
- FastAPI Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Troubleshooting

### Ollama models not loading
```bash
docker exec -it rag-ollama ollama pull nomic-embed-text
docker exec -it rag-ollama ollama pull llama3.2
```

### Database connection issues
```bash
docker-compose restart db
docker-compose logs db
```

### Port conflicts
Make sure ports 3000, 8000, 5432, and 11434 are available.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [uv Documentation](https://github.com/astral-sh/uv)
- [Ollama Documentation](https://ollama.ai/)
- [Appwrite Documentation](https://appwrite.io/docs)
