from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel
from app.schemas.finding import FindingOut

class ContentUploadRequest(BaseModel):
    title: str
    text_content: Optional[str] = None
    campaign_name: Optional[str] = None
    content_category: Optional[str] = "Social Media"
    publishing_channel: Optional[str] = "Instagram"
    brand_kit_id: Optional[str] = None

class ContentSubmissionOut(BaseModel):
    id: str
    org_id: str
    brand_kit_id: str
    creator_id: str
    title: str
    campaign_name: Optional[str] = None
    content_category: str
    publishing_channel: str
    original_text: str
    working_text: str
    status: str
    compliance_score: int
    compliance_details: Optional[Dict[str, Any]] = None
    current_revision_number: int
    created_at: datetime
    updated_at: datetime
    findings: List[FindingOut] = []

    class Config:
        from_attributes = True

class RewriteRequest(BaseModel):
    text: str
    brand_kit_id: Optional[str] = None

class RewriteOption(BaseModel):
    title: str
    text: str
    explanation: str

class RewriteResponse(BaseModel):
    options: Dict[str, RewriteOption]

