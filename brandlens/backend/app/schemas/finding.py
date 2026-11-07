from typing import Optional, Dict, Any
from pydantic import BaseModel

class SourceMetadata(BaseModel):
    document_name: Optional[str] = "Brand Guidelines"
    section: Optional[str] = None
    page: Optional[int] = 1
    rule_id: Optional[str] = None
    evidence: Optional[str] = None

class FindingOut(BaseModel):
    id: str
    submission_id: str
    rule_id: Optional[str] = None
    category: str
    title: str
    description: str
    original_text: str
    severity: str
    confidence: float
    explanation: str
    source_document: Optional[str] = None
    source_section: Optional[str] = None
    source_page: Optional[int] = 1
    rule_code: Optional[str] = None
    evidence_text: Optional[str] = None
    suggested_fix: Optional[str] = None
    custom_fix: Optional[str] = None
    status: str = "open"  # open, accepted, edited, dismissed, disputed
    action_reason: Optional[str] = None
    detection_layer: str = "deterministic"

    class Config:
        from_attributes = True

class FindingActionRequest(BaseModel):
    action_type: str  # ACCEPT, EDIT, DISMISS, DISPUTE
    reason: Optional[str] = None
    custom_fix: Optional[str] = None

