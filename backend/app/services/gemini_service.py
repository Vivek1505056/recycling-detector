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
        PROMPT = """You are an expert in waste sorting and recycling systems.

Analyze the object in the provided image and determine whether it is recyclable in a typical North American municipal recycling system.

Consider the following factors carefully:
- Material type (plastic, glass, paper, metal, mixed materials)
- Whether the item appears contaminated (food residue, liquids, grease, dirt)
- Whether the item is made from multiple materials that are difficult to separate
- Common recycling rules for household recycling bins

Respond in JSON format with the following fields:

{
  "label": "name of the object",
  "material": "estimated primary material",
  "is_recyclable": true or false,
  "confidence": number between 0 and 1,
  "contamination_detected": true or false,
  "explanation": "short explanation of why the item is or is not recyclable",
  "recycling_advice": "what the user should do with the item (rinse, trash, special drop-off, etc)"
}

Important guidelines:
- If the item is recyclable but contaminated, mark recyclable as false and explain that it must be cleaned.
- If uncertain, choose the most likely classification and explain.
- Keep explanations short and practical for users."}"""
        
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