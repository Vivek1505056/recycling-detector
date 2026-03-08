import logging
from dataclasses import dataclass

import cv2
import numpy as np

try:
    from ultralytics import YOLO
except ImportError:
    YOLO = None
    logging.warning("ultralytics is not installed. YOLO inference will fail.")


@dataclass
class InferenceOutput:
    label: str
    confidence: float
    is_recyclable: bool
    explanation: str


class InferenceService:
    def __init__(self, model_path: str | None = None) -> None:
        # Default to best_recycle.pt in the current root if empty string passed
        self.model_path = model_path if model_path else "best_recycle.pt"
        if YOLO:
            try:
                self.model = YOLO(self.model_path, )
                print(f"Loaded YOLO model from {self.model_path}")
            except Exception as e:
                print(f"Warning: Failed to load YOLO model: {e}")
                self.model = None
        else:
            self.model = None

    def _determine_recyclable(self, label: str) -> bool:
        recyclable_keywords = ["plastic", "paper", "cardboard", "can", "glass", "bottle", "metal"]
        garbage_keywords = ["garbage", "trash", "waste"]
        label_lower = label.lower()
        if any(k in label_lower for k in garbage_keywords):
            return False
        return any(k in label_lower for k in recyclable_keywords)

    async def analyze_image(self, image_bytes: bytes, filename: str) -> InferenceOutput:
        # Legacy fallback if model is missing
        if not self.model:
            return InferenceOutput(
                label="unknown item",
                confidence=0.5,
                is_recyclable=False,
                explanation="YOLO model not loaded."
            )
            
        # Convert bytes to cv2 image
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        results = self.model.predict(img, conf=0.25, verbose=False)
        
        valid_boxes = []
        if results and len(results[0].boxes) > 0:
            H, W = img.shape[:2]
            # Center 60% of the image (ignores 20% margins on edges)
            min_x, max_x = W * 0.2, W * 0.8
            min_y, max_y = H * 0.2, H * 0.8

            for box in results[0].boxes:
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                cx = (x1 + x2) / 2
                cy = (y1 + y2) / 2
                if min_x <= cx <= max_x and min_y <= cy <= max_y:
                    valid_boxes.append(box)
        
        if not valid_boxes:
            return InferenceOutput(
                label="No object detected",
                confidence=0.0,
                is_recyclable=False,
                explanation="No object was found in the image."
            )
            
        # Take the detection with highest confidence in the center region
        best_box = max(valid_boxes, key=lambda b: float(b.conf[0]))
        cls = int(best_box.cls[0])
        conf = float(best_box.conf[0])
        label = self.model.names[cls]
        
        is_recyclable = self._determine_recyclable(label)
        
        return InferenceOutput(
            label=label,
            confidence=conf,
            is_recyclable=is_recyclable,
            explanation=f"Detected {label} with {conf*100:.1f}% confidence. "
                        f"Considered {'recyclable' if is_recyclable else 'garbage'}."
        )

    def predict_frame(self, image_bytes: bytes) -> list[dict]:
        """Runs YOLO on a single frame and returns all detections for the stream."""
        detections = []
        if not self.model:
            return detections
            
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return detections
            
        results = self.model.predict(img, conf=0.25, verbose=False, imgsz=512)
        
        if not results:
            return detections
            
        H, W = img.shape[:2]
        # Center 60% of the image (ignores 20% margins on edges)
        min_x, max_x = W * 0.2, W * 0.8
        min_y, max_y = H * 0.2, H * 0.8
            
        for box in results[0].boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            cx = (x1 + x2) / 2
            cy = (y1 + y2) / 2
            
            # Check if the center of the object is within the center of the screen
            if not (min_x <= cx <= max_x and min_y <= cy <= max_y):
                continue
                
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            label = self.model.names[cls]
            
            detections.append({
                "x1": x1, "y1": y1, "x2": x2, "y2": y2,
                "label": label,
                "confidence": conf,
                "is_recyclable": self._determine_recyclable(label)
            })
            
        return detections

