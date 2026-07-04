from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database.base import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.notification import Notification
from app.schemas.notification import NotificationOut

router = APIRouter()


@router.get("/", response_model=List[NotificationOut])
def list_notifications(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return (
        db.query(Notification)
        .filter_by(user_id=current_user.id)
        .order_by(Notification.created_at.desc())
        .offset(skip).limit(limit).all()
    )


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    count = db.query(Notification).filter_by(
        user_id=current_user.id, is_read=False
    ).count()
    return {"count": count}


@router.put("/{notif_id}/read")
def mark_read(
    notif_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    notif = db.query(Notification).filter_by(
        id=notif_id, user_id=current_user.id
    ).first()
    if notif:
        notif.is_read = True
        db.commit()
    return {"message": "Marked as read"}


@router.put("/read-all")
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    db.query(Notification).filter_by(
        user_id=current_user.id, is_read=False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
