from functools import lru_cache
from pathlib import Path
from typing import ClassVar

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        protected_namespaces=()
    )

    # ROOT PROJECT FOLDER = smart-leaf-ai/backend
    BASE_DIR: ClassVar[Path] = Path(__file__).resolve().parent.parent.parent

    app_name: str = "Smart Leaf Advisor API"
    secret_key: str = "change-me-in-production-use-long-random-string-32chars"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    api_prefix: str = "/api"
    database_url: str = "sqlite:///./smart_leaf.db"

    upload_dir: Path = BASE_DIR / "uploads"
    max_upload_bytes: int = 100 * 1024 * 1024  # 15 MB
    allowed_extensions: frozenset[str] = frozenset(
        {"png", "jpg", "jpeg", "webp", "bmp"}
    )

    # MODEL PATH — supports both .keras and .h5
    model_path: Path = BASE_DIR / "models" / "final_model.keras"
    class_names_path: Path = BASE_DIR / "models" / "class_names.json"
    pesticide_rules_path: Path = BASE_DIR / "app" / "data" / "pesticide_rules.json"

    image_input_size: int = 224  # EfficientNetB0 default

    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]

    @field_validator("image_input_size")
    @classmethod
    def input_dim(cls, v: int) -> int:
        return v if 32 <= v <= 512 else 224

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_cors(cls, v):
        if isinstance(v, str):
            return [x.strip() for x in v.split(",") if x.strip()]
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()