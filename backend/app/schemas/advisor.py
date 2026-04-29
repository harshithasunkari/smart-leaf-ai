import json
from typing import Any

from pydantic import BaseModel, Field, field_validator


class RecommendationRequest(BaseModel):
    disease: str
    crop: str
    soil: str
    land_area: float = Field(gt=0, le=100_000, description="Land area in hectares")
    stage: str


class RecommendationResponse(BaseModel):
    pesticide: str
    dosage: str
    spray_interval: str
    precautions: str


class HistorySaveRequest(BaseModel):
    user_id: int = Field(ge=0)
    image_path: str | None = None
    disease: str | None = None
    recommendation: dict[str, Any]

    @field_validator("recommendation", mode="before")
    @classmethod
    def coerce_rec(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v
