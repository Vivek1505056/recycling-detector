from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import settings
from app.schemas.detection import APIResponse
from app.services.inference_service import InferenceService

router = APIRouter()
inference_service = InferenceService(model_path=settings.yolo_model_path or None)


@router.post("/detect", response_model=APIResponse)
async def detect_item(file: UploadFile = File(...)) -> APIResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are supported.")

    image_bytes = await file.read()

    if not image_bytes:
        raise HTTPException(status_code=400, detail="Uploaded image is empty.")

    # TODO: Call your real YOLOv8 wrapper/service here once available.
    result = await inference_service.analyze_image(
        image_bytes=image_bytes,
        filename=file.filename or "upload.jpg",
    )

    return APIResponse(
        success=True,
        result={
            "label": result.label,
            "confidence": result.confidence,
            "is_recyclable": result.is_recyclable,
            "explanation": result.explanation,
        },
    )
