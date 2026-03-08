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
        self.min_confidence = 0.45
        self.stream_min_confidence = 0.55
        self.focus_box_ratio = 0.5
        self.min_box_area_ratio = 0.035

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

    def _get_material_info(self, label: str) -> tuple[bool, str]:
        label_lower = label.lower()
        
        # Hardcoded feedback logic
        if any(k in label_lower for k in ["plastic", "bottle"]):
            return True, "Plastics (like bottles and jugs) are generally recyclable. Please ensure they are empty, clean, and dry before placing them in the bin."
        if any(k in label_lower for k in ["paper", "cardboard"]):
            return True, "Paper and cardboard are highly recyclable. Make sure cardboard is flattened and free of heavy food residue (like greasy pizza boxes)."
        if any(k in label_lower for k in ["metal", "can"]):
            return True, "Metal cans (aluminum and tin) are infinitely recyclable! Just give them a quick rinse."
        if "glass" in label_lower:
            return True, "Glass bottles and jars are commonly accepted. Please remove any non-glass lids and rinse them out."
        
        # Default fallback for garbage/unknowns
        return False, f"This item ({label}) is not recognized as a standard recyclable material. When in doubt, throw it out to prevent bin contamination."

    def _determine_recyclable(self, label: str) -> bool:
        is_recyclable, _ = self._get_material_info(label)
        return is_recyclable

    def _focus_region(self, width: int, height: int) -> tuple[float, float, float, float]:
        margin_x = width * (1 - self.focus_box_ratio) / 2
        margin_y = height * (1 - self.focus_box_ratio) / 2
        return margin_x, width - margin_x, margin_y, height - margin_y

    def _score_box(self, box, width: int, height: int) -> float | None:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        box_width = max(0.0, x2 - x1)
        box_height = max(0.0, y2 - y1)
        box_area_ratio = (box_width * box_height) / float(width * height)
        if box_area_ratio < self.min_box_area_ratio:
            return None

        min_x, max_x, min_y, max_y = self._focus_region(width, height)
        cx = (x1 + x2) / 2
        cy = (y1 + y2) / 2
        if not (min_x <= cx <= max_x and min_y <= cy <= max_y):
            return None

        focus_center_x = width / 2
        focus_center_y = height / 2
        norm_dx = abs(cx - focus_center_x) / (width / 2)
        norm_dy = abs(cy - focus_center_y) / (height / 2)
        centeredness = max(0.0, 1.0 - ((norm_dx + norm_dy) / 2))

        confidence = float(box.conf[0])
        return (confidence * 0.7) + (centeredness * 0.2) + (min(box_area_ratio / 0.2, 1.0) * 0.1)

    def _filter_boxes(self, boxes, width: int, height: int, min_confidence: float) -> list:
        ranked_boxes = []
        for box in boxes:
            confidence = float(box.conf[0])
            if confidence < min_confidence:
                continue

            score = self._score_box(box, width, height)
            if score is None:
                continue

            ranked_boxes.append((score, box))

        ranked_boxes.sort(key=lambda item: item[0], reverse=True)
        return [box for _, box in ranked_boxes]

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
        if img is None:
            return InferenceOutput(
                label="No object detected",
                confidence=0.0,
                is_recyclable=False,
                explanation="Could not decode the image."
            )
        
        results = self.model.predict(img, conf=self.min_confidence, verbose=False)
        
        valid_boxes = []
        if results and len(results[0].boxes) > 0:
            height, width = img.shape[:2]
            valid_boxes = self._filter_boxes(
                results[0].boxes,
                width=width,
                height=height,
                min_confidence=self.min_confidence,
            )
        
        if not valid_boxes:
            return InferenceOutput(
                label="No object detected",
                confidence=0.0,
                is_recyclable=False,
                explanation="Place one clear object inside the center focus area and move closer."
            )
            
        # Prefer one clear, centered object instead of many incidental detections.
        best_box = valid_boxes[0]
        cls = int(best_box.cls[0])
        conf = float(best_box.conf[0])
        label = self.model.names[cls]
        
        is_recyclable, explanation = self._get_material_info(label)
        
        return InferenceOutput(
            label=label,
            confidence=conf,
            is_recyclable=is_recyclable,
            explanation=explanation
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
            
        results = self.model.predict(
            img,
            conf=self.stream_min_confidence,
            verbose=False,
            imgsz=512,
        )
        
        if not results:
            return detections
            
        height, width = img.shape[:2]
        valid_boxes = self._filter_boxes(
            results[0].boxes,
            width=width,
            height=height,
            min_confidence=self.stream_min_confidence,
        )

        for box in valid_boxes[:1]:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            cls = int(box.cls[0])
            conf = float(box.conf[0])
            label = self.model.names[cls]
            
            is_recyclable, explanation = self._get_material_info(label)
            
            detections.append({
                "x1": x1, "y1": y1, "x2": x2, "y2": y2,
                "label": label,
                "confidence": conf,
                "is_recyclable": is_recyclable,
                "explanation": explanation
            })
            
        return detections
