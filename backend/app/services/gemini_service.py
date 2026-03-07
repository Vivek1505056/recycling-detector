import json
import logging

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

PROMPT = """Analyze this image and determine what the item is and whether it is recyclable.

Respond with ONLY a JSON object in this exact format (no markdown, no extra text):
{
  "label": "<short item name, e.g. plastic bottle>",
  "confidence": <0.0-1.0 how confident you are in the identification>,
  "is_recyclable": <true or false>,
  "explanation": "<2-3 sentence explanation of what the item is, what material it is made of, and why it is or is not recyclable>"
}"""


class GeminiService:
    def __init__(self, api_key: str) -> None:
        self.client = genai.Client(api_key=api_key)

    async def analyze_image(self, image_bytes: bytes, mime_type: str = "image/jpeg") -> dict:
        """Send an image to Gemini and get a recycling analysis."""
        PROMPT = """Look at this image and describe the object. If it is recyclable, briefly explain why, if it is not, then explain why it is not recyclable.
                    Respond with ONLY a valid JSON object — no markdown fences, no extra text, no explanation outside the JSON. Use this exact format:
                    {"label": "<short item name>", "confidence": <number 0.0 to 1.0>, "is_recyclable": <true or false>, "explanation": "<one sentence describing the item and its material, then one sentence on whether and how to recycle it>"}"""
        
        response = self.client.models.generate_content(
            model="gemini-3-flash-preview",
            contents=[
                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type=mime_type,
                ),
                PROMPT
            ],
        )

        text = response.text.strip()
        # Strip markdown fences if Gemini wraps the JSON
        if text.startswith("```"):
            text = text.split("\n", 1)[1]
            text = text.rsplit("```", 1)[0].strip()

        try:
            return json.loads(text)
        except (json.JSONDecodeError, KeyError):
            logger.warning("Gemini returned unparseable response: %s", response.text)
            return {
                "label": "unknown item",
                "confidence": 0.0,
                "is_recyclable": False,
                "explanation": "Could not analyze the image. Please try again with a clearer photo.",
            }