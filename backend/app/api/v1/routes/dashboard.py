from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database.base import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.scholarship import Scholarship
from app.models.saved_scholarship import SavedScholarship
from app.models.application import Application
from app.services.eligibility import check_eligibility

router = APIRouter()


@router.get("/stats")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    # 1. Eligible count
    active_scholarships = db.query(Scholarship).filter(Scholarship.status == "active").all()
    eligible_count = 0
    for s in active_scholarships:
        status, _ = check_eligibility(current_user, s)
        if status in ("eligible", "partial"):
            eligible_count += 1

    # 2. Saved count
    saved_count = db.query(SavedScholarship).filter_by(user_id=current_user.id).count()

    # 3. Applied count
    applied_count = db.query(Application).filter_by(user_id=current_user.id).count()

    # 4. Deadlines count
    now = datetime.utcnow()
    seven_days = now + timedelta(days=7)
    deadlines_count = db.query(Scholarship).filter(
        Scholarship.status == "active",
        Scholarship.last_date >= now,
        Scholarship.last_date <= seven_days
    ).count()

    return {
        "eligibleScholarships": eligible_count,
        "savedScholarships": saved_count,
        "appliedScholarships": applied_count,
        "deadlinesThisWeek": deadlines_count,
    }
