import cv2
import numpy as np
import tensorflow as tf


def preprocess_uploaded_image(image_path: str, height: int = 300, width: int = 300) -> np.ndarray:
    """
    Load and preprocess image for EfficientNet model.
    Returns batch array of shape (1, H, W, 3).
    """
    img = cv2.imread(image_path)

    if img is None:
        raise ValueError(f"Invalid image path or unreadable file: {image_path}")

    # Convert BGR → RGB
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    # Resize to model input size
    img = cv2.resize(img, (width, height))

    # Convert to float32
    img = np.array(img, dtype=np.float32)

    # EfficientNet preprocessing (scales to [-1, 1] range)
    img = tf.keras.applications.efficientnet.preprocess_input(img)

    # Add batch dimension → (1, H, W, 3)
    img = np.expand_dims(img, axis=0)

    return img


# Legacy alias kept for backward compat
def preprocess_image(image_path: str) -> np.ndarray:
    return preprocess_uploaded_image(image_path, 224, 224)