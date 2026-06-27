"""
app/api/predict_routes.py
────────────────────────────────────────────────────────────────────────────────
FastAPI router for image-based disease detection + pesticide recommendation.

KEY FIXES vs the broken version
────────────────────────────────
1.  pesticide_service.recommend() is NOW called in every predict endpoint.
    Previously it was never invoked → pesticide fields were absent from response.

2.  dominant_raw_class (the raw ML string) is passed to pesticide_service,
    NOT the UI-display string. to_key() inside pesticide_service converts it
    to the correct JSON key.

3.  All three required pesticide fields are guaranteed in the response:
      pesticide_name, dosage, spray_interval

4.  Single-image route (/predict) also returns pesticide recommendation.

5.  Query parameters for crop_type, soil_type, land_area_hectares, crop_stage
    are added to both endpoints with safe defaults so the frontend can pass
    them progressively.
────────────────────────────────────────────────────────────────────────────────
"""

import os
import uuid
import logging
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from fastapi.responses import JSONResponse

from app.services.ml_service import ml_service
from app.services.pesticide_service import pesticide_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["predict"])

# ── Temp-file helpers ─────────────────────────────────────────────────────────

UPLOAD_DIR = Path("/tmp/crop_uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_SUFFIXES = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}


def _save_temp(upload: UploadFile) -> Path:
    suffix = Path(upload.filename or "img.jpg").suffix.lower()
    if suffix not in ALLOWED_SUFFIXES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{suffix}'. Allowed: {ALLOWED_SUFFIXES}",
        )
    dest = UPLOAD_DIR / f"{uuid.uuid4().hex}{suffix}"
    dest.write_bytes(upload.file.read())
    return dest


def _cleanup(*paths: Path) -> None:
    for p in paths:
        try:
            if p.exists():
                p.unlink()
        except Exception:
            pass


# ── Shared pesticide helper ───────────────────────────────────────────────────

def _get_pesticide(
    raw_class: str,
    crop_type: str,
    soil_type: str,
    land_area: float,
    crop_stage: str,
) -> dict:
    """
    Call pesticide_service safely — never let an exception here crash the
    ML prediction response.  On error, return a clearly-labelled fallback dict.
    """
    try:
        return pesticide_service.recommend(
            disease=raw_class,          # RAW ML class name — to_key() runs inside
            crop_type=crop_type,
            soil_type=soil_type,
            land_area_hectares=land_area,
            crop_stage=crop_stage,
        )
    except Exception as exc:
        logger.exception("pesticide_service.recommend() failed: %s", exc)
        return {
            "pesticide_name": "Lookup error — check server logs",
            "dosage": "N/A",
            "dosage_grams_total": 0,
            "spray_interval_days": 0,
            "spray_interval": "N/A",
            "precautions": "Service error — consult agronomist",
            "if_pesticide_fails": str(exc),
            "matched_disease_key": "error",
            "matched_via": "error",
        }


# ── Single-image endpoint ─────────────────────────────────────────────────────

@router.post("/predict")
async def predict_single(
    file: UploadFile = File(...),
    crop_type:  str   = Query(default="Unknown",    description="e.g. Cowpea, Soyabean"),
    soil_type:  str   = Query(default="Loamy",      description="Sandy | Loamy | Clay | Silty | Peaty | Black | Red"),
    land_area:  float = Query(default=1.0,          description="Farm area in hectares"),
    crop_stage: str   = Query(default="Vegetative", description="Seedling | Vegetative | Flowering | Pod_Filling | Maturity"),
):
    """
    Upload a single leaf image → returns disease prediction + pesticide recommendation.
    """
    if not ml_service.ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"ML model not ready: {ml_service.load_error}",
        )

    tmp = _save_temp(file)
    try:
        # ── ML prediction (DO NOT MODIFY ML LOGIC) ───────────────────────
        ml_result = ml_service.predict_path(str(tmp))

        # ml_result keys: disease (ui), confidence, confidence_percent,
        #                 class_index, raw_class
        raw_class = ml_result["raw_class"]   # e.g. "Cowpea___Bacterial_Wilt"

        # ── Pesticide recommendation ──────────────────────────────────────
        pesticide = _get_pesticide(raw_class, crop_type, soil_type, land_area, crop_stage)

        # ── Merged response ───────────────────────────────────────────────
        return JSONResponse({
            # Disease fields
            "disease":              ml_result["disease"],           # UI display
            "raw_class":            raw_class,
            "confidence":           ml_result["confidence"],
            "confidence_percent":   ml_result["confidence_percent"],
            "class_index":          ml_result["class_index"],

            # Pesticide fields — guaranteed present
            "pesticide_name":       pesticide["pesticide_name"],
            "options":              pesticide.get("options", []),
            "dosage":               pesticide["dosage"],
            "dosage_grams_total":   pesticide["dosage_grams_total"],
            "spray_interval_days":  pesticide["spray_interval_days"],
            "spray_interval":       pesticide["spray_interval"],
            "precautions":          pesticide["precautions"],
            "if_pesticide_fails":   pesticide["if_pesticide_fails"],

            # Context
            "crop_type":            pesticide["crop_type"],
            "soil_type":            pesticide["soil_type"],
            "crop_stage":           pesticide["crop_stage"],

            # Transparency
            "matched_disease_key":  pesticide["matched_disease_key"],
            "matched_via":          pesticide["matched_via"],
        })

    finally:
        _cleanup(tmp)


# ── Multi-image endpoint ──────────────────────────────────────────────────────

@router.post("/predict-many")
async def predict_many(
    files: list[UploadFile] = File(...),
    crop_type:  str   = Query(default="Unknown",    description="e.g. Cowpea, Soyabean"),
    soil_type:  str   = Query(default="Loamy",      description="Sandy | Loamy | Clay | Silty | Peaty | Black | Red"),
    land_area:  float = Query(default=1.0,          description="Farm area in hectares"),
    crop_stage: str   = Query(default="Vegetative", description="Seedling | Vegetative | Flowering | Pod_Filling | Maturity"),
):
    """
    Upload multiple leaf images → aggregates predictions, returns dominant disease
    + correct pesticide recommendation for the dominant class.
    """
    if not ml_service.ready:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"ML model not ready: {ml_service.load_error}",
        )

    if not files:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one image file is required.",
        )

    tmps: list[Path] = []
    try:
        tmps = [_save_temp(f) for f in files]
        paths = [str(p) for p in tmps]

        # ── ML prediction — uses predict_many (DO NOT MODIFY) ─────────────
        ml_result = ml_service.predict_many(paths)

        # ml_result keys: dominant_disease (UI), dominant_raw_class,
        #                 confidence, confidence_percent, severity, per_image
        dominant_raw = ml_result["dominant_raw_class"]  # e.g. "Cowpea___Bacterial_Wilt"

        # ── Pesticide for dominant disease ────────────────────────────────
        pesticide = _get_pesticide(dominant_raw, crop_type, soil_type, land_area, crop_stage)

        # ── Merged response ───────────────────────────────────────────────
        return JSONResponse({
            # Dominant disease fields
            "dominant_disease":     ml_result["dominant_disease"],      # UI display
            "dominant_raw_class":   dominant_raw,
            "confidence":           ml_result["confidence"],
            "confidence_percent":   ml_result["confidence_percent"],
            "severity":             ml_result["severity"],

            # Pesticide fields — guaranteed present
            "pesticide_name":       pesticide["pesticide_name"],
            "options":              pesticide.get("options", []),
            "dosage":               pesticide["dosage"],
            "dosage_grams_total":   pesticide["dosage_grams_total"],
            "spray_interval_days":  pesticide["spray_interval_days"],
            "spray_interval":       pesticide["spray_interval"],
            "precautions":          pesticide["precautions"],
            "if_pesticide_fails":   pesticide["if_pesticide_fails"],

            # Context
            "crop_type":            pesticide["crop_type"],
            "soil_type":            pesticide["soil_type"],
            "crop_stage":           pesticide["crop_stage"],

            # Transparency
            "matched_disease_key":  pesticide["matched_disease_key"],
            "matched_via":          pesticide["matched_via"],

            # Per-image detail
            "per_image":            ml_result["per_image"],
        })

    finally:
        _cleanup(*tmps)