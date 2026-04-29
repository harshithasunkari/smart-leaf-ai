import json
import numpy as np
import cv2
import tensorflow as tf
from tensorflow import keras

# =========================
# LOAD MODEL + CLASSES
# =========================
model = keras.models.load_model('./models/final_model.keras')

with open('./models/class_names.json', 'r') as f:
    CLASS_NAMES = json.load(f)

# =========================
# WHITE PATCH DETECTION
# =========================
def detect_white_patch_ratio(image):
    hsv = cv2.cvtColor(image, cv2.COLOR_RGB2HSV)

    lower = np.array([0, 0, 200])
    upper = np.array([180, 40, 255])

    mask = cv2.inRange(hsv, lower, upper)
    return np.sum(mask > 0) / mask.size

# =========================
# PREDICTION
# =========================
def predict_image(image_path):
    img = cv2.imread(image_path)

    if img is None:
        return {"error": "Image not found"}

    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    original_img = img.copy()

    # ✅ CORRECT PREPROCESSING (IMPORTANT)
    img = cv2.resize(img, (224, 224))
    img = np.array(img, dtype=np.float32)
    img = tf.keras.applications.efficientnet.preprocess_input(img)
    img = np.expand_dims(img, axis=0)

    # ---------- MODEL ----------
    preds = model.predict(img, verbose=0)[0]
    top_indices = np.argsort(preds)[::-1]

    top1 = top_indices[0]
    top2 = top_indices[1]

    top1_class = CLASS_NAMES[str(top1)]
    top2_class = CLASS_NAMES[str(top2)]

    confidence = preds[top1] * 100

    # =========================
    # SMART DECISION
    # =========================

    # Low confidence fallback
    if confidence < 65:
        final_class = top2_class
        confidence = preds[top2] * 100
    else:
        final_class = top1_class

    # Mildew correction
    white_ratio = detect_white_patch_ratio(original_img)

    if white_ratio > 0.05:
        for name in CLASS_NAMES.values():
            if "POWDER" in name.upper():
                final_class = name
                confidence = max(confidence, 75.0)
                break

    return {
        "disease": final_class,
    }

# =========================
# TEST
# =========================
if __name__ == "__main__":
    image_path = "uploads/test.jpg"
    result = predict_image(image_path)
    print(json.dumps(result, indent=2))