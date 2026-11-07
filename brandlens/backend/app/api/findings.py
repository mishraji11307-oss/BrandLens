import re
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.finding import Finding, FindingAction
from app.models.content import ContentSubmission, ContentRevision
from app.models.audit import AuditLog
from app.models.user import User
from app.schemas.finding import FindingOut, FindingActionRequest
from app.core.scoring import calculate_compliance_score
from app.api.deps import get_current_user

router = APIRouter(prefix="/findings", tags=["Findings"])

def _update_submission_score_and_revision(
    db: Session,
    sub: ContentSubmission,
    user_id: str,
    action_summary: str
):
    """Helper to recalculate compliance score and record a revision update."""
    all_findings = db.query(Finding).filter(Finding.submission_id == sub.id).all()
    score_breakdown = calculate_compliance_score([
        {
            "severity": f.severity,
            "status": f.status,
            "title": f.title,
            "description": f.description
        } for f in all_findings
    ])
    
    sub.compliance_score = score_breakdown["score"]
    sub.compliance_details = score_breakdown
    sub.current_revision_number += 1
    
    # Store revision snapshot
    rev = ContentRevision(
        submission_id=sub.id,
        revision_number=sub.current_revision_number,
        content_text=sub.working_text,
        change_summary=action_summary,
        compliance_score=sub.compliance_score,
        created_by_id=user_id
    )
    db.add(rev)

@router.post("/{id}/accept", response_model=FindingOut)
def accept_finding(
    id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Accepts suggested fix:
    Applies fix ONLY to the separate working copy revision (never modifies original).
    Recalculates compliance score and records audit history.
    """
    finding = db.query(Finding).filter(Finding.id == id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")

    sub = db.query(ContentSubmission).filter(ContentSubmission.id == finding.submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Associated submission not found.")

    # Apply replacement to working_text using case-insensitive replacement
    orig = finding.original_text
    replacement = finding.suggested_fix or ""
    if orig and replacement:
        pattern = re.compile(re.escape(orig), re.IGNORECASE)
        sub.working_text = pattern.sub(replacement, sub.working_text)

    finding.status = "accepted"

    # Action record
    action = FindingAction(
        finding_id=finding.id,
        user_id=current_user.id,
        action_type="ACCEPT",
        applied_replacement=replacement
    )
    db.add(action)

    _update_submission_score_and_revision(
        db=db,
        sub=sub,
        user_id=current_user.id,
        action_summary=f"Accepted fix for '{finding.title}': replaced '{orig}' with '{replacement}'"
    )

    db.add(AuditLog(
        org_id=sub.org_id,
        user_id=current_user.id,
        action="FINDING_ACCEPTED",
        resource_type="finding",
        resource_id=finding.id,
        details={"original": orig, "replacement": replacement}
    ))

    db.commit()
    db.refresh(finding)
    return finding

@router.post("/{id}/edit", response_model=FindingOut)
def edit_finding_fix(
    id: str,
    req: FindingActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Applies custom user-edited replacement text to the working revision.
    """
    finding = db.query(Finding).filter(Finding.id == id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")

    sub = db.query(ContentSubmission).filter(ContentSubmission.id == finding.submission_id).first()
    custom_fix = req.custom_fix or finding.suggested_fix or ""

    orig = finding.original_text
    if orig and custom_fix:
        pattern = re.compile(re.escape(orig), re.IGNORECASE)
        sub.working_text = pattern.sub(custom_fix, sub.working_text)

    finding.status = "edited"
    finding.custom_fix = custom_fix

    action = FindingAction(
        finding_id=finding.id,
        user_id=current_user.id,
        action_type="EDIT",
        applied_replacement=custom_fix,
        reason=req.reason
    )
    db.add(action)

    _update_submission_score_and_revision(
        db=db,
        sub=sub,
        user_id=current_user.id,
        action_summary=f"Custom edit applied for '{finding.title}': '{custom_fix}'"
    )

    db.commit()
    db.refresh(finding)
    return finding

@router.post("/{id}/dismiss", response_model=FindingOut)
def dismiss_finding(
    id: str,
    req: FindingActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Dismisses a finding with a required justification reason.
    """
    finding = db.query(Finding).filter(Finding.id == id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")

    sub = db.query(ContentSubmission).filter(ContentSubmission.id == finding.submission_id).first()

    finding.status = "dismissed"
    finding.action_reason = req.reason or "Dismissed by creator as not applicable."

    action = FindingAction(
        finding_id=finding.id,
        user_id=current_user.id,
        action_type="DISMISS",
        reason=finding.action_reason
    )
    db.add(action)

    _update_submission_score_and_revision(
        db=db,
        sub=sub,
        user_id=current_user.id,
        action_summary=f"Dismissed finding '{finding.title}'. Reason: {finding.action_reason}"
    )

    db.commit()
    db.refresh(finding)
    return finding

@router.post("/{id}/dispute", response_model=FindingOut)
def dispute_finding(
    id: str,
    req: FindingActionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Disputes an AI finding with creator justification.
    Feed directly into Governance Intelligence & Smart Insights engine.
    """
    finding = db.query(Finding).filter(Finding.id == id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found.")

    sub = db.query(ContentSubmission).filter(ContentSubmission.id == finding.submission_id).first()

    finding.status = "disputed"
    finding.action_reason = req.reason or "Disputed: creator contends phrasing complies with intent."

    action = FindingAction(
        finding_id=finding.id,
        user_id=current_user.id,
        action_type="DISPUTE",
        reason=finding.action_reason
    )
    db.add(action)

    _update_submission_score_and_revision(
        db=db,
        sub=sub,
        user_id=current_user.id,
        action_summary=f"Disputed finding '{finding.title}'. Justification: {finding.action_reason}"
    )

    db.add(AuditLog(
        org_id=sub.org_id,
        user_id=current_user.id,
        action="FINDING_DISPUTED",
        resource_type="finding",
        resource_id=finding.id,
        details={"rule_id": finding.rule_id, "reason": finding.action_reason}
    ))

    db.commit()
    db.refresh(finding)
    return finding

