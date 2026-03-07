# Recycling Classifier Scaffold

Hackathon-friendly scaffold for a recycling classifier web app with:

- `frontend/`: React + Tailwind CSS
- `backend/`: FastAPI + placeholder inference service

This is intentionally partial. The app returns mock detection data until you connect a YOLOv8 model.

## Project Structure

```text
recycling-detector/
├── frontend/
│   ├── package.json
│   ├── .env.example
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── index.css
│       ├── components/
│       │   ├── CameraCapture.tsx
│       │   ├── DetectionResultCard.tsx
│       │   ├── HomeIntro.tsx
│       │   ├── HowItWorks.tsx
│       │   ├── ImagePreview.tsx
│       │   └── ImageUpload.tsx
│       ├── lib/
│       │   ├── api.ts
│       │   └── image.ts
│       └── types/
│           └── api.ts
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py
│       ├── api/
│       │   └── routes/
│       │       └── detect.py
│       ├── core/
│       │   └── config.py
│       ├── schemas/
│       │   └── detection.py
│       └── services/
│           └── inference_service.py
└── README.md
```

## Local Development

### Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Backend runs on `http://localhost:8000`.

## Where YOLOv8 Connects

- Main placeholder lives in `backend/app/services/inference_service.py`
- The upload endpoint lives in `backend/app/api/routes/detect.py`
- Replace the mock response with your YOLOv8 model loading and inference flow later

## Current API Shape

`POST /api/detect`

Accepts multipart form data with:

- `file`: uploaded image

Returns JSON like:

```json
{
  "success": true,
  "result": {
    "label": "plastic bottle",
    "is_recyclable": true,
    "confidence": 0.91,
    "explanation": "Placeholder logic for hackathon scaffold. Connect model-based reasoning here."
  }
}
```

