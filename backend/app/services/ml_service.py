"""
app/services/ml_service.py
────────────────────────────────────────────────────────────────────────────────
NO ML LOGIC CHANGED.

Only guarantee: predict_many() always includes "dominant_raw_class" in its
return dict (it already did — just documented clearly here so the route knows
to read ml_result["dominant_raw_class"] and pass it to pesticide_service).
────────────────────────────────────────────────────────────────────────────────
"""

import json
import numpy as np
import tensorflow as tf
from collections import Counter

from app.core.config import get_settings
from utils.preprocessing import preprocess_uploaded_image
from app.utils.disease_mapper import to_key, to_ui   # to_key imported for future use


class MLService:
    def __init__(self) -> None:
        self._model = None
        self._class_names: list[str] = []
        self._resize_hw: tuple[int, int] = (224, 224)
        self.load_error: str | None = None

    def load(self) -> None:
        self.load_error = None
        settings = get_settings()

        model_path = settings.model_path

        if not model_path.exists():
            alt = model_path.with_suffix(".h5")
            if alt.exists():
                model_path = alt

        try:
            if not model_path.exists():
                raise FileNotFoundError("Model not found")

            self._model = tf.keras.models.load_model(str(model_path), compile=False)

            cn_path = settings.class_names_path
            if cn_path.exists():
                raw = json.loads(cn_path.read_text(encoding="utf-8"))

                if isinstance(raw, dict):
                    int_keyed = {int(k): v for k, v in raw.items()}
                    self._class_names = [int_keyed[i] for i in sorted(int_keyed)]
                else:
                    self._class_names = raw
            else:
                self._class_names = ["Healthy", "Diseased"]

            h, w = self._infer_input_hw()
            self._resize_hw = (h, w)

        except Exception as e:
            self._model = None
            self.load_error = str(e)

    def _infer_input_hw(self) -> tuple[int, int]:
        settings = get_settings()
        default = settings.image_input_size

        if not self._model:
            return default, default

        shape = getattr(self._model, "input_shape", None)

        try:
            return int(shape[1]), int(shape[2])
        except Exception:
            return default, default

    @property
    def ready(self) -> bool:
        return self._model is not None

    def predict_paths(self, paths: list[str]) -> list[dict]:
        if not self.ready:
            raise RuntimeError(self.load_error)

        h, w = self._resize_hw
        batches = []

        for p in paths:
            batches.append(preprocess_uploaded_image(p, h, w))

        x = np.concatenate(batches, axis=0)
        probs = self._model.predict(x, verbose=0)

        results = []

        for i in range(probs.shape[0]):
            row = probs[i]
            idx = int(np.argmax(row))
            confidence = float(row[idx])

            raw = self._class_names[idx] if idx < len(self._class_names) else f"Class_{idx}"

            results.append({
                "disease":              to_ui(raw),          # UI display string
                "confidence":           confidence,
                "confidence_percent":   round(confidence * 100, 2),
                "class_index":          idx,
                "raw_class":            raw,                 # ← pesticide_service reads THIS
            })

        return results

    def predict_path(self, image_path: str) -> dict:
        return self.predict_paths([image_path])[0]

    def predict_many(self, paths: list[str]) -> dict:
        results = self.predict_paths(paths)

        raw_classes = [r["raw_class"] for r in results]
        dominant_raw = Counter(raw_classes).most_common(1)[0][0]

        dominant_display = to_ui(dominant_raw)

        confs = [r["confidence"] for r in results if r["raw_class"] == dominant_raw]
        avg_conf = (
            float(np.mean(confs))
            if confs
            else float(np.mean([r["confidence"] for r in results]))
        )

        return {
            "dominant_disease":     dominant_display,        # UI display string
            "dominant_raw_class":   dominant_raw,            # ← route passes THIS to pesticide_service
            "confidence":           avg_conf,
            "confidence_percent":   round(avg_conf * 100, 2),
            "severity":             self.severity_band(avg_conf),
            "per_image": [
                {**x, "severity": self.severity_band(x["confidence"])}
                for x in results
            ],
        }

    @staticmethod
    def severity_band(confidence: float) -> str:
        p = confidence * 100
        if p < 60:
            return "Low"
        if p <= 80:
            return "Medium"
        return "High"


ml_service = MLService()