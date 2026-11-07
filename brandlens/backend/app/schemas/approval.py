from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class ApprovalActionRequest(BaseModel):
    decision: str  # APPROVED, REJECTED, CHANGES_REQUESTED
    decision_reason: str
    comments: Optional[str] = None

class CommentCreate(BaseModel):
    comment_text: str
    comment_type: str = "review_note"

class CommentOut(BaseModel):
    id: str
    submission_id: str
    author_id: str
    author_name: Optional[str] = None
    comment_text: str
    comment_type: str
    created_at: datetime

    class Config:
        from_attributes = True

class ApprovalOut(BaseModel):
    id: str
    submission_id: str
    submission_title: Optional[str] = None
    creator_name: Optional[str] = None
    requested_by_id: str
    reviewed_by_id: Optional[str] = None
    revision_number: int
    status: str
    decision: Optional[str] = None
    decision_reason: Optional[str] = None
    creator_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

