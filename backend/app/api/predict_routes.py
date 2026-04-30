import json
from typing import Annotated

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import HistoryCase, User
from app.db.session import get_db
from app.schemas.schemas import PredictMultiOut, PredictSingleOut, RecommendIn, RecommendOut
from app.services.ml_service import ml_service
from app.services.pesticide_service import pesticide_service
from app.utils.files import save_upload

router = APIRouter(tags=["predict"])


def _persist(db: Session, user: User, case_type: str, title: str, payload: dict) -> int:
    row = HistoryCase(
        user_id=user.id,
        case_type=case_type,
        title=title,
        payload_json=json.dumps(payload, ensure_ascii=False),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row.id


@router.post("/predict/single", response_model=dict)
async def predict_single(
    image: UploadFile = File(...),
    crop_name: Annotated[str, Form()] = "",
    crop_stage: Annotated[str, Form()] = "",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not crop_name.strip() or not crop_stage.strip():
        raise HTTPException(400, detail="crop_name and crop_stage are required")
    try:
        path = await save_upload(image)
    except ValueError as e:
        raise HTTPException(400, detail=str(e)) from e
    try:
        pred = ml_service.predict_path(str(path))
    except ValueError as e:
        raise HTTPException(400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(500, detail=f"Prediction failed: {e}") from e
    sev = ml_service.severity_band(pred["confidence_percent"])
    # 👉 ADD THIS BEFORE out =
    rec = pesticide_service.recommend(
        disease=pred["raw_class"],
        crop_type=crop_name.strip(),
        soil_type="normal",  # you can change later
        land_area_hectares=1.0,  # default
        crop_stage=crop_stage.strip(),
    )

    out = {
        "success": True,
        "data": {
            "disease": pred["disease"],
            "confidence_percent": pred["confidence_percent"],
            "severity_level": sev,
            "crop_name": crop_name.strip(),
            "crop_stage": crop_stage.strip(),

            # ✅ ADD THESE LINES
            "pesticide_name": rec["pesticide_name"],
            "dosage": rec["dosage"],
            "spray_interval": rec["spray_interval"],
        }
    }
    case_id = _persist(
        db,
        user,
        "single",
        f"{crop_name}: {pred['disease']}",
        {"kind": "single", "result": out["data"], "image_path": str(path)},
    )
    out["data"]["history_id"] = case_id
    return out


@router.post("/predict/multi", response_model=dict)
async def predict_multi(
    images: list[UploadFile] = File(...),
    crop_name: Annotated[str, Form()] = "",
    crop_stage: Annotated[str, Form()] = "",
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if not (2 <= len(images) <= 5):
        raise HTTPException(400, detail="Upload between 2 and 5 images")
    if not crop_name.strip() or not crop_stage.strip():
        raise HTTPException(400, detail="crop_name and crop_stage are required")
    paths = []
    try:
        for im in images:
            paths.append(await save_upload(im))
    except ValueError as e:
        raise HTTPException(400, detail=str(e)) from e
    try:
        agg = ml_service.predict_many([str(p) for p in paths])
    except ValueError as e:
        raise HTTPException(400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(500, detail=f"Prediction failed: {e}") from e
    slim = PredictMultiOut(
        dominant_disease=agg["dominant_disease"],
        confidence_percent=agg["confidence_percent"],
        severity_level=agg["severity"],
        per_image=[
            {
                "disease": x["disease"],
                "confidence_percent": x["confidence_percent"],
                "severity_level": x.get("severity") or ml_service.severity_band(x["confidence_percent"]),
            }
            for x in agg["per_image"]
        ],
    )
    data = slim.model_dump()
    data["crop_name"] = crop_name.strip()
    data["crop_stage"] = crop_stage.strip()
    rec = pesticide_service.recommend(
        disease=agg["dominant_raw_class"],
        crop_type=crop_name.strip(),
        soil_type="normal",
        land_area_hectares=1.0,
        crop_stage=crop_stage.strip(),
    )

    data["pesticide_name"] = rec["pesticide_name"]
    data["dosage"] = rec["dosage"]
    data["spray_interval"] = rec["spray_interval"]
    case_id = _persist(
        db,
        user,
        "multi",
        f"{crop_name}: {agg['dominant_disease']} (multi)",
        {"kind": "multi", "result": data, "paths": [str(p) for p in paths]},
    )
    data["history_id"] = case_id
    return {"success": True, "data": data}


@router.post("/recommend/pesticide", response_model=dict)
def recommend_pesticide(body: RecommendIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    try:
        rec = pesticide_service.recommend(
            disease=body.disease,
            crop_type=body.crop_type,
            soil_type=body.soil_type,
            land_area_hectares=body.land_area_hectares,
            crop_stage=body.crop_stage,
        )
    except FileNotFoundError as e:
        raise HTTPException(500, detail=str(e)) from e
    out = RecommendOut(
        pesticide_name=rec["pesticide_name"],
        dosage=rec["dosage"],
        spray_interval=rec["spray_interval"],
        precautions=rec["precautions"],
        if_pesticide_fails=rec["if_pesticide_fails"],
        spray_interval_days=rec["spray_interval_days"],
    )
    payload = {"kind": "pesticide", "input": body.model_dump(), "result": out.model_dump()}
    case_id = _persist(db, user, "pesticide", f"{body.crop_type}: {body.disease}", payload)
    data = out.model_dump()
    data["history_id"] = case_id
    return {"success": True, "data": data}
