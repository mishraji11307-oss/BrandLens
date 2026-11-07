from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.approval import ApprovalRequest, Comment, Notification
from app.models.content import ContentSubmission
from app.models.user import User
from app.models.audit import AuditLog
from app.schemas.approval import ApprovalActionRequest, ApprovalOut, CommentCreate, CommentOut
from app.api.deps import get_current_user, require_roles

router = APIRouter(prefix="/approvals", tags=["Human Approvals"])

@router.get("/pending", response_model=List[ApprovalOut])
def get_pending_approvals(
    current_user: User = Depends(require_roles(["REVIEWER", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Retrieves all content submissions currently awaiting human manager review.
    Enforces RBAC on the backend.
    """
    requests = (
        db.query(ApprovalRequest)
        .filter(ApprovalRequest.status == "Pending Approval")
        .order_by(ApprovalRequest.created_at.desc())
        .all()
    )
    
    results = []
    for r in requests:
        sub = db.query(ContentSubmission).filter(ContentSubmission.id == r.submission_id).first()
        creator = db.query(User).filter(User.id == r.requested_by_id).first()
        results.append({
            "id": r.id,
            "submission_id": r.submission_id,
            "submission_title": sub.title if sub else "Submission",
            "creator_name": creator.full_name if creator else "Creator",
            "requested_by_id": r.requested_by_id,
            "reviewed_by_id": r.reviewed_by_id,
            "revision_number": r.revision_number,
            "status": r.status,
            "decision": r.decision,
            "decision_reason": r.decision_reason,
            "creator_notes": r.creator_notes,
            "created_at": r.created_at
        })
    return results

@router.post("/{request_id}/approve", response_model=ApprovalOut)
def approve_content(
    request_id: str,
    action: ApprovalActionRequest,
    current_user: User = Depends(require_roles(["REVIEWER", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Manager grants final compliance approval.
    Content is transitioned to 'Approved' and marked Publish Ready.
    """
    req = db.query(ApprovalRequest).filter(ApprovalRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Approval request not found.")

    sub = db.query(ContentSubmission).filter(ContentSubmission.id == req.submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Associated content submission not found.")

    # Guard: Cannot approve if there are unresolved critical violations
    from app.models.finding import Finding
    open_critical = db.query(Finding).filter(
        Finding.submission_id == sub.id,
        Finding.severity == "critical",
        Finding.status == "open"
    ).count()

    if open_critical > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve content with {open_critical} unresolved Critical brand violations."
        )

    req.status = "Approved"
    req.decision = "APPROVED"
    req.decision_reason = action.decision_reason
    req.reviewed_by_id = current_user.id
    sub.status = "Approved"

    # Add comment if provided
    if action.comments:
        db.add(Comment(
            submission_id=sub.id,
            author_id=current_user.id,
            comment_text=action.comments,
            comment_type="approval_note"
        ))

    # Notify Creator
    db.add(Notification(
        user_id=sub.creator_id,
        title="Content Approved!",
        message=f"'{sub.title}' has been reviewed and approved by {current_user.full_name}. Status: Publish Ready.",
        notification_type="approval_granted",
        resource_id=sub.id
    ))

    # Immutable Audit Log
    db.add(AuditLog(
        org_id=sub.org_id,
        user_id=current_user.id,
        action="APPROVAL_GRANTED",
        resource_type="approval",
        resource_id=req.id,
        details={"decision": "APPROVED", "reason": action.decision_reason}
    ))

    db.commit()
    db.refresh(req)
    return {
        "id": req.id,
        "submission_id": req.submission_id,
        "submission_title": sub.title,
        "creator_name": current_user.full_name,
        "requested_by_id": req.requested_by_id,
        "reviewed_by_id": req.reviewed_by_id,
        "revision_number": req.revision_number,
        "status": req.status,
        "decision": req.decision,
        "decision_reason": req.decision_reason,
        "creator_notes": req.creator_notes,
        "created_at": req.created_at
    }

@router.post("/{request_id}/reject", response_model=ApprovalOut)
def reject_content(
    request_id: str,
    action: ApprovalActionRequest,
    current_user: User = Depends(require_roles(["REVIEWER", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Manager rejects content submission with mandatory rationale.
    """
    req = db.query(ApprovalRequest).filter(ApprovalRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Approval request not found.")

    sub = db.query(ContentSubmission).filter(ContentSubmission.id == req.submission_id).first()

    req.status = "Rejected"
    req.decision = "REJECTED"
    req.decision_reason = action.decision_reason
    req.reviewed_by_id = current_user.id
    sub.status = "Rejected"

    if action.comments:
        db.add(Comment(
            submission_id=sub.id,
            author_id=current_user.id,
            comment_text=action.comments,
            comment_type="rejection_note"
        ))

    db.add(Notification(
        user_id=sub.creator_id,
        title="Content Rejected",
        message=f"'{sub.title}' was rejected by compliance lead. Reason: {action.decision_reason}",
        notification_type="approval_rejected",
        resource_id=sub.id
    ))

    db.add(AuditLog(
        org_id=sub.org_id,
        user_id=current_user.id,
        action="APPROVAL_REJECTED",
        resource_type="approval",
        resource_id=req.id,
        details={"reason": action.decision_reason}
    ))

    db.commit()
    db.refresh(req)
    return {
        "id": req.id,
        "submission_id": req.submission_id,
        "submission_title": sub.title,
        "creator_name": current_user.full_name,
        "requested_by_id": req.requested_by_id,
        "reviewed_by_id": req.reviewed_by_id,
        "revision_number": req.revision_number,
        "status": req.status,
        "decision": req.decision,
        "decision_reason": req.decision_reason,
        "creator_notes": req.creator_notes,
        "created_at": req.created_at
    }

@router.post("/{request_id}/request-changes", response_model=ApprovalOut)
def request_changes(
    request_id: str,
    action: ApprovalActionRequest,
    current_user: User = Depends(require_roles(["REVIEWER", "ADMIN"])),
    db: Session = Depends(get_db)
):
    """
    Manager requests creator revisions before re-review.
    """
    req = db.query(ApprovalRequest).filter(ApprovalRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Approval request not found.")

    sub = db.query(ContentSubmission).filter(ContentSubmission.id == req.submission_id).first()

    req.status = "Changes Requested"
    req.decision = "CHANGES_REQUESTED"
    req.decision_reason = action.decision_reason
    req.reviewed_by_id = current_user.id
    sub.status = "Changes Requested"

    if action.comments:
        db.add(Comment(
            submission_id=sub.id,
            author_id=current_user.id,
            comment_text=action.comments,
            comment_type="change_request"
        ))

    db.add(Notification(
        user_id=sub.creator_id,
        title="Changes Requested by Reviewer",
        message=f"Revisions requested on '{sub.title}': {action.decision_reason}",
        notification_type="changes_requested",
        resource_id=sub.id
    ))

    db.commit()
    return {
        "id": req.id,
        "submission_id": req.submission_id,
        "submission_title": sub.title,
        "creator_name": current_user.full_name,
        "requested_by_id": req.requested_by_id,
        "reviewed_by_id": req.reviewed_by_id,
        "revision_number": req.revision_number,
        "status": req.status,
        "decision": req.decision,
        "decision_reason": req.decision_reason,
        "creator_notes": req.creator_notes,
        "created_at": req.created_at
    }

@router.get("/{submission_id}/comments", response_model=List[CommentOut])
def get_comments(submission_id: str, db: Session = Depends(get_db)):
    """Retrieves all review discussion comments for a submission."""
    comments = db.query(Comment).filter(Comment.submission_id == submission_id).order_by(Comment.created_at.asc()).all()
    results = []
    for c in comments:
        author = db.query(User).filter(User.id == c.author_id).first()
        results.append({
            "id": c.id,
            "submission_id": c.submission_id,
            "author_id": c.author_id,
            "author_name": author.full_name if author else "User",
            "comment_text": c.comment_text,
            "comment_type": c.comment_type,
            "created_at": c.created_at
        })
    return results

@router.post("/{submission_id}/comments", response_model=CommentOut)
def post_comment(
    submission_id: str,
    comment_in: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adds a review note or creator response."""
    comment = Comment(
        submission_id=submission_id,
        author_id=current_user.id,
        comment_text=comment_in.comment_text,
        comment_type=comment_in.comment_type
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return {
        "id": comment.id,
        "submission_id": comment.submission_id,
        "author_id": comment.author_id,
        "author_name": current_user.full_name,
        "comment_text": comment.comment_text,
        "comment_type": comment.comment_type,
        "created_at": comment.created_at
    }

