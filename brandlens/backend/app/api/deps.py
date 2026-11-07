from typing import Optional, List
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import decode_token, UserRole
from app.database.session import get_db
from app.models.user import User
from app.models.organisation import OrganisationMember

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Extracts and authenticates user from Bearer token.
    Falls back to Demo Judge user if in demo mode and no token provided.
    """
    token_str = token
    if not token_str and authorization and authorization.startswith("Bearer "):
        token_str = authorization.split(" ")[1]

    if not token_str:
        # If demo mode is enabled, fallback to default demo creator/judge user
        if settings.ENABLE_PUBLIC_DEMO:
            judge = db.query(User).filter(User.email == "judge@demo.brandlens.ai").first()
            if judge:
                return judge
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided."
        )

    payload = decode_token(token_str)
    if not payload or not payload.get("sub"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token."
        )

    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found or disabled."
        )
    return user

def require_roles(allowed_roles: List[str]):
    """
    Enforces Role-Based Access Control (RBAC).
    """
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Requires role in: {allowed_roles}"
            )
        return current_user
    return role_checker

