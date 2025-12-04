#!/bin/bash

# Wolfie RAG - Complete Setup Script
# This script sets up everything needed to run the RAG system

set -e

echo "🐺 Wolfie RAG Setup Script"
echo "=========================="
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

print_status "Docker is installed"

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

print_status "Docker Compose is installed"

# Create .env file if it doesn't exist (optional - for overrides)
if [ ! -f .env ]; then
    print_status "Creating .env file for optional overrides..."
    cat > .env << EOF
# Optional: Override default backend settings
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/rag_db
# OLLAMA_BASE_URL=http://localhost:11434
# EMBEDDING_MODEL=nomic-embed-text
# CHAT_MODEL=llama3.2
EOF
    print_status ".env file created (optional overrides)"
else
    print_status ".env file exists"
fi

# Create necessary directories
print_status "Creating directories..."
mkdir -p rag/data/source
mkdir -p rag/data/uploads
touch rag/data/uploads/.gitkeep 2>/dev/null || true

# Build and start services
print_status "Building Docker images (this may take a few minutes)..."
docker compose build

print_status "Starting services..."
docker compose up -d

# Wait for services to be healthy
print_status "Waiting for services to be healthy..."
sleep 10

# Check if Ollama is healthy
echo ""
echo "Checking service health..."
if docker compose ps ollama | grep -q "healthy\|running"; then
    print_status "Ollama is running"

    # Pull required models
    print_status "Pulling Ollama models (this may take several minutes)..."
    docker exec rag-ollama ollama pull nomic-embed-text
    docker exec rag-ollama ollama pull llama3.2
    print_status "Models downloaded successfully"
else
    print_warning "Ollama is not healthy yet, models will be downloaded automatically"
fi

# Check backend
if docker compose ps backend | grep -q "healthy\|running"; then
    print_status "Backend API is running"
else
    print_warning "Backend is starting up..."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Services:"
echo "  🔌 Backend API:  http://localhost:8001"
echo "  🔌 API Docs:     http://localhost:8001/docs"
echo "  🗄️  Database:    postgresql://postgres:postgres@localhost:5432/rag_db"
echo "  🤖 Ollama:       http://localhost:11434"
echo ""
echo "Useful commands:"
echo "  View logs:        docker compose logs -f"
echo "  View backend:     docker compose logs -f backend"
echo "  Stop services:    docker compose down"
echo "  Restart services: docker compose restart"
echo "  View status:      docker compose ps"
echo ""
print_warning "Note: Place your documents in ./rag/data/source/ directory"
print_warning "The backend will automatically process them on startup"
echo ""
echo "Frontend Development:"
echo "  Run frontend separately: cd /path/to/project && npm run dev"
echo "  Frontend will connect to backend at http://localhost:8001"
