import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.models import HistoryCase, User
from app.db.session import get_db
from app.services.ml_service import ml_service
from app.services.pesticide_service import pesticide_service
from app.utils.files import save_upload
from fastapi import Body
router = APIRouter(prefix="/history", tags=["history"])

@router.post("/save")
def save_history(
    payload: dict = Body(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    case_type = payload.get("case_type", "multi_detection")

    if case_type not in ["single_detection", "multi_detection"]:
        raise HTTPException(400, "Invalid case_type")

    # ✅ STANDARD STRUCTURE (IMPORTANT)
    clean_payload = {
        "kind": case_type,
        "result": payload.get("payload_json", {})
    }

    row = HistoryCase(
        user_id=user.id,
        case_type=case_type,
        title=payload.get("title", "Unknown"),
        payload_json=json.dumps(clean_payload, ensure_ascii=False),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    db.add(row)
    db.commit()
    db.refresh(row)

    return {
        "success": True,
        "data": {"history_id": row.id}
    }
@router.get("")
def list_history(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.scalars(
        select(HistoryCase).where(HistoryCase.user_id == user.id).order_by(HistoryCase.created_at.desc())
    ).all()
    return {
        "success": True,
        "data": {
            "items": [
                {
                    "id": r.id,
                    "case_type": r.case_type,
                    "title": r.title,
                    "created_at": r.created_at.isoformat() if r.created_at else "",
                    "updated_at": r.updated_at.isoformat() if r.updated_at else "",
                }
                for r in rows
            ]
        },
    }


@router.get("/{case_id}")
def get_case(case_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    row = db.get(HistoryCase, case_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, detail="Case not found")
    try:
        payload = json.loads(row.payload_json)
    except json.JSONDecodeError:
        payload = {}
    return {
        "success": True,
        "data": {
            "id": row.id,
            "case_type": row.case_type,
            "title": row.title,
            "payload": payload,
            "created_at": row.created_at.isoformat() if row.created_at else "",
            "updated_at": row.updated_at.isoformat() if row.updated_at else "",
        },
    }


@router.post("/{case_id}/reanalyze")
async def reanalyze(
    case_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    row = db.get(HistoryCase, case_id)
    if not row or row.user_id != user.id:
        raise HTTPException(404, detail="Case not found")
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
    try:
        payload = json.loads(row.payload_json)
    except json.JSONDecodeError:
        payload = {}
    follow = payload.get("followups") or []
    follow.append(
        {
            "at": datetime.now(timezone.utc).isoformat(),
            "prediction": {
            "disease": pred["disease"],
            "confidence_percent": pred["confidence_percent"],
            "severity_level": ml_service.severity_band(pred.get("confidence", 0)),
            },
        "image_path": str(path),
        }
    )
    payload["followups"] = follow
    row.payload_json = json.dumps(payload, ensure_ascii=False)
    row.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {
        "success": True,
        "data": {
            "history_id": row.id,
            "latest": follow[-1],
            "if_pesticide_fails_hint": _failure_hint(payload),
        },
    }


def _failure_hint(payload: dict) -> str:
    if payload.get("kind") == "pesticide":
        return (payload.get("result") or {}).get("if_pesticide_fails", "")
    res = payload.get("result") or {}
    d = res.get("disease") or res.get("dominant_disease")
    if d:
        return pesticide_service.failure_explanation(str(d))
    return (
        "If treatment fails: re-verify with new images, check application timing and coverage, "
        "rotate chemistry per label, and consult local extension."
    )
