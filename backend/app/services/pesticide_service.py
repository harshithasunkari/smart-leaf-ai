import json
import re
from pathlib import Path

from app.core.config import get_settings


def normalize_key(s: str) -> str:
    return re.sub(r"\s+", "_", s.strip()).replace("-", "_")


class PesticideService:
    def __init__(self) -> None:
        self._data: dict | None = None

    def _load(self) -> dict:
        if self._data is None:
            path = get_settings().pesticide_rules_path
            if not path.exists():
                raise FileNotFoundError(f"pesticide_rules.json missing at {path}")
            self._data = json.loads(path.read_text(encoding="utf-8"))
        return self._data

    def recommend(
        self,
        disease: str,
        crop_type: str,
        soil_type: str,
        land_area_hectares: float,
        crop_stage: str,
    ) -> dict:
        data = self._load()
        by = data.get("by_disease", {})
        dkey = normalize_key(disease)
        block = by.get(disease.strip()) or by.get(dkey) or data["default"]
        soil_fac = float(data.get("soil_factor", {}).get(soil_type, 1.0))
        stage_fac = float(data.get("stage_factor", {}).get(normalize_key(crop_stage), 1.0))
        base_g = float(block["dosage_per_hectare_g"])
        total_g = round(base_g * land_area_hectares * soil_fac * stage_fac, 1)
        interval = int(block["spray_interval_days"])
        if interval == 0:
            interval_note = "Not applicable"
        else:
            interval_note = f"Every {interval} days under typical pressure (adjust per label)"
        return {
            "pesticide_name": block["pesticide_name"],
            "dosage": f"{total_g} g product for ~{land_area_hectares:.2f} ha ({crop_type}, {soil_type} soil, {crop_stage})",
            "dosage_grams_total": total_g,
            "spray_interval_days": interval,
            "spray_interval": interval_note,
            "precautions": block["precautions"],
            "if_pesticide_fails": block["if_fails"],
            "crop_type": crop_type,
            "soil_type": soil_type,
        }

    def failure_explanation(self, disease: str) -> str:
        data = self._load()
        by = data.get("by_disease", {})
        dkey = normalize_key(disease)
        block = by.get(disease.strip()) or by.get(dkey) or data["default"]
        return str(block.get("if_fails", ""))


pesticide_service = PesticideService()
