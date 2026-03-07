from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings
from app.schemas.detection import APIResponse
from app.services.gemini_service import GeminiService
from app.services.inference_service import InferenceService

router = APIRouter()
inference_service = InferenceService(model_path=settings.yolo_model_path or None)
gemini_service = GeminiService(api_key=settings.gemini_api_key)


@router.post("/detect", response_model=APIResponse)
async def detect_item(file: UploadFile = File(...)) -> APIResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported.")

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    # Use Gemini vision API for image analysis
    gemini_result = await gemini_service.analyze_image(
        image_bytes=image_bytes,
        mime_type=file.content_type or "image/jpeg",
    )

    return APIResponse(
        success=True,
        result={
            "label": gemini_result["label"],
            "confidence": gemini_result["confidence"],
            "is_recyclable": gemini_result["is_recyclable"],
            "explanation": gemini_result["explanation"],
        },
    )
