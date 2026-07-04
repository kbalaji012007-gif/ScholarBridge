from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database.base import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.application import Application
from app.models.scholarship import Scholarship
from app.models.notification import Notification
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ApplicationOut

router = APIRouter()


@router.get("/", response_model=List[ApplicationOut])
def list_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if current_user.is_admin:
        apps = db.query(Application).order_by(Application.created_at.desc()).all()
    else:
        apps = db.query(Application).filter_by(user_id=current_user.id).order_by(
            Application.created_at.desc()
        ).all()
    return apps


@router.post("/", response_model=ApplicationOut, status_code=201)
def apply_for_scholarship(
    data: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    scholarship = db.query(Scholarship).filter(Scholarship.id == data.scholarship_id).first()
    if not scholarship:
        raise HTTPException(status_code=404, detail="Scholarship not found")

    existing = db.query(Application).filter_by(
        user_id=current_user.id, scholarship_id=data.scholarship_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already applied for this scholarship")

    app = Application(
        user_id=current_user.id,
        scholarship_id=data.scholarship_id,
        notes=data.notes,
        status="submitted",
        submitted_at=datetime.utcnow(),
    )
    db.add(app)

    # Create notification
    notif = Notification(
        user_id=current_user.id,
        title="Application Submitted ✅",
        message=f"Your application for '{scholarship.title}' has been submitted.",
        notif_type="application",
        action_url=f"/dashboard/applications",
    )
    db.add(notif)
    db.commit()
    db.refresh(app)
    return app


@router.get("/{application_id}", response_model=ApplicationOut)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if not current_user.is_admin and app.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return app


@router.put("/{application_id}", response_model=ApplicationOut)
def update_application(
    application_id: int,
    data: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Only admin can update status; user can update notes
    if data.status and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Only admins can update status")

    if data.status:
        app.status = data.status
        app.reviewed_at = datetime.utcnow()
        if data.admin_remarks:
            app.admin_remarks = data.admin_remarks

        notif = Notification(
            user_id=app.user_id,
            title=f"Application {data.status.title()}",
            message=f"Your application status has been updated to: {data.status}",
            notif_type="application",
            action_url="/dashboard/applications",
        )
        db.add(notif)

    if data.notes is not None:
        app.notes = data.notes

    db.commit()
    db.refresh(app)
    return app


@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    app = db.query(Application).filter(Application.id == application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if not current_user.is_admin and app.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if app.status not in ["draft", "submitted"] and not current_user.is_admin:
        raise HTTPException(status_code=400, detail="Cannot withdraw a processed application")
    db.delete(app)
    db.commit()
    return {"message": "Application withdrawn"}
