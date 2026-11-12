from typing import List, Optional
import os
import json
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.brand_kit import (
    BrandKit,
    BrandRule,
    BrandDocument,
    DocumentChunk,
    ApprovedFact,
    ApprovedClaim,
    BrandAsset
)
from app.models.organisation import OrganisationMember
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.brand_kit import (
    BrandKitCreate,
    BrandKitUpdate,
    BrandKitOut,
    RuleCreate,
    RuleOut,
    FactCreate,
    FactOut,
    ClaimCreate,
    ClaimOut,
    AssetCreate,
    AssetOut
)
from pydantic import BaseModel
from app.document_processing.extractor import DocumentExtractor
from app.core.config import settings
from app.api.deps import get_current_user, require_roles
from app.services.brand_generator import BrandKitGeneratorService

class UrlGenerateRequest(BaseModel):
    url: str
    apply_to_kit_id: Optional[str] = None

class RegulatoryPackToggleRequest(BaseModel):
    pack_id: str
    is_active: bool

router = APIRouter(prefix="/brand-kits", tags=["Brand Kits"])

AVAILABLE_REGULATORY_PACKS = [
    {
        "id": "ASCI",
        "name": "ASCI Digital Influencer & Marketing Code (India)",
        "jurisdiction": "India",
        "badge": "ASCI India",
        "description": "Enforces Clause 1 upfront #Ad/#Collab disclosures and Chapter I.1 verified claims against unbacked market leadership superlatives.",
        "rules_count": 2,
        "clauses": [
            "Clause 1: Upfront Disclosure (#Ad / #Collab within first 80 characters)",
            "Chapter I.1: Honest Representations & Audited Superlative Claims"
        ]
    },
    {
        "id": "FTC",
        "name": "FTC Endorsement & Testimonial Guides (US - 16 CFR Part 255)",
        "jurisdiction": "United States",
        "badge": "FTC US",
        "description": "Enforces clear and conspicuous #Sponsored / #Ad disclosures for affiliate promotions and commercial brand collaborations.",
        "rules_count": 1,
        "clauses": [
            "16 CFR § 255.5: Mandatory Disclosure of Material Connections & Incentives"
        ]
    },
    {
        "id": "HEALTH_CLAIMS",
        "name": "CDSCO & FDA Health & Cosmetic Claims Standard",
        "jurisdiction": "Global / US / India",
        "badge": "FDA & CDSCO",
        "description": "Strictly demarcates cosmetic beautifying claims from pharmaceutical drug claims. Flags curative disease promises without clinical trial certification.",
        "rules_count": 3,
        "clauses": [
            "Section 4.1: Curative Drug Claims vs Cosmetic Beautifying Statements",
            "Section 3.2: Prohibition of Absolute Outcome Guarantees",
            "Mandatory Clinical Trial Dossier Verification"
        ]
    }
]

@router.post("/generate-from-url")
def generate_brand_kit_from_url(
    req: UrlGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Intelligent Autonomous Brand Kit Auto-Generator.
    Crawls URL metadata and derives complete brand personality, color palettes,
    rules, facts, and approved claims.
    """
    profile = BrandKitGeneratorService.generate_from_url(req.url)
    
    if req.apply_to_kit_id:
        kit = db.query(BrandKit).filter(BrandKit.id == req.apply_to_kit_id).first()
        if kit:
            kit.name = profile["name"]
            kit.industry = profile["industry"]
            kit.target_audience = profile["target_audience"]
            kit.brand_personality = profile["brand_personality"]
            kit.writing_style = profile["writing_style"]
            
            # Update or create color palette asset
            asset = db.query(BrandAsset).filter(
                BrandAsset.brand_kit_id == kit.id,
                BrandAsset.asset_type == "color_palette"
            ).first()
            if asset:
                asset.value = json.dumps(profile["palette"])
            else:
                asset = BrandAsset(
                    brand_kit_id=kit.id,
                    asset_type="color_palette",
                    name="Official Brand Palette",
                    value=json.dumps(profile["palette"])
                )
                db.add(asset)
                
            # Add starter rules if not already present
            for r in profile.get("rules", []):
                existing = db.query(BrandRule).filter(
                    BrandRule.brand_kit_id == kit.id,
                    BrandRule.rule_code == r["rule_code"]
                ).first()
                if not existing:
                    new_rule = BrandRule(
                        brand_kit_id=kit.id,
                        rule_code=r["rule_code"],
                        title=r["title"],
                        pattern=r.get("pattern"),
                        severity=r["severity"],
                        category=r["category"],
                        suggested_fix=r.get("suggested_fix", ""),
                        evidence_citation=r.get("citation", ""),
                        is_active=True
                    )
                    db.add(new_rule)
                    
            # Add starter facts
            for f in profile.get("facts", []):
                existing_f = db.query(ApprovedFact).filter(
                    ApprovedFact.brand_kit_id == kit.id,
                    ApprovedFact.fact_code == f["fact_code"]
                ).first()
                if not existing_f:
                    new_fact = ApprovedFact(
                        brand_kit_id=kit.id,
                        fact_code=f["fact_code"],
                        name=f["title"],
                        approved_value=f["statement"],
                        supporting_source=f["source"],
                        status="approved"
                    )
                    db.add(new_fact)

            # Add starter claims
            for c in profile.get("claims", []):
                existing_c = db.query(ApprovedClaim).filter(
                    ApprovedClaim.brand_kit_id == kit.id,
                    ApprovedClaim.claim_code == c["claim_code"]
                ).first()
                if not existing_c:
                    new_claim = ApprovedClaim(
                        brand_kit_id=kit.id,
                        claim_code=c["claim_code"],
                        approved_statement=c["claim_text"],
                        conditions=c.get("conditions", ""),
                        supporting_evidence=c.get("supporting_evidence", ""),
                        status="approved"
                    )
                    db.add(new_claim)
                    
            # Audit log
            log = AuditLog(
                org_id=kit.org_id,
                user_id=current_user.id,
                action="BRAND_KIT_AUTO_GENERATED",
                resource_type="brand_kit",
                resource_id=kit.id,
                details={"source_url": req.url, "brand": profile["name"]}
            )
            db.add(log)
            db.commit()
            db.refresh(kit)
            
    return {
        "status": "success",
        "message": f"Brand Kit synthesized successfully from {req.url}",
        "profile": profile
    }

@router.get("", response_model=List[BrandKitOut])
def get_brand_kits(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Returns all brand kits for user's organization."""
    membership = db.query(OrganisationMember).filter(OrganisationMember.user_id == current_user.id).first()
    org_id = membership.org_id if membership else None
    
    if not org_id:
        kit = db.query(BrandKit).first()
        return [kit] if kit else []

    kits = db.query(BrandKit).filter(BrandKit.org_id == org_id).all()
    return kits

@router.get("/{id}", response_model=BrandKitOut)
def get_brand_kit(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieves complete details of a specific brand kit."""
    kit = db.query(BrandKit).filter(BrandKit.id == id).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Brand Kit not found.")
    return kit

@router.post("", response_model=BrandKitOut)
def create_brand_kit(
    kit_in: BrandKitCreate,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Creates a new brand kit."""
    membership = db.query(OrganisationMember).filter(OrganisationMember.user_id == current_user.id).first()
    if not membership:
        raise HTTPException(status_code=400, detail="User does not belong to an organisation.")

    kit = BrandKit(
        org_id=membership.org_id,
        name=kit_in.name,
        description=kit_in.description,
        industry=kit_in.industry,
        target_audience=kit_in.target_audience,
        brand_personality=kit_in.brand_personality,
        writing_style=kit_in.writing_style,
        is_default=False
    )
    db.add(kit)
    db.commit()
    db.refresh(kit)
    return kit

@router.put("/{id}", response_model=BrandKitOut)
def update_brand_kit(
    id: str,
    kit_update: BrandKitUpdate,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Updates brand identity and tone settings."""
    kit = db.query(BrandKit).filter(BrandKit.id == id).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Brand Kit not found.")

    for field, val in kit_update.dict(exclude_unset=True).items():
        setattr(kit, field, val)

    db.commit()
    db.refresh(kit)
    return kit

@router.get("/{id}/rules", response_model=List[RuleOut])
def get_rules(id: str, db: Session = Depends(get_db)):
    """Retrieves all rules for the brand kit."""
    return db.query(BrandRule).filter(BrandRule.brand_kit_id == id).all()

@router.post("/{id}/rules", response_model=RuleOut)
def add_rule(
    id: str,
    rule_in: RuleCreate,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Adds a new prohibited, preferred, or tone rule."""
    kit = db.query(BrandKit).filter(BrandKit.id == id).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Brand Kit not found.")

    rule = BrandRule(
        brand_kit_id=id,
        rule_code=rule_in.rule_code,
        category=rule_in.category,
        title=rule_in.title,
        description=rule_in.description,
        rule_type=rule_in.rule_type,
        prohibited_term=rule_in.prohibited_term,
        preferred_term=rule_in.preferred_term,
        severity=rule_in.severity,
        confidence=rule_in.confidence,
        suggested_fix=rule_in.suggested_fix,
        evidence_citation=rule_in.evidence_citation,
        is_active=rule_in.is_active
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule

@router.post("/{id}/facts", response_model=FactOut)
def add_fact(
    id: str,
    fact_in: FactCreate,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Adds a verified marketing fact."""
    fact = ApprovedFact(
        brand_kit_id=id,
        fact_code=fact_in.fact_code,
        name=fact_in.name,
        approved_value=fact_in.approved_value,
        supporting_source=fact_in.supporting_source,
        effective_date=fact_in.effective_date,
        expiry_date=fact_in.expiry_date,
        status=fact_in.status
    )
    db.add(fact)
    db.commit()
    db.refresh(fact)
    return fact

@router.post("/{id}/claims", response_model=ClaimOut)
def add_claim(
    id: str,
    claim_in: ClaimCreate,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Adds an approved marketing claim statement."""
    claim = ApprovedClaim(
        brand_kit_id=id,
        claim_code=claim_in.claim_code,
        approved_statement=claim_in.approved_statement,
        conditions=claim_in.conditions,
        supporting_evidence=claim_in.supporting_evidence,
        source_document=claim_in.source_document,
        applicable_product=claim_in.applicable_product,
        status=claim_in.status
    )
    db.add(claim)
    db.commit()
    db.refresh(claim)
    return claim

@router.post("/{id}/assets", response_model=AssetOut)
def add_asset(
    id: str,
    asset_in: AssetCreate,
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """Adds brand asset metadata (color palette, logos, typography)."""
    asset = BrandAsset(
        brand_kit_id=id,
        asset_type=asset_in.asset_type,
        name=asset_in.name,
        value=asset_in.value,
        file_path=asset_in.file_path,
        metadata_json=asset_in.metadata_json
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return asset

@router.post("/{id}/documents")
async def upload_guideline_document(
    id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(require_roles(["ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Uploads a Brand Guidelines document (PDF/DOCX), validates its signature,
    extracts pages, chunks content, and stores chunks for RAG vector retrieval.
    """
    kit = db.query(BrandKit).filter(BrandKit.id == id).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Brand Kit not found.")

    contents = await file.read()
    if len(contents) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size exceeds maximum permitted limit.")

    try:
        extracted = DocumentExtractor.extract_content(contents, file.filename)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    safe_filename = f"{kit.id}_{os.path.basename(file.filename)}"
    file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    doc = BrandDocument(
        brand_kit_id=kit.id,
        filename=file.filename,
        file_type=extracted["file_type"],
        file_size=len(contents),
        file_path=file_path,
        total_pages=extracted.get("pages", 1),
        is_processed=True
    )
    db.add(doc)
    db.flush()

    text = extracted.get("text", "")
    paragraphs = [p.strip() for p in text.split("\n\n") if len(p.strip()) > 30]
    
    for idx, p in enumerate(paragraphs[:10], start=1):
        chunk = DocumentChunk(
            document_id=doc.id,
            brand_kit_id=kit.id,
            chunk_index=idx,
            section=f"Section {idx}",
            page_number=min(idx, extracted.get("pages", 1)),
            content=p,
            metadata_json={"source": file.filename}
        )
        db.add(chunk)

    db.commit()
    return {
        "message": "Brand guidelines document successfully uploaded and indexed for RAG vector search.",
        "document_id": doc.id,
        "filename": doc.filename,
        "chunks_indexed": min(len(paragraphs), 10)
    }

@router.get("/{id}/regulatory-packs")
def get_regulatory_packs(id: str, db: Session = Depends(get_db)):
    """
    Module: Regulatory Packs (ASCI, FTC, Health Claims)
    Retrieves active and available regulatory compliance packs for this Brand Kit.
    """
    asset = db.query(BrandAsset).filter(
        BrandAsset.brand_kit_id == id,
        BrandAsset.asset_type == "regulatory_packs"
    ).first()
    
    active_ids = ["ASCI", "FTC", "HEALTH_CLAIMS"]
    if asset and asset.value:
        try:
            active_ids = json.loads(asset.value)
        except Exception:
            pass

    packs = []
    for p in AVAILABLE_REGULATORY_PACKS:
        packs.append({
            **p,
            "is_active": p["id"] in active_ids
        })

    return {
        "brand_kit_id": id,
        "active_pack_ids": active_ids,
        "packs": packs
    }

@router.post("/{id}/regulatory-packs/toggle")
def toggle_regulatory_pack(
    id: str,
    req: RegulatoryPackToggleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Toggles activation of standard regulatory rule packs (ASCI, FTC, Health Claims).
    """
    kit = db.query(BrandKit).filter(BrandKit.id == id).first()
    if not kit:
        raise HTTPException(status_code=404, detail="Brand Kit not found.")

    asset = db.query(BrandAsset).filter(
        BrandAsset.brand_kit_id == id,
        BrandAsset.asset_type == "regulatory_packs"
    ).first()

    active_ids = ["ASCI", "FTC", "HEALTH_CLAIMS"]
    if asset and asset.value:
        try:
            active_ids = json.loads(asset.value)
        except Exception:
            pass

    if req.is_active:
        if req.pack_id not in active_ids:
            active_ids.append(req.pack_id)
    else:
        active_ids = [pid for pid in active_ids if pid != req.pack_id]

    if asset:
        asset.value = json.dumps(active_ids)
    else:
        asset = BrandAsset(
            brand_kit_id=id,
            asset_type="regulatory_packs",
            name="Active Regulatory Rule Packs",
            value=json.dumps(active_ids)
        )
        db.add(asset)

    db.add(AuditLog(
        org_id=kit.org_id,
        user_id=current_user.id,
        action="REGULATORY_PACK_TOGGLED",
        resource_type="brand_kit",
        resource_id=kit.id,
        details={"pack_id": req.pack_id, "is_active": req.is_active, "active_packs": active_ids}
    ))

    db.commit()
    return {
        "status": "success",
        "pack_id": req.pack_id,
        "is_active": req.is_active,
        "active_pack_ids": active_ids
    }
