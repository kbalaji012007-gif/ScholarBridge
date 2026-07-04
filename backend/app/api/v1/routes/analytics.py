from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database.base import get_db
from app.core.deps import get_current_admin
from app.models.user import User
from app.models.scholarship import Scholarship
from app.models.application import Application
from app.models.document import Document

router = APIRouter()


@router.get("/stats")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    total_users = db.query(User).filter(User.is_admin == False).count()
    total_scholarships = db.query(Scholarship).count()
    govt_scholarships = db.query(Scholarship).filter(Scholarship.provider_type == "government").count()
    private_scholarships = db.query(Scholarship).filter(Scholarship.provider_type == "private").count()
    total_applications = db.query(Application).count()
    pending_docs = db.query(Document).filter(Document.status == "pending").count()
    verified_docs = db.query(Document).filter(Document.status == "verified").count()
    rejected_docs = db.query(Document).filter(Document.status == "rejected").count()

    # Application status breakdown
    app_statuses = (
        db.query(Application.status, func.count(Application.id))
        .group_by(Application.status)
        .all()
    )
    app_status_map = {s: c for s, c in app_statuses}

    # Popular scholarships (most applications)
    popular = (
        db.query(
            Scholarship.title,
            Scholarship.provider,
            func.count(Application.id).label("count"),
        )
        .join(Application, Application.scholarship_id == Scholarship.id, isouter=True)
        .group_by(Scholarship.id)
        .order_by(func.count(Application.id).desc())
        .limit(5)
        .all()
    )

    # State-wise user distribution
    state_dist = (
        db.query(User.state, func.count(User.id))
        .filter(User.state != None, User.is_admin == False)
        .group_by(User.state)
        .order_by(func.count(User.id).desc())
        .limit(10)
        .all()
    )

    # Recent users
    recent_users = (
        db.query(User)
        .filter(User.is_admin == False)
        .order_by(User.created_at.desc())
        .limit(5)
        .all()
    )

    return {
        "total_users": total_users,
        "total_scholarships": total_scholarships,
        "govt_scholarships": govt_scholarships,
        "private_scholarships": private_scholarships,
        "total_applications": total_applications,
        "pending_documents": pending_docs,
        "verified_documents": verified_docs,
        "rejected_documents": rejected_docs,
        "application_status_breakdown": app_status_map,
        "popular_scholarships": [
            {"title": t, "provider": p, "applications": c} for t, p, c in popular
        ],
        "state_wise_users": [
            {"state": s, "count": c} for s, c in state_dist
        ],
        "recent_users": [
            {"id": u.id, "name": u.full_name, "email": u.email, "joined": str(u.created_at)}
            for u in recent_users
        ],
    }
