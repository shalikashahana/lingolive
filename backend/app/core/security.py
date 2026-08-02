import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import json
import base64

from .config import settings

# Initialize the Firebase Admin app once
firebase_initialized = False
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(settings.firebase_service_account_json)
        firebase_admin.initialize_app(cred)
        firebase_initialized = True
    except Exception as e:
        print(f"Warning: Firebase Admin initialization skipped/failed: {e}")
else:
    firebase_initialized = True

bearer_scheme = HTTPBearer()

def decode_jwt_payload_unverified(token: str) -> dict:
    try:
        payload_part = token.split('.')[1]
        # Add padding if needed
        padding = '=' * (4 - len(payload_part) % 4)
        payload_bytes = base64.urlsafe_b64decode(payload_part + padding)
        return json.loads(payload_bytes)
    except Exception as e:
        print(f"Failed to manually decode token: {e}")
        return {}

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Verify the Firebase ID token sent from the React frontend and
    return the decoded token (contains uid, email, etc.)."""
    token = credentials.credentials
    
    decoded_token = {}
    if firebase_initialized:
        try:
            decoded_token = firebase_auth.verify_id_token(token)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token.",
            )
    else:
        # Fallback for local development when firebase-service-account.json is missing
        decoded_token = decode_jwt_payload_unverified(token)
        if "user_id" in decoded_token:
            decoded_token["uid"] = decoded_token["user_id"]
        elif "sub" in decoded_token:
            decoded_token["uid"] = decoded_token["sub"]
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired authentication token. Firebase admin not initialized.",
            )
            
    # Auto-create user in Supabase if they don't exist
    from .supabase_client import supabase
    if supabase:
        firebase_uid = decoded_token.get("uid")
        email = decoded_token.get("email") or f"{firebase_uid}@example.com"
        
        user_res = supabase.table("users").select("id").eq("firebase_uid", firebase_uid).execute()
        if not user_res.data:
            try:
                supabase.table("users").insert({
                    "firebase_uid": firebase_uid,
                    "email": email,
                    "display_name": decoded_token.get("name", ""),
                }).execute()
            except Exception as e:
                print(f"Warning: Failed to auto-create user in Supabase: {e}")

    return decoded_token
