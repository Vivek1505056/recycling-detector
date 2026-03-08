import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.core.config import settings
from app.services.inference_service import InferenceService

router = APIRouter()
inference_service = InferenceService(model_path=settings.yolo_model_path or None)

@router.websocket("/detect")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logging.info("WebSocket connection opened for stream detection.")
    try:
        while True:
            # We expect the frontend to send raw JPEG/PNG bytes or base64. 
            # In our plan, we'll send binary frames as blob/bytes.
            frame_bytes = await websocket.receive_bytes()
            
            # Process the frame
            detections = inference_service.predict_frame(frame_bytes)
            
            # Send back the bounding boxes and labels
            await websocket.send_json({
                "success": True,
                "detections": detections
            })
            
    except WebSocketDisconnect:
        logging.info("WebSocket connection closed.")
    except Exception as e:
        logging.error(f"Error during WebSocket streaming: {e}")
        try:
            await websocket.close()
        except:
            pass
