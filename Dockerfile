FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install uv
RUN pip install uv

# Copy dependency files
COPY rag/pyproject.toml rag/uv.lock ./

# Install Python dependencies
RUN uv sync --frozen --no-install-project

# Copy application code
COPY rag/ ./

# Create data directories
RUN mkdir -p /app/data/uploads /app/data/source

# Expose port
EXPOSE 8000

# Default command (can be overridden in docker-compose)
CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]