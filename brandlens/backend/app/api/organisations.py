from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.organisation import Organisation, OrganisationMember
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/organisations", tags=["Organisations"])

@router.get("")
def list_organisations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """List organisations accessible by current user."""
    memberships = db.query(OrganisationMember).filter(OrganisationMember.user_id == current_user.id).all()
    org_ids = [m.org_id for m in memberships]
    orgs = db.query(Organisation).filter(Organisation.id.in_(org_ids)).all()
    return orgs

@router.get("/{id}")
def get_organisation(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    org = db.query(Organisation).filter(Organisation.id == id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organisation not found.")
    return org

