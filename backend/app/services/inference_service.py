from dataclasses import dataclass


@dataclass
class InferenceOutput:
    label: str
    confidence: float
    is_recyclable: bool
    explanation: str


class InferenceService:
    def __init__(self, model_path: str | None = None) -> None:
        self.model_path = model_path
        # TODO: load YOLOv8 model here once your team has a trained weights file.
        # Example later:
        # self.model = YOLO(model_path)

    async def analyze_image(self, image_bytes: bytes, filename: str) -> InferenceOutput:
        # Placeholder logic for hackathon scaffold.
        # TODO: connect YOLOv8 inference here and map the model output into the response shape.
        _ = image_bytes

        if "bottle" in filename.lower():
            return InferenceOutput(
                label="plastic bottle",
                confidence=0.93,
                is_recyclable=True,
                explanation=(
                    "Placeholder logic for hackathon scaffold. "
                    "This should be replaced with YOLOv8 detection output."
                ),
            )

        return InferenceOutput(
            label="unknown item",
            confidence=0.61,
            is_recyclable=False,
            explanation=(
                "Placeholder logic for hackathon scaffold. "
                "Use the YOLOv8 result and your recycling rules here."
            ),
        )

