from sqlalchemy import Column, String, Integer, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class ApprovalRequest(BaseModel):
    __tablename__ = "approval_requests"
    
    submission_id = Column(String(36), ForeignKey("content_submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    requested_by_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewed_by_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    revision_number = Column(Integer, default=1)
    status = Column(String(30), default="Pending Approval", index=True)  # Pending Approval, Approved, Rejected, Changes Requested
    decision = Column(String(30), nullable=True)  # APPROVED, REJECTED, CHANGES_REQUESTED
    decision_reason = Column(Text, nullable=True)
    creator_notes = Column(Text, nullable=True)
    
    submission = relationship("ContentSubmission", back_populates="approval_requests")

class Comment(BaseModel):
    __tablename__ = "comments"
    
    submission_id = Column(String(36), ForeignKey("content_submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    author_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    comment_text = Column(Text, nullable=False)
    comment_type = Column(String(30), default="review_note")  # review_note, creator_reply, change_request
    
    submission = relationship("ContentSubmission", back_populates="comments")
    author = relationship("User", back_populates="comments")

class Notification(BaseModel):
    __tablename__ = "notifications"
    
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")  # review_completed, critical_issue, approval_decision, comment
    resource_id = Column(String(36), nullable=True)
    is_read = Column(Boolean, default=False)

