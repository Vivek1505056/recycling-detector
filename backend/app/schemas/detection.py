from pydantic import BaseModel, Field


class DetectionResult(BaseModel):
    label: str = Field(..., examples=["plastic bottle"])
    confidence: float = Field(..., ge=0, le=1, examples=[0.91])


class RecyclabilityResult(BaseModel):
    is_recyclable: bool = Field(..., examples=[True])
    explanation: str = Field(
        ...,
        examples=[
            "Placeholder logic for hackathon scaffold. Connect model-based reasoning here."
        ],
    )


class DetectionPayload(BaseModel):
    label: str
    confidence: float
    is_recyclable: bool
    explanation: str


class APIResponse(BaseModel):
    success: bool = True
    result: DetectionPayload
