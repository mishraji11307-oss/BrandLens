from sqlalchemy import Column, String, Integer, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class Finding(BaseModel):
    __tablename__ = "findings"
    
    submission_id = Column(String(36), ForeignKey("content_submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id = Column(String(50), nullable=True, index=True)
    
    category = Column(String(50), nullable=False)  # terminology, tone, claims, disclaimer, accessibility, visual
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    original_text = Column(Text, nullable=False)  # Exact text snippet identified
    severity = Column(String(20), default="high")  # critical, high, medium, low
    confidence = Column(Float, default=0.92)
    explanation = Column(Text, nullable=False)
    
    # Traceable Source Metadata
    source_document = Column(String(255), nullable=True)
    source_section = Column(String(100), nullable=True)
    source_page = Column(Integer, default=1)
    rule_code = Column(String(50), nullable=True)
    evidence_text = Column(Text, nullable=True)
    
    suggested_fix = Column(Text, nullable=True)
    custom_fix = Column(Text, nullable=True)  # Populated when creator edits
    
    # Status: open, accepted, edited, dismissed, disputed
    status = Column(String(30), default="open", index=True)
    action_reason = Column(Text, nullable=True)  # Reason provided on dismiss/dispute
    
    # Engine type: "deterministic" or "ai_contextual"
    detection_layer = Column(String(50), default="deterministic")
    
    # Relationships
    submission = relationship("ContentSubmission", back_populates="findings")
    actions = relationship("FindingAction", back_populates="finding", cascade="all, delete-orphan")

class FindingAction(BaseModel):
    __tablename__ = "finding_actions"
    
    finding_id = Column(String(36), ForeignKey("findings.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String(30), nullable=False)  # ACCEPT, EDIT, DISMISS, DISPUTE
    reason = Column(Text, nullable=True)
    applied_replacement = Column(Text, nullable=True)
    
    finding = relationship("Finding", back_populates="actions")

