import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.content import ContentSubmission, ContentRevision, ReviewJob
from app.models.brand_kit import BrandKit, BrandRule, ApprovedFact, ApprovedClaim
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
    # Resolve Brand Kit
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

    # Create submission record
    sub = ContentSubmission(
        org_id=kit.org_id,
        brand_kit_id=kit.id,
        creator_id=current_user.id,
        title=title,
        campaign_name=campaign_name,
        content_category=content_category or "Social Media",
        publishing_channel=publishing_channel or "Instagram",
        original_text=extracted_text,
        working_text=extracted_text,  # Working copy initialized to original
        file_name=file_name,
        file_type=file_type,
        file_size=file_size,
        status="Draft",
        compliance_score=100,
        current_revision_number=1
    )
    db.add(sub)
    db.flush()

    # Log initial revision
    rev = ContentRevision(
        submission_id=sub.id,
        revision_number=1,
        content_text=extracted_text,
        change_summary="Initial submission draft",
        compliance_score=100,
        created_by_id=current_user.id
    )
    db.add(rev)

    # Audit Log
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
    Layer 1: Deterministic Rule Engine (Prohibited/preferred terms, expired facts, disclaimers)
    Layer 2: RAG Vector Store (Retrieves relevant guidelines & claims with source citations)
    Layer 3: Contextual LLM Analysis (Tone, unsubstantiated claims, temporal exaggerations)
    Calculates Compliance Score and persists traceable findings.
    """
    sub = db.query(ContentSubmission).filter(ContentSubmission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Content submission not found.")

    kit = db.query(BrandKit).filter(BrandKit.id == sub.brand_kit_id).first()
    if not kit:
        raise HTTPException(status_code=400, detail="Associated Brand Kit not found.")

    # Clear previous open findings for this submission
    db.query(Finding).filter(Finding.submission_id == sub.id, Finding.status == "open").delete()
    db.flush()

    # --- LAYER 1: DETERMINISTIC RULE ENGINE ---
    rules = db.query(BrandRule).filter(BrandRule.brand_kit_id == kit.id, BrandRule.is_active == True).all()
    approved_facts = db.query(ApprovedFact).filter(ApprovedFact.brand_kit_id == kit.id).all()
    approved_claims = db.query(ApprovedClaim).filter(ApprovedClaim.brand_kit_id == kit.id).all()

    layer1_findings = DeterministicRuleEngine.run_checks(
        text=sub.working_text,
        rules=rules,
        approved_facts=approved_facts,
        approved_claims=approved_claims
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

    # Re-fetch all findings for compliance score calculation
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

    # Log review run in AuditLog
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

    # Audit Log
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

