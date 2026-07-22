import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from .config import settings

# Initialize the Firebase Admin app once
if not firebase_admin._apps:
    try:
        cred = credentials.Certificate(settings.firebase_service_account_json)
        firebase_admin.initialize_app(cred)
    except Exception as e:
        print(f"Warning: Firebase Admin initialization skipped/failed: {e}")

bearer_scheme = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """Verify the Firebase ID token sent from the React frontend and
    return the decoded token (contains uid, email, etc.)."""
    token = credentials.credentials
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token.",
        )
