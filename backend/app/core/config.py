from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Recycling Classifier API"
    app_env: str = "development"
    allowed_origins: str = Field(alis="ALLOWED_ORIGINS")
    gemini_api_key: str = Field(alias="GEMINI_API_KEY")
    yolo_model_path: str = ""


    
    model_config = SettingsConfigDict(
        env_file=".env",
    )



settings = Settings()
