import json
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import InteractionRecord
from app.db.session import get_db
from app.schemas.advisor import HistorySaveRequest, RecommendationRequest, RecommendationResponse
from app.services.ml_service import ml_service
from app.services.pesticide_service import pesticide_service
from app.utils.files import save_upload

router = APIRouter(tags=["smart-leaf-advisor"])

CONSULT_EXPERT_DISCLAIMER = (
    "This tool provides AI-assisted guidance only and is not a substitute for professional "
    "field diagnosis. Consult a qualified agricultural expert or your local extension service "
    "before making treatment decisions."
)


def _response_advisory(confidence: float) -> dict:
    below = confidence < 0.5
    return {
        "low_confidence_warning": below,
        "low_confidence_message": (
            "Prediction confidence is below 50%. Treat this result as uncertain and verify with an expert."
            if below
            else None
        ),
        "consult_expert_disclaimer": CONSULT_EXPERT_DISCLAIMER,
    }


def _ensure_model():
    if not ml_service.ready:
        detail = ml_service.load_error or "Model not loaded"
        raise HTTPException(status_code=503, detail=detail)


@router.post("/predict-single")
async def predict_single(
    image: UploadFile = File(...),
    crop_name: Annotated[str, Form()] = "",
    crop_stage: Annotated[str, Form()] = "",
):
    _ensure_model()
    if not crop_name.strip() or not crop_stage.strip():
        raise HTTPException(status_code=400, detail="crop_name and crop_stage are required")
    try:
        path = await save_upload(image)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    try:
        pred = ml_service.predict_path(str(path))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}") from e
    fixed_disease = pred["disease"].replace(" - ", "___").replace(" ", "_")

    # ✅ FIX 2: CALL pesticide service safely
    rec = None
    try:
        rec = pesticide_service.recommend(
            disease=fixed_disease,
            crop_type=crop_name.strip(),
            soil_type="loamy",
            land_area_hectares=1,
            crop_stage=crop_stage.strip(),
        )
    except Exception as e:
        print("Pesticide error:", e)

    return {
        "disease": pred["disease"],
        "confidence": pred["confidence"],
        "confidence_percent": pred["confidence_percent"],
        "severity": ml_service.severity_band(pred["confidence"]),
        "crop_name": crop_name.strip(),
        "crop_stage": crop_stage.strip(),
        "image_path": str(path),
        "pesticide": rec["pesticide_name"] if rec else None,
        "dosage": rec["dosage"] if rec else None,
        "spray_interval": rec["spray_interval"] if rec else None,
        "precautions": rec["precautions"] if rec else None,
        **_response_advisory(pred["confidence"]),
    }


@router.post("/predict-multiple")
async def predict_multiple(
    images: list[UploadFile] = File(...),
    crop_name: Annotated[str, Form()] = "",
    crop_stage: Annotated[str, Form()] = "",
):
    _ensure_model()
    if not 2 <= len(images) <= 5:
        raise HTTPException(status_code=400, detail="Provide between 2 and 5 images")
    if not crop_name.strip() or not crop_stage.strip():
        raise HTTPException(status_code=400, detail="crop_name and crop_stage are required")
    paths = []
    try:
        for im in images:
            paths.append(await save_upload(im))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    try:
        agg = ml_service.predict_many([str(p) for p in paths])
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}") from e
    rec = None
    try:
        fixed_disease = agg["dominant_disease"].split(" - ")[-1].replace(" ", "_")
        rec = pesticide_service.recommend(
            disease=fixed_disease.upper(),
            crop_type=crop_name.strip(),
            soil_type="loamy",
            land_area_hectares=1,
            crop_stage=crop_stage.strip(),
        )
    except Exception:
        rec = None
    return {
    "dominant_disease": agg["dominant_disease"],
    "confidence": agg["confidence"],
    "confidence_percent": agg["confidence_percent"],
    "severity": agg["severity"],
    "crop_name": crop_name.strip(),
    "crop_stage": crop_stage.strip(),
    "per_image": agg["per_image"],
    "image_paths": [str(p) for p in paths],

    "pesticide": rec["pesticide_name"] if rec else None,
    "dosage": rec["dosage"] if rec else None,
    "spray_interval": rec["spray_interval"] if rec else None,
    "precautions": rec["precautions"] if rec else None,

    **_response_advisory(agg["confidence"])
}


@router.post("/recommendation", response_model=dict)
def recommendation(body: RecommendationRequest):
    try:
        fixed_disease = body.disease.replace(" - ", "___").replace(" ", "_")
        rec = pesticide_service.recommend(
            disease=fixed_disease,
            crop_type=body.crop,
            soil_type=body.soil,
            land_area_hectares=body.land_area,
            crop_stage=body.stage,
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation failed: {e}") from e
    out = RecommendationResponse(
        pesticide=rec["pesticide_name"],
        dosage=rec["dosage"],
        spray_interval=rec["spray_interval"],
        precautions=rec["precautions"],
    )
    return {**out.model_dump(), "spray_interval_days": rec["spray_interval_days"]}


@router.post("/history", response_model=dict)
def save_history(body: HistorySaveRequest, db: Session = Depends(get_db)):
    try:
        rec_json = json.dumps(body.recommendation, ensure_ascii=False)
    except (TypeError, ValueError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid recommendation payload: {e}") from e
    row = InteractionRecord(
        user_id=body.user_id,
        image_path=body.image_path,
        disease=body.disease,
        recommendation=rec_json,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return {"ok": True, "id": row.id}


@router.get("/history", response_model=dict)
def get_history(
    user_id: int = Query(..., ge=0),
    db: Session = Depends(get_db),
):
    rows = db.scalars(
        select(InteractionRecord)
        .where(InteractionRecord.user_id == user_id)
        .order_by(InteractionRecord.created_at.desc())
    ).all()
    items = []
    for r in rows:
        try:
            rec = json.loads(r.recommendation)
        except json.JSONDecodeError:
            rec = {"raw": r.recommendation}
        items.append(
            {
                "id": r.id,
                "user_id": r.user_id,
                "image_path": r.image_path,
                "disease": r.disease,
                "recommendation": rec,
                "created_at": r.created_at.isoformat() if r.created_at else "",
            }
        )
    return {"user_id": user_id, "count": len(items), "records": items}
