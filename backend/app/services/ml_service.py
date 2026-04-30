import json
from collections import Counter
from pathlib import Path

import numpy as np
import tensorflow as tf

from app.core.config import get_settings
from utils.preprocessing import preprocess_uploaded_image


class MLService:
    def __init__(self) -> None:
        self._model = None
        self._class_names: list[str] = []
        self._resize_hw: tuple[int, int] = (224, 224)
        self.load_error: str | None = None

    def load(self) -> None:
        self.load_error = None
        settings = get_settings()

        print(f"[MLService] MODEL PATH: {settings.model_path}")
        print(f"[MLService] EXISTS: {settings.model_path.exists()}")

        # Try .keras first, then .h5 fallback
        model_path = settings.model_path
        if not model_path.exists():
            alt = model_path.with_suffix(".h5")
            if alt.exists():
                model_path = alt
                print(f"[MLService] Using fallback: {model_path}")

        try:
            if not model_path.exists():
                raise FileNotFoundError(
                    f"No model file found. Tried:\n"
                    f"  {settings.model_path}\n"
                    f"  {settings.model_path.with_suffix('.h5')}\n"
                    "Run model.py to train and save the model."
                )

            self._model = tf.keras.models.load_model(
                str(model_path),
                compile=False
            )
            print(f"[MLService] ✅ Model loaded from {model_path}")

            # Load class names
            cn_path = settings.class_names_path
            if cn_path.exists():
                raw = json.loads(cn_path.read_text(encoding="utf-8"))

                # ✅ FIX: Handle both list and dict formats from class_names.json
                if isinstance(raw, dict):
                    # Convert string keys to int and build an ordered list
                    int_keyed = {int(k): v for k, v in raw.items()}
                    self._class_names = [
                        int_keyed[i] for i in sorted(int_keyed.keys())
                    ]
                elif isinstance(raw, list):
                    self._class_names = raw
                else:
                    raise ValueError(
                        f"class_names.json must be a list or dict, got {type(raw)}"
                    )

                print(f"[MLService] ✅ Loaded {len(self._class_names)} classes")
            else:
                self._class_names = ["Healthy", "Diseased"]
                print("[MLService] ⚠️ class_names.json not found, using defaults")

            # Match output shape
            out_shape = getattr(self._model, "output_shape", None)
            if out_shape:
                n = int(out_shape[-1])
                if n != len(self._class_names):
                    print(f"[MLService] ⚠️ Model output {n} != class_names {len(self._class_names)}, padding")
                    self._class_names = (
                        self._class_names +
                        [f"Class_{i}" for i in range(len(self._class_names), n)]
                    )[:n]

            # Infer input size
            h, w = self._infer_input_hw()
            self._resize_hw = (h, w)
            print(f"[MLService] Input size: {self._resize_hw}")

        except Exception as e:
            self._model = None
            self.load_error = str(e)
            print(f"[MLService] ❌ Model load failed: {e}")

    def _infer_input_hw(self) -> tuple[int, int]:
        settings = get_settings()
        default = settings.image_input_size

        if not self._model:
            return default, default

        shape = getattr(self._model, "input_shape", None)
        if shape is None or len(shape) < 3:
            return default, default

        try:
            h = int(shape[1] or 0)
            w = int(shape[2] or 0)
            return (h, w) if h > 0 and w > 0 else (default, default)
        except (TypeError, IndexError):
            return default, default

    @property
    def input_hw(self) -> tuple[int, int]:
        return self._resize_hw

    @property
    def ready(self) -> bool:
        return self._model is not None

    def predict_paths(self, paths: list[str]) -> list[dict]:
        if not self.ready:
            raise RuntimeError(f"Model not loaded: {self.load_error}")

        h, w = self.input_hw
        batches = []
        for p in paths:
            arr = preprocess_uploaded_image(p, h, w)
            batches.append(arr)

        x = np.concatenate(batches, axis=0)
        probs = self._model.predict(x, verbose=0)

        results = []
        for i in range(probs.shape[0]):
            row = probs[i]
            idx = int(np.argmax(row))
            confidence = float(row[idx])

            # ✅ FIX: Safe lookup with fallback — no KeyError/IndexError on missing index
            disease = (
                self._class_names[idx]
                if idx < len(self._class_names)
                else f"Class_{idx}"
            )

            results.append({
                "disease": disease.replace("___", " - ").replace("_", " "),
                "confidence": confidence,
                "confidence_percent": round(confidence * 100.0, 2),
                "class_index": idx,
                "raw_class": disease,
            })

        return results

    def predict_path(self, image_path: str) -> dict:
        return self.predict_paths([image_path])[0]

    @staticmethod
    def severity_band(confidence: float) -> str:
        p = confidence * 100.0
        if p < 60:
            return "Low"
        if p <= 80:
            return "Medium"
        return "High"

    def predict_many(self, paths: list[str]) -> dict:
        results = self.predict_paths(paths)

        diseases = [r["raw_class"] for r in results]
        dominant = Counter(diseases).most_common(1)[0][0]

        confs = [r["confidence"] for r in results if r["disease"] == dominant]
        avg_conf = float(np.mean(confs)) if confs else float(
            np.mean([r["confidence"] for r in results])
        )

        return {
            "dominant_disease": dominant.replace("___", " - ").replace("_", " "),
            "dominant_raw_class": dominant,   # ✅ ADD THIS LINE
            "confidence": avg_conf,
            "confidence_percent": round(avg_conf * 100.0, 2),
            "severity": self.severity_band(avg_conf),
            "per_image": [
                {**x, "severity": self.severity_band(x["confidence"])}
                for x in results
            ],
        }


ml_service = MLService()