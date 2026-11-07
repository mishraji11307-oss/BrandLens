from sqlalchemy import Column, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Organisation(BaseModel):
    __tablename__ = "organisations"
    
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    is_demo = Column(Boolean, default=False)
    
    # Relationships
    members = relationship("OrganisationMember", back_populates="organisation", cascade="all, delete-orphan")
    brand_kits = relationship("BrandKit", back_populates="organisation", cascade="all, delete-orphan")
    submissions = relationship("ContentSubmission", back_populates="organisation", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="organisation", cascade="all, delete-orphan")

class OrganisationMember(BaseModel):
    __tablename__ = "organisation_members"
    
    org_id = Column(String(36), ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), default="CREATOR", nullable=False)  # ADMIN, CREATOR, REVIEWER
    is_active = Column(Boolean, default=True)
    
    organisation = relationship("Organisation", back_populates="members")
    user = relationship("User", back_populates="memberships")

