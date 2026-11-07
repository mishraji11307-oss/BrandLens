from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import verify_password, get_password_hash, create_access_token
from app.database.session import get_db
from app.models.user import User
from app.models.organisation import Organisation, OrganisationMember
from app.models.audit import AuditLog
from app.schemas.auth import UserRegister, UserLogin, UserOut, Token
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(user_in: UserRegister, request: Request, db: Session = Depends(get_db)):
    """Registers a new user and creates their organization."""
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Create user
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role or "CREATOR",
        is_active=True
    )
    db.add(user)
    db.flush()

    # Create organisation
    org_name = user_in.org_name or f"{user_in.full_name}'s Brand"
    import re
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', org_name.lower()).strip('-') + f"-{user.id[:6]}"
    org = Organisation(name=org_name, slug=slug, is_active=True)
    db.add(org)
    db.flush()

    # Add membership
    db.add(OrganisationMember(org_id=org.id, user_id=user.id, role=user.role))
    
    # Audit log
    db.add(AuditLog(
        org_id=org.id,
        user_id=user.id,
        action="USER_REGISTERED",
        resource_type="auth",
        resource_id=user.id,
        ip_address=request.client.host if request.client else "127.0.0.1"
    ))
    db.commit()

    token = create_access_token(user.id, role=user.role, org_id=org.id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "org_id": org.id,
            "org_name": org.name,
            "is_demo": False
        }
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticates user with email and password."""
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )

    membership = db.query(OrganisationMember).filter(OrganisationMember.user_id == user.id).first()
    org_id = membership.org_id if membership else None
    org = db.query(Organisation).filter(Organisation.id == org_id).first() if org_id else None

    # Audit log
    if org_id:
        db.add(AuditLog(
            org_id=org_id,
            user_id=user.id,
            action="USER_LOGIN",
            resource_type="auth",
            resource_id=user.id,
            ip_address=request.client.host if request.client else "127.0.0.1"
        ))
        db.commit()

    token = create_access_token(user.id, role=user.role, org_id=org_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "org_id": org_id,
            "org_name": org.name if org else "Default",
            "is_demo": user.is_demo
        }
    }

@router.post("/demo-login", response_model=Token)
def demo_login(role: str = "CREATOR", db: Session = Depends(get_db)):
    """
    Public Demo Mode: Instantly logs in judges into GlowCare Skincare
    as either CREATOR, REVIEWER, or ADMIN without requiring a password.
    """
    role = role.upper()
    email_map = {
        "ADMIN": "admin@glowcare.com",
        "REVIEWER": "reviewer@glowcare.com",
        "CREATOR": "judge@demo.brandlens.ai"
    }
    target_email = email_map.get(role, "judge@demo.brandlens.ai")
    user = db.query(User).filter(User.email == target_email).first()
    
    if not user:
        # Fallback to any user
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="Demo environment not seeded.")

    membership = db.query(OrganisationMember).filter(OrganisationMember.user_id == user.id).first()
    org_id = membership.org_id if membership else None
    org = db.query(Organisation).filter(Organisation.id == org_id).first() if org_id else None

    token = create_access_token(user.id, role=user.role, org_id=org_id)
    return {
        "access_token": token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "org_id": org_id,
            "org_name": org.name if org else "GlowCare Skincare",
            "is_demo": True
        }
    }

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns profile of the currently logged-in user."""
    membership = db.query(OrganisationMember).filter(OrganisationMember.user_id == current_user.id).first()
    org_id = membership.org_id if membership else None
    org = db.query(Organisation).filter(Organisation.id == org_id).first() if org_id else None
    
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "org_id": org_id,
        "org_name": org.name if org else None,
        "is_demo": current_user.is_demo
    }

@router.post("/logout")
def logout():
    """Logs out current user."""
    return {"message": "Successfully logged out."}

