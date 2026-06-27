"""
app/services/pesticide_service.py
────────────────────────────────────────────────────────────────────────────────
Loads pesticide_rules.json ONCE and exposes recommend().

KEY FIXES vs the broken version
────────────────────────────────
1.  `block` is ALWAYS assigned before soil/stage factor lines run.
    The old code had a bare `else: block = data["default"]` inside a for-loop
    `else`, which meant `block` was undefined when the key matched via fuzzy
    search but the loop never assigned it outside the `if` branch.

2.  Stage-factor lookup now uses the RAW crop_stage string (Title_Case) because
    the JSON keys are "Seedling", "Vegetative", "Flowering", etc. — NOT
    snake_case. Using to_key() on them was silently returning 1.0 every time.

3.  Fuzzy matching is explicit and logged — no more silent fallback.
    If neither exact nor fuzzy match → default block is used AND a warning key
    "matched_via" is added to the response so the caller can detect it.

4.  recommend() always returns pesticide_name, dosage, spray_interval —
    guaranteed, even for the default block.
────────────────────────────────────────────────────────────────────────────────
"""

import json
import logging
from app.core.config import get_settings
from app.utils.disease_mapper import to_key, key_candidates

logger = logging.getLogger(__name__)


class PesticideService:
    def __init__(self) -> None:
        self._data: dict | None = None

    # ── Internal loader (lazy, cached) ────────────────────────────────────────

    def _load(self) -> dict:
        if self._data is None:
            path = get_settings().pesticide_rules_path

            if not path.exists():
                raise FileNotFoundError(
                    f"pesticide_rules.json missing at {path}. "
                    "Ensure the file is deployed alongside the app."
                )

            self._data = json.loads(path.read_text(encoding="utf-8"))
            logger.info(
                "pesticide_rules.json loaded — %d disease entries",
                len(self._data.get("by_disease", {})),
            )

        return self._data

    # ── Disease-block resolver (THE critical fix) ─────────────────────────────

    def _resolve_block(self, disease_raw: str, by_disease: dict) -> tuple[dict, str]:
        """
        Return (block, matched_key).

        Resolution order
        ────────────────
        1. Exact to_key() match          → "cowpea_bacterial_wilt" hits directly
        2. Fuzzy prefix / substring scan → partial ML-name variants still resolve
        3. Default block                 → logged as WARNING, never silently used

        The second return value tells the caller HOW the block was found:
          "exact"   – perfect match
          "fuzzy"   – fuzzy match, caller may want to log it
          "default" – nothing matched, caller should warn the user
        """

        # ── 1. Exact match ──────────────────────────────────────────────────
        exact_key = to_key(disease_raw)
        if exact_key in by_disease:
            logger.debug("Pesticide lookup EXACT: %r → %r", disease_raw, exact_key)
            return by_disease[exact_key], "exact"

        # ── 2. Fuzzy: try progressively shorter prefix candidates ───────────
        for candidate in key_candidates(disease_raw)[1:]:   # skip [0] = exact (already tried)
            if candidate in by_disease:
                logger.warning(
                    "Pesticide lookup FUZZY: %r → %r (via candidate %r)",
                    disease_raw, candidate, candidate,
                )
                return by_disease[candidate], "fuzzy"

        # ── 3. Substring scan as last-resort fuzzy ──────────────────────────
        for json_key, block in by_disease.items():
            if exact_key in json_key or json_key in exact_key:
                logger.warning(
                    "Pesticide lookup SUBSTRING: %r → %r", disease_raw, json_key
                )
                return block, "fuzzy"

        # ── 4. Nothing matched → default ────────────────────────────────────
        logger.error(
            "Pesticide lookup FAILED for %r (key=%r). "
            "Returning default block. Add this key to pesticide_rules.json.",
            disease_raw, exact_key,
        )
        return None, "default"   # None signals caller to use data["default"]

    # ── Public API ────────────────────────────────────────────────────────────

    def recommend(
        self,
        disease: str,           # raw ML class name e.g. "Cowpea___Bacterial_Wilt"
        crop_type: str,
        soil_type: str,
        land_area_hectares: float,
        crop_stage: str,        # must match JSON key exactly e.g. "Vegetative"
    ) -> dict:
        """
        Return a complete pesticide recommendation dict.

        Guaranteed fields in the return value
        ──────────────────────────────────────
        pesticide_name, dosage, dosage_grams_total,
        spray_interval_days, spray_interval,
        precautions, if_pesticide_fails,
        crop_type, soil_type,
        matched_disease_key, matched_via
        """

        data = self._load()
        by_disease: dict = data.get("by_disease", {})

        # ── Resolve disease block ────────────────────────────────────────────
        block, matched_via = self._resolve_block(disease, by_disease)
        if block is None:
            block = data["default"]
            matched_disease_key = "default"
        else:
            matched_disease_key = to_key(disease)

        # ── Soil factor ──────────────────────────────────────────────────────
        # JSON keys are plain strings like "Sandy", "Loamy", "Clay" — no conversion needed
        soil_fac = float(data.get("soil_factor", {}).get(soil_type, 1.0))

        # ── Stage factor ─────────────────────────────────────────────────────
        # JSON keys are Title_Case strings: "Seedling", "Vegetative", "Pod_Filling" …
        # DO NOT call to_key() here — the JSON keys are NOT snake_case.
        # Accept the string as-is; if it doesn't match, default to 1.0.
        stage_fac = float(data.get("stage_factor", {}).get(crop_stage, 1.0))

        if stage_fac == 1.0 and crop_stage not in data.get("stage_factor", {}):
            logger.warning(
                "crop_stage %r not found in stage_factor — using 1.0. "
                "Valid values: %s",
                crop_stage,
                list(data.get("stage_factor", {}).keys()),
            )

        # ── Dosage calculation ───────────────────────────────────────────────
        base_g = float(block.get("dosage_per_hectare_g", 0))
        total_g = round(base_g * land_area_hectares * soil_fac * stage_fac, 1)

        interval = int(block.get("spray_interval_days", 0))
        interval_note = (
            "Not applicable — no chemical spray required"
            if interval == 0
            else f"Every {interval} days under typical disease pressure (adjust per label)"
        )

        return {
            # ── Core pesticide fields (frontend must show these) ──────────
            "pesticide_name":       block["pesticide_name"],
            "options":              block.get("options", []),
            "dosage":               (
                f"{total_g} g product for ~{land_area_hectares:.2f} ha "
                f"({crop_type}, {soil_type} soil, {crop_stage} stage)"
            ),
            "dosage_grams_total":   total_g,
            "spray_interval_days":  interval,
            "spray_interval":       interval_note,
            "precautions":          block.get("precautions", ""),
            "if_pesticide_fails":   block.get("if_fails", ""),

            # ── Context ───────────────────────────────────────────────────
            "crop_type":            crop_type,
            "soil_type":            soil_type,
            "crop_stage":           crop_stage,

            # ── Debug / transparency fields ───────────────────────────────
            "matched_disease_key":  matched_disease_key,
            "matched_via":          matched_via,          # "exact" | "fuzzy" | "default"
        }

    def failure_explanation(self, disease: str) -> str:
        """Return the 'if_fails' advice for a given disease (or default)."""
        data = self._load()
        by_disease = data.get("by_disease", {})

        block, _ = self._resolve_block(disease, by_disease)
        if block is None:
            block = data["default"]

        return str(block.get("if_fails", ""))


# ── Singleton ─────────────────────────────────────────────────────────────────
pesticide_service = PesticideService()