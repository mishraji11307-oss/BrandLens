import os
import json
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.content import ContentSubmission, ContentRevision, ReviewJob
from app.models.brand_kit import BrandKit, BrandRule, ApprovedFact, ApprovedClaim, BrandAsset
from app.models.finding import Finding
from app.models.approval import ApprovalRequest, Notification
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.content import (
    ContentUploadRequest,
    ContentSubmissionOut,
    RewriteRequest,
    RewriteResponse
)
from app.rules.engine import DeterministicRuleEngine
from app.rag.vector_store import RAGVectorStore
from app.ai.llm_analyzer import LLMAnalyzer
from app.core.scoring import calculate_compliance_score
from app.document_processing.extractor import DocumentExtractor
from app.services.ocr_service import ImageOcrService
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter(prefix="/content", tags=["Content"])

@router.get("", response_model=List[ContentSubmissionOut])
def list_submissions(
    channel: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Lists content submissions accessible to the current user."""
    query = db.query(ContentSubmission)
    if channel:
        query = query.filter(ContentSubmission.publishing_channel == channel)
    if status_filter:
        query = query.filter(ContentSubmission.status == status_filter)
    return query.order_by(ContentSubmission.created_at.desc()).all()

@router.get("/{id}", response_model=ContentSubmissionOut)
def get_submission(id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Retrieves single submission with findings and working revisions."""
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Content submission not found.")
    return sub

@router.get("/{id}/revisions")
def get_submission_revisions(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns chronological revision history for redline diff comparison (v1 vs v2, etc.).
    """
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Content submission not found.")

    revs = db.query(ContentRevision).filter(ContentRevision.submission_id == id).order_by(ContentRevision.revision_number.asc()).all()
    return [
        {
            "id": r.id,
            "revision_number": r.revision_number,
            "content_text": r.content_text,
            "change_summary": r.change_summary,
            "compliance_score": r.compliance_score,
            "created_at": r.created_at
        } for r in revs
    ]

@router.post("/ocr-extract")
async def extract_ocr_from_image(
    preset_type: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Slide 8 & 11 (Steps 1 & 2): Multimodal Image OCR Scanner.
    Extracts text printed on packaging or banner creative.
    Returns lines, extracted text, and confidence for user inspection and confirmation.
    """
    if file:
        file_bytes = await file.read()
        os.makedirs("uploads", exist_ok=True)
        safe_fname = os.path.basename(file.filename)
        temp_path = os.path.join("uploads", f"temp_scan_{safe_fname}")
        with open(temp_path, "wb") as f:
            f.write(file_bytes)
        result = ImageOcrService.extract_text_from_image(temp_path)
        sample_title = file.filename.rsplit(".", 1)[0].replace("_", " ").title()
    elif preset_type == "sunscreen_packaging":
        result = {
            "text": "GLOWCARE CLINICAL SKINCARE\nSPF 100+ Ultra Shield Sunscreen Lotion\nCures Sun Damage & Melasma in 7 Days\nGuaranteed 100% UV Block • 50ml / 1.7 fl.oz\nDermatologist Formulated • Made in India",
            "lines": [
                "GLOWCARE CLINICAL SKINCARE",
                "SPF 100+ Ultra Shield Sunscreen Lotion",
                "Cures Sun Damage & Melasma in 7 Days",
                "Guaranteed 100% UV Block • 50ml / 1.7 fl.oz",
                "Dermatologist Formulated • Made in India"
            ],
            "confidence": 0.94,
            "source": "packaging_ocr_engine",
            "detected_claims": ["Cures Sun Damage & Melasma in 7 Days", "Guaranteed 100% UV Block", "SPF 100+ Ultra Shield"]
        }
        sample_title = "GlowCare Ultra Shield Sunscreen Packaging"
    elif preset_type == "influencer_banner":
        result = {
            "text": "GLOWCARE SPECIAL PROMOTION\nOur miracle formulation cures blemishes in 7 days!\nGet 100% guaranteed results • Use discount code GLOW50\nShop now at glowcareskincare.com",
            "lines": [
                "GLOWCARE SPECIAL PROMOTION",
                "Our miracle formulation cures blemishes in 7 days!",
                "Get 100% guaranteed results • Use discount code GLOW50",
                "Shop now at glowcareskincare.com"
            ],
            "confidence": 0.96,
            "source": "banner_ad_ocr_engine",
            "detected_claims": ["cures blemishes in 7 days", "100% guaranteed results", "discount code GLOW50 (Missing #Ad)"]
        }
        sample_title = "Influencer Sponsored Banner Ad"
    else:
        result = {
            "text": "Our serum cures acne in 7 days! Get guaranteed results with our revolutionary formula.",
            "lines": [
                "Our serum cures acne in 7 days!",
                "Get guaranteed results with our revolutionary formula."
            ],
            "confidence": 0.92,
            "source": "smart_label_parser",
            "detected_claims": ["cures acne in 7 days", "guaranteed results"]
        }
        sample_title = "Clarifying Serum Packaging Copy"

    return {
        "status": "success",
        "title_suggestion": sample_title,
        "extracted_text": result.get("text", ""),
        "lines": result.get("lines", []),
        "confidence": result.get("confidence", 0.92),
        "source": result.get("source", "ocr_service"),
        "detected_claims": result.get("detected_claims", [])
    }

@router.post("/upload", response_model=ContentSubmissionOut)
async def upload_content(
    title: str = Form(...),
    campaign_name: Optional[str] = Form(None),
    content_category: Optional[str] = Form("Social Media"),
    publishing_channel: Optional[str] = Form("Instagram"),
    brand_kit_id: Optional[str] = Form(None),
    text_content: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits content for governance review via text input or document upload (PDF/DOCX/PNG/JPG).
    """
    if brand_kit_id:
        kit = db.query(BrandKit).filter(BrandKit.id == brand_kit_id).first()
    else:
        kit = db.query(BrandKit).first()

    if not kit:
        raise HTTPException(status_code=400, detail="No active Brand Kit available for governance analysis.")

    extracted_text = ""
    file_name = None
    file_type = "text/plain"
    file_size = 0

    if file:
        file_bytes = await file.read()
        if len(file_bytes) > settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Uploaded file exceeds size limits.")
        file_name = file.filename
        file_size = len(file_bytes)
        try:
            extracted = DocumentExtractor.extract_content(file_bytes, file.filename)
            extracted_text = extracted.get("text", "")
            file_type = extracted.get("file_type", "document")
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
    elif text_content:
        extracted_text = text_content.strip()
    else:
        raise HTTPException(status_code=400, detail="Must provide either text_content or an uploaded file.")

    if not extracted_text:
        raise HTTPException(status_code=400, detail="Submitted content has no readable text.")

    sub = ContentSubmission(
        org_id=kit.org_id,
        brand_kit_id=kit.id,
        creator_id=current_user.id,
        title=title,
        campaign_name=campaign_name,
        content_category=content_category or "Social Media",
        publishing_channel=publishing_channel or "Instagram",
        original_text=extracted_text,
        working_text=extracted_text,
        file_name=file_name,
        file_type=file_type,
        file_size=file_size,
        status="Draft",
        compliance_score=100,
        current_revision_number=1
    )
    db.add(sub)
    db.flush()

    rev = ContentRevision(
        submission_id=sub.id,
        revision_number=1,
        content_text=extracted_text,
        change_summary="Initial submission draft",
        compliance_score=100,
        created_by_id=current_user.id
    )
    db.add(rev)

    db.add(AuditLog(
        org_id=kit.org_id,
        user_id=current_user.id,
        action="CONTENT_UPLOADED",
        resource_type="content",
        resource_id=sub.id,
        details={"title": title, "channel": publishing_channel, "length": len(extracted_text)}
    ))

    db.commit()
    db.refresh(sub)
    return sub

@router.post("/review/{submission_id}", response_model=ContentSubmissionOut)
async def run_brand_review(
    submission_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Executes the Complete 3-Layer Hybrid AI Review Engine:
    Layer 1: Deterministic Rule Engine + Regulatory Packs (ASCI, FTC, Health Claims)
    Layer 2: RAG Vector Store (Retrieves relevant guidelines & claims with source citations)
    Layer 3: Contextual LLM Analysis (Tone, unsubstantiated claims, temporal exaggerations)
    """
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Content submission not found.")

    kit = db.query(BrandKit).filter(BrandKit.id == sub.brand_kit_id).first()
    if not kit:
        raise HTTPException(status_code=400, detail="Associated Brand Kit not found.")

    # Retrieve active regulatory packs
    asset = db.query(BrandAsset).filter(
        BrandAsset.brand_kit_id == kit.id,
        BrandAsset.asset_type == "regulatory_packs"
    ).first()
    active_packs = ["ASCI", "FTC", "HEALTH_CLAIMS"]
    if asset and asset.value:
        try:
            active_packs = json.loads(asset.value)
        except Exception:
            pass

    # Clear previous open findings for this submission
    db.query(Finding).filter(Finding.submission_id == sub.id, Finding.status == "open").delete()
    db.flush()

    # --- LAYER 1: DETERMINISTIC RULE ENGINE & REGULATORY PACKS ---
    rules = db.query(BrandRule).filter(BrandRule.brand_kit_id == kit.id, BrandRule.is_active == True).all()
    approved_facts = db.query(ApprovedFact).filter(ApprovedFact.brand_kit_id == kit.id).all()
    approved_claims = db.query(ApprovedClaim).filter(ApprovedClaim.brand_kit_id == kit.id).all()

    layer1_findings = DeterministicRuleEngine.run_checks(
        text=sub.working_text,
        rules=rules,
        approved_facts=approved_facts,
        approved_claims=approved_claims,
        active_regulatory_packs=active_packs
    )

    # --- LAYER 2: RAG EVIDENCE RETRIEVAL ---
    retrieved_evidence = RAGVectorStore.retrieve_relevant_evidence(
        db=db,
        brand_kit_id=kit.id,
        content_text=sub.working_text,
        top_k=4
    )

    # --- LAYER 3: CONTEXTUAL AI ANALYSIS ---
    layer3_findings = await LLMAnalyzer.analyze_context(
        text=sub.working_text,
        brand_personality=kit.brand_personality or "Friendly, Science-backed, Professional",
        retrieved_evidence=retrieved_evidence,
        existing_findings=layer1_findings
    )

    all_raw_findings = layer1_findings + layer3_findings

    # Save findings into DB
    for f in all_raw_findings:
        src = f.get("source", {})
        db_finding = Finding(
            submission_id=sub.id,
            rule_id=f.get("rule_id"),
            category=f.get("category", "terminology"),
            title=f.get("title", "Guideline Violation"),
            description=f.get("description", ""),
            original_text=f.get("original_text", ""),
            severity=f.get("severity", "medium"),
            confidence=float(f.get("confidence", 0.9)),
            explanation=f.get("explanation", ""),
            source_document=src.get("document_name", "Brand Guidelines"),
            source_section=src.get("section", ""),
            source_page=src.get("page", 1),
            rule_code=src.get("rule_id", f.get("rule_id")),
            evidence_text=src.get("evidence", ""),
            suggested_fix=f.get("suggested_fix"),
            status="open",
            detection_layer=f.get("detection_layer", "deterministic")
        )
        db.add(db_finding)
    db.flush()

    persisted_findings = db.query(Finding).filter(Finding.submission_id == sub.id).all()
    score_breakdown = calculate_compliance_score([
        {
            "severity": pf.severity,
            "status": pf.status,
            "title": pf.title,
            "description": pf.description
        } for pf in persisted_findings
    ])

    sub.compliance_score = score_breakdown["score"]
    sub.compliance_details = score_breakdown
    sub.status = "Reviewing"

    # Create in-app alert for critical issues
    if score_breakdown["critical_unresolved"] > 0:
        db.add(Notification(
            user_id=sub.creator_id,
            title="🚨 Critical Issue Detected",
            message=f"{score_breakdown['critical_unresolved']} critical violation(s) flagged in '{sub.title}'. Maximum score capped at 69.",
            notification_type="critical_issue",
            resource_id=sub.id
        ))

    db.add(AuditLog(
        org_id=sub.org_id,
        user_id=current_user.id,
        action="AI_REVIEW_COMPLETED",
        resource_type="content",
        resource_id=sub.id,
        details={
            "total_findings": len(persisted_findings),
            "score": score_breakdown["score"],
            "critical_count": score_breakdown["critical_unresolved"]
        }
    ))

    db.commit()
    db.refresh(sub)
    return sub

@router.post("/{id}/resubmit", response_model=ContentSubmissionOut)
async def resubmit_content_revision(
    id: str,
    new_text: str = Body(..., embed=True),
    change_summary: Optional[str] = Body("Creator edited copy and resubmitted as v2", embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Slide 11 Step 4 & 5: Resubmit as revision v2.
    Preserves previous revision intact, increments revision number,
    re-runs the 3-layer hybrid AI review engine, and recalculates the compliance score.
    """
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Content submission not found.")

    sub.working_text = new_text.strip()
    sub.current_revision_number += 1
    sub.status = "Reviewing"

    rev = ContentRevision(
        submission_id=sub.id,
        revision_number=sub.current_revision_number,
        content_text=sub.working_text,
        change_summary=change_summary,
        compliance_score=sub.compliance_score,
        created_by_id=current_user.id
    )
    db.add(rev)
    db.flush()

    db.add(AuditLog(
        org_id=sub.org_id,
        user_id=current_user.id,
        action="CONTENT_RESUBMITTED",
        resource_type="content",
        resource_id=sub.id,
        details={"revision": sub.current_revision_number, "summary": change_summary}
    ))

    db.commit()

    return await run_brand_review(submission_id=sub.id, current_user=current_user, db=db)

@router.post("/rewrite", response_model=RewriteResponse)
def get_smart_rewrites(
    rewrite_in: RewriteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Module 12: Smart Rewrite Assistant
    Generates 4 brand-compliant rewrites: Professional, Conversational, Compliant, and Concise.
    """
    kit = db.query(BrandKit).filter(BrandKit.id == rewrite_in.brand_kit_id).first() if rewrite_in.brand_kit_id else db.query(BrandKit).first()
    rules = db.query(BrandRule).filter(BrandRule.brand_kit_id == kit.id).all() if kit else []
    
    findings = DeterministicRuleEngine.run_checks(rewrite_in.text, rules)
    rewrites = LLMAnalyzer.generate_rewrites(
        original_text=rewrite_in.text,
        findings=findings,
        brand_personality=kit.brand_personality if kit else "Friendly, Science-backed"
    )
    return {"options": rewrites}

@router.post("/{id}/submit-approval")
def submit_for_approval(
    id: str,
    notes: Optional[str] = Body(None, embed=True),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submits content to the Manager Review queue (Status: Pending Approval).
    Notifies reviewer team members.
    """
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Content submission not found.")

    sub.status = "Pending Approval"

    req = ApprovalRequest(
        submission_id=sub.id,
        requested_by_id=current_user.id,
        revision_number=sub.current_revision_number,
        status="Pending Approval",
        creator_notes=notes
    )
    db.add(req)

    # In-app notification for reviewer team
    reviewers = db.query(User).filter(User.role.in_(["REVIEWER", "ADMIN"])).all()
    for r_user in reviewers:
        db.add(Notification(
            user_id=r_user.id,
            title="📋 New Content Awaiting Approval",
            message=f"'{sub.title}' submitted by {current_user.full_name}. Compliance Score: {sub.compliance_score}/100.",
            notification_type="pending_approval",
            resource_id=sub.id
        ))

    db.add(AuditLog(
        org_id=sub.org_id,
        user_id=current_user.id,
        action="APPROVAL_REQUESTED",
        resource_type="approval",
        resource_id=req.id,
        details={"score": sub.compliance_score, "notes": notes}
    ))

    db.commit()
    return {"message": "Content successfully submitted for manager approval.", "status": sub.status}
