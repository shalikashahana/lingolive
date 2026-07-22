from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    firebase_service_account_json: str = "./firebase-service-account.json"
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    gemma_api_base_url: str = ""
    gemma_api_key: str = ""
    frontend_origin: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
