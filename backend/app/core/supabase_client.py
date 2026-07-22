from supabase import create_client, Client
from .config import settings

try:
    supabase: Client = create_client(
        settings.supabase_url, settings.supabase_service_role_key
    )
except Exception as e:
    print(f"Warning: Supabase client init failed ({e}). Backend will run without Supabase connection.")
    supabase = None
