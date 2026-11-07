from sqlalchemy import Column, String, Integer, Text, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class ContentSubmission(BaseModel):
    __tablename__ = "content_submissions"
    
    org_id = Column(String(36), ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    brand_kit_id = Column(String(36), ForeignKey("brand_kits.id", ondelete="CASCADE"), nullable=False, index=True)
    creator_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    title = Column(String(200), nullable=False)
    campaign_name = Column(String(100), nullable=True)
    content_category = Column(String(50), default="Social Media")
    publishing_channel = Column(String(50), default="Instagram")
    
    # Original content preserved intact
    original_text = Column(Text, nullable=False)
    file_name = Column(String(255), nullable=True)
    file_type = Column(String(50), nullable=True)
    file_size = Column(Integer, nullable=True)
    
    # Working revision text (modifications from accepted fixes / edits applied here)
    working_text = Column(Text, nullable=False)
    
    # Workflow State
    # Draft -> Reviewing -> Changes Requested -> Resubmitted -> Pending Approval -> Approved / Rejected
    status = Column(String(30), default="Draft", index=True)
    
    # Scoring & Review Summary
    compliance_score = Column(Integer, default=100)
    compliance_details = Column(JSON, nullable=True)
    current_revision_number = Column(Integer, default=1)
    
    # Relationships
    organisation = relationship("Organisation", back_populates="submissions")
    brand_kit = relationship("BrandKit", back_populates="submissions")
    creator = relationship("User", back_populates="submissions")
    findings = relationship("Finding", back_populates="submission", cascade="all, delete-orphan")
    revisions = relationship("ContentRevision", back_populates="submission", cascade="all, delete-orphan")
    review_jobs = relationship("ReviewJob", back_populates="submission", cascade="all, delete-orphan")
    approval_requests = relationship("ApprovalRequest", back_populates="submission", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="submission", cascade="all, delete-orphan")

class ContentRevision(BaseModel):
    __tablename__ = "content_revisions"
    
    submission_id = Column(String(36), ForeignKey("content_submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    revision_number = Column(Integer, nullable=False)
    content_text = Column(Text, nullable=False)
    change_summary = Column(Text, nullable=True)
    compliance_score = Column(Integer, default=100)
    created_by_id = Column(String(36), nullable=False)
    
    submission = relationship("ContentSubmission", back_populates="revisions")

class ReviewJob(BaseModel):
    __tablename__ = "review_jobs"
    
    submission_id = Column(String(36), ForeignKey("content_submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(30), default="PENDING")  # PENDING, PROCESSING, COMPLETED, FAILED
    current_stage = Column(String(100), default="Initialized")
    total_findings_count = Column(Integer, default=0)
    critical_count = Column(Integer, default=0)
    high_count = Column(Integer, default=0)
    engine_details = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    submission = relationship("ContentSubmission", back_populates="review_jobs")

