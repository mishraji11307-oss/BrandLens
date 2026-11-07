from sqlalchemy import Column, String, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class AuditLog(BaseModel):
    __tablename__ = "audit_logs"
    
    org_id = Column(String(36), ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String(100), nullable=False)  # USER_LOGIN, CONTENT_UPLOAD, AI_REVIEW_RUN, FINDING_ACCEPTED, APPROVAL_GRANTED, etc.
    resource_type = Column(String(50), nullable=False)  # content, brand_kit, finding, approval, auth
    resource_id = Column(String(36), nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    
    organisation = relationship("Organisation", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")

