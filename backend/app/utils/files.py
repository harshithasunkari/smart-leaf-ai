import uuid
from datetime import datetime, timezone
from pathlib import Path

from fastapi import UploadFile
from PIL import Image

from app.core.config import get_settings


def allowed_extension(filename: str) -> bool:
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in get_settings().allowed_extensions


async def save_upload(file: UploadFile) -> Path:
    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    if not allowed_extension(file.filename or ""):
        raise ValueError("Invalid file type")
    raw = await file.read()
    if len(raw) > settings.max_upload_bytes:
        raise ValueError("File too large")
    ext = (file.filename or "img.jpg").rsplit(".", 1)[-1].lower()
    name = f"{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.{ext}"
    path = settings.upload_dir / name
    path.write_bytes(raw)
    try:
        with Image.open(path) as im:
            im.verify()
    except Exception as e:
        path.unlink(missing_ok=True)
        raise ValueError("Invalid image file") from e
    return path


async def validate_image_bytes(file: UploadFile) -> None:
    raw = await file.read()
    await file.seek(0)
    if len(raw) > get_settings().max_upload_bytes:
        raise ValueError("File too large")
    try:
        from io import BytesIO

        with Image.open(BytesIO(raw)) as im:
            im.verify()
    except Exception as e:
        raise ValueError("Invalid image file") from e
