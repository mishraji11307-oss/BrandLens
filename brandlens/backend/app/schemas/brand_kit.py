from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field

class RuleBase(BaseModel):
    rule_code: str
    category: str  # terminology, tone, claim, disclaimer, accessibility
    title: str
    description: str
    rule_type: str = "prohibited_term"
    prohibited_term: Optional[str] = None
    preferred_term: Optional[str] = None
    severity: str = "high"
    confidence: str = "0.95"
    suggested_fix: Optional[str] = None
    evidence_citation: Optional[str] = None
    is_active: bool = True

class RuleCreate(RuleBase):
    pass

class RuleOut(RuleBase):
    id: str
    brand_kit_id: str
    created_at: datetime
    class Config:
        from_attributes = True

class FactBase(BaseModel):
    fact_code: str
    name: str
    approved_value: str
    supporting_source: Optional[str] = None
    effective_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    status: str = "approved"

class FactCreate(FactBase):
    pass

class FactOut(FactBase):
    id: str
    brand_kit_id: str
    class Config:
        from_attributes = True

class ClaimBase(BaseModel):
    claim_code: str
    approved_statement: str
    conditions: Optional[str] = None
    supporting_evidence: Optional[str] = None
    source_document: Optional[str] = None
    applicable_product: Optional[str] = None
    status: str = "approved"

class ClaimCreate(ClaimBase):
    pass

class ClaimOut(ClaimBase):
    id: str
    brand_kit_id: str
    class Config:
        from_attributes = True

class AssetBase(BaseModel):
    asset_type: str
    name: str
    value: Optional[str] = None
    file_path: Optional[str] = None
    metadata_json: Optional[Any] = None

class AssetCreate(AssetBase):
    pass

class AssetOut(AssetBase):
    id: str
    brand_kit_id: str
    class Config:
        from_attributes = True

class BrandKitCreate(BaseModel):
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    target_audience: Optional[str] = None
    brand_personality: Optional[str] = None
    writing_style: Optional[str] = None

class BrandKitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    target_audience: Optional[str] = None
    brand_personality: Optional[str] = None
    writing_style: Optional[str] = None

class BrandKitOut(BaseModel):
    id: str
    org_id: str
    name: str
    description: Optional[str] = None
    industry: Optional[str] = None
    target_audience: Optional[str] = None
    brand_personality: Optional[str] = None
    writing_style: Optional[str] = None
    is_default: bool = True
    rules: List[RuleOut] = []
    approved_facts: List[FactOut] = []
    approved_claims: List[ClaimOut] = []
    assets: List[AssetOut] = []

    class Config:
        from_attributes = True

