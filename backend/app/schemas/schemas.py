from pydantic import BaseModel, Field, field_validator


def strict_email(email: str) -> str:
    e = (email or "").strip().lower()
    if "@" not in e or ".com" not in e:
        raise ValueError('Email must include "@" and ".com"')
    if len(e) < 6:
        raise ValueError("Email is too short")
    return e


class SignupRequest(BaseModel):
    email: str
    password: str = Field(min_length=6)
    full_name: str = ""

    @field_validator("full_name", mode="before")
    @classmethod
    def strip_name(cls, v):
        return (v or "").strip()

    @field_validator("email")
    @classmethod
    def email_ok(cls, v: str) -> str:
        return strict_email(v)


class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def email_ok(cls, v: str) -> str:
        return strict_email(v)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str


class PredictSingleOut(BaseModel):
    disease: str
    confidence_percent: float
    severity_level: str
    crop_name: str
    crop_stage: str


class PredictMultiOut(BaseModel):
    dominant_disease: str
    confidence_percent: float
    severity_level: str
    per_image: list[dict]


class RecommendIn(BaseModel):
    disease: str
    crop_type: str
    soil_type: str
    land_area_hectares: float = Field(gt=0, le=100_000)
    crop_stage: str


class RecommendOut(BaseModel):
    pesticide_name: str
    dosage: str
    spray_interval: str
    precautions: str
    if_pesticide_fails: str
    spray_interval_days: int


class ChatIn(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    language: str = "en"


class ChatOut(BaseModel):
    reply: str


class HistoryCaseOut(BaseModel):
    id: int
    case_type: str
    title: str
    payload: dict
    created_at: str
    updated_at: str
