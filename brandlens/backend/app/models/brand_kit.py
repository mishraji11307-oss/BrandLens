from sqlalchemy import Column, String, Boolean, Text, Integer, ForeignKey, JSON, DateTime
from sqlalchemy.orm import relationship
from app.models.base import BaseModel

class BrandKit(BaseModel):
    __tablename__ = "brand_kits"
    
    org_id = Column(String(36), ForeignKey("organisations.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    industry = Column(String(100), nullable=True)
    target_audience = Column(Text, nullable=True)
    brand_personality = Column(String(255), nullable=True)  # e.g., "Friendly, Scientific, Trustworthy"
    writing_style = Column(Text, nullable=True)
    is_default = Column(Boolean, default=True)
    
    # Relationships
    organisation = relationship("Organisation", back_populates="brand_kits")
    rules = relationship("BrandRule", back_populates="brand_kit", cascade="all, delete-orphan")
    documents = relationship("BrandDocument", back_populates="brand_kit", cascade="all, delete-orphan")
    approved_facts = relationship("ApprovedFact", back_populates="brand_kit", cascade="all, delete-orphan")
    approved_claims = relationship("ApprovedClaim", back_populates="brand_kit", cascade="all, delete-orphan")
    assets = relationship("BrandAsset", back_populates="brand_kit", cascade="all, delete-orphan")
    submissions = relationship("ContentSubmission", back_populates="brand_kit")

class BrandRule(BaseModel):
    __tablename__ = "brand_rules"
    
    brand_kit_id = Column(String(36), ForeignKey("brand_kits.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_code = Column(String(50), index=True, nullable=False)  # e.g., RULE-001, TERM-002
    category = Column(String(50), nullable=False)  # terminology, tone, claim, disclaimer, accessibility
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Rule matching parameters
    rule_type = Column(String(50), default="prohibited_term")  # prohibited_term, preferred_term, required_term, disclaimer, tone
    pattern = Column(String(255), nullable=True)  # regex or keyword
    prohibited_term = Column(String(255), nullable=True)
    preferred_term = Column(String(255), nullable=True)
    severity = Column(String(20), default="high")  # critical, high, medium, low
    confidence = Column(String(10), default="0.95")
    suggested_fix = Column(Text, nullable=True)
    evidence_citation = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    brand_kit = relationship("BrandKit", back_populates="rules")

class BrandDocument(BaseModel):
    __tablename__ = "brand_documents"
    
    brand_kit_id = Column(String(36), ForeignKey("brand_kits.id", ondelete="CASCADE"), nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    version = Column(String(20), default="1.0")
    total_pages = Column(Integer, default=1)
    is_processed = Column(Boolean, default=False)
    
    brand_kit = relationship("BrandKit", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(BaseModel):
    __tablename__ = "document_chunks"
    
    document_id = Column(String(36), ForeignKey("brand_documents.id", ondelete="CASCADE"), nullable=False, index=True)
    brand_kit_id = Column(String(36), index=True, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    section = Column(String(100), nullable=True)
    page_number = Column(Integer, default=1)
    content = Column(Text, nullable=False)
    metadata_json = Column(JSON, nullable=True)  # Store tags, rule refs
    embedding = Column(JSON, nullable=True)      # Stored vector for cosine similarity fallback or pgvector
    
    document = relationship("BrandDocument", back_populates="chunks")

class ApprovedFact(BaseModel):
    __tablename__ = "approved_facts"
    
    brand_kit_id = Column(String(36), ForeignKey("brand_kits.id", ondelete="CASCADE"), nullable=False, index=True)
    fact_code = Column(String(50), index=True, nullable=False)  # e.g., FACT-01
    name = Column(String(200), nullable=False)
    approved_value = Column(Text, nullable=False)
    supporting_source = Column(String(255), nullable=True)
    effective_date = Column(DateTime, nullable=True)
    expiry_date = Column(DateTime, nullable=True)
    status = Column(String(20), default="approved")  # approved, expired, draft
    
    brand_kit = relationship("BrandKit", back_populates="approved_facts")

class ApprovedClaim(BaseModel):
    __tablename__ = "approved_claims"
    
    brand_kit_id = Column(String(36), ForeignKey("brand_kits.id", ondelete="CASCADE"), nullable=False, index=True)
    claim_code = Column(String(50), index=True, nullable=False)  # e.g., AC-12
    approved_statement = Column(Text, nullable=False)
    conditions = Column(Text, nullable=True)  # e.g., "Requires 2 weeks consistent use"
    supporting_evidence = Column(Text, nullable=True)
    source_document = Column(String(255), nullable=True)
    applicable_product = Column(String(100), nullable=True)
    status = Column(String(20), default="approved")
    
    brand_kit = relationship("BrandKit", back_populates="approved_claims")

class BrandAsset(BaseModel):
    __tablename__ = "brand_assets"
    
    brand_kit_id = Column(String(36), ForeignKey("brand_kits.id", ondelete="CASCADE"), nullable=False, index=True)
    asset_type = Column(String(50), nullable=False)  # logo_primary, logo_secondary, color_palette, font
    name = Column(String(100), nullable=False)
    value = Column(Text, nullable=True)  # Hex colors JSON or font family
    file_path = Column(String(500), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    
    brand_kit = relationship("BrandKit", back_populates="assets")

