from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path

class Settings(BaseSettings):
    # Database
    database_url: str

    # Ollama settings
    ollama_base_url: str

    # Model settings
    embedding_model: str = "nomic-embed-text"
    chat_model: str = "llama3.2"

    # RAG settings
    chunk_size: int = 1000
    chunk_overlap: int = 200
    top_k_results: int = 5

    # Data directories
    data_dir: Path = Path("/app/data")
    upload_dir: Path = Path("/app/data/uploads")
    source_dir: Path = Path("/app/data/source")

    # File settings
    allowed_extensions: list = [".pdf", ".docx", ".pptx", ".html", ".md", ".csv", ".xlsx"]
    max_file_size: int = 10 * 1024 * 1024  # 10MB

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Create directories if they don't exist
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        self.source_dir.mkdir(parents=True, exist_ok=True)

settings = Settings()
