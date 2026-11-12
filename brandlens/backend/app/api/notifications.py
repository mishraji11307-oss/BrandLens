from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime
from app.database.session import get_db
from app.models.approval import Notification
from app.models.user import User
from app.api.deps import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationOut(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: str
    resource_id: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationListResponse(BaseModel):
    notifications: List[NotificationOut]
    unread_count: int

@router.get("", response_model=NotificationListResponse)
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves in-app alerts for critical issues, pending approvals, and decisions.
    Supports role-based notifications and demo access.
    """
    # Fetch notifications for this user or all demo notifications if in demo mode
    query = db.query(Notification)
    if not current_user.is_demo:
        query = query.filter(Notification.user_id == current_user.id)

    notifications = query.order_by(Notification.created_at.desc()).limit(30).all()
    unread_count = sum(1 for n in notifications if not n.is_read)

    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

@router.post("/{notification_id}/read", response_model=NotificationOut)
def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks a single notification as read."""
    notif = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found.")

    notif.is_read = True
    db.commit()
    db.refresh(notif)
    return notif

@router.post("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Marks all user notifications as read."""
    query = db.query(Notification)
    if not current_user.is_demo:
        query = query.filter(Notification.user_id == current_user.id)

    query.update({Notification.is_read: True}, synchronize_session=False)
    db.commit()
    return {"message": "All notifications marked as read."}

@router.post("/seed-demo")
def seed_demo_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Adds standard pre-publication governance notifications for demo testing."""
    sample_notifications = [
        {
            "title": "🚨 Critical Issue Detected",
            "message": "Prohibited absolute guarantee 'guaranteed results' flagged in Clarifying Serum Launch (Rule RULE-TERM-002).",
            "notification_type": "critical_issue",
            "user_id": current_user.id
        },
        {
            "title": "⚖️ ASCI Disclosure Notice",
            "message": "Sponsored post draft is missing mandatory '#Ad' label under ASCI India Influencer Code.",
            "notification_type": "compliance_alert",
            "user_id": current_user.id
        },
        {
            "title": "📋 Pending Approval Queue",
            "message": "'Blemish Clarifying Serum Carousel' submitted by creator. Awaiting manager review.",
            "notification_type": "pending_approval",
            "user_id": current_user.id
        },
        {
            "title": "✅ Compliance Clearance Granted",
            "message": "'Barrier Restore Daily Email' cleared with 100/100 score. Cryptographic certificate issued.",
            "notification_type": "approval_granted",
            "user_id": current_user.id
        }
    ]

    for item in sample_notifications:
        db.add(Notification(
            user_id=item["user_id"],
            title=item["title"],
            message=item["message"],
            notification_type=item["notification_type"],
            is_read=False
        ))
    db.commit()

    return {"message": "Demo notifications populated."}

