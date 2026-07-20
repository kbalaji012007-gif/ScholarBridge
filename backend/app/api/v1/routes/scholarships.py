from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app.database.base import get_db
from app.core.deps import get_current_active_user, get_current_admin
from app.models.user import User
from app.models.scholarship import Scholarship
from app.models.saved_scholarship import SavedScholarship
from app.models.application import Application
from app.schemas.scholarship import ScholarshipCreate, ScholarshipUpdate, ScholarshipOut, ScholarshipWithEligibility
from app.services.eligibility import check_eligibility, get_missing_documents

router = APIRouter()


@router.get("/", response_model=List[ScholarshipWithEligibility])
def list_scholarships(
    search: Optional[str] = None,
    state: Optional[str] = None,
    course: Optional[str] = None,
    category: Optional[str] = None,
    gender: Optional[str] = None,
    provider_type: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_income: Optional[float] = None,
    eligible_only: Optional[bool] = False,
    saved_only: Optional[bool] = False,
    deadlines_only: Optional[bool] = False,
    sort_by: Optional[str] = "last_date",
    order: Optional[str] = "asc",
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    q = db.query(Scholarship).filter(Scholarship.status == "active")

    if search:
        q = q.filter(
            Scholarship.title.ilike(f"%{search}%") |
            Scholarship.provider.ilike(f"%{search}%") |
            Scholarship.description.ilike(f"%{search}%")
        )
    if provider_type:
        q = q.filter(Scholarship.provider_type == provider_type)
    if gender:
        q = q.filter((Scholarship.eligible_gender == gender) | (Scholarship.eligible_gender == "all"))

    # Filter saved scholarships query-side
    saved_ids = {s.scholarship_id for s in current_user.saved_scholarships}
    if saved_only:
        q = q.filter(Scholarship.id.in_(saved_ids or [0]))

    # Filter deadlines query-side
    if deadlines_only:
        from datetime import datetime, timedelta
        now = datetime.utcnow()
        seven_days = now + timedelta(days=7)
        q = q.filter(Scholarship.last_date >= now, Scholarship.last_date <= seven_days)

    # Sorting
    sort_col = getattr(Scholarship, sort_by, Scholarship.last_date)
    if order == "desc":
        q = q.order_by(sort_col.desc())
    else:
        q = q.order_by(sort_col.asc())

    scholarships = q.offset(skip).limit(limit).all()

    # Get user docs and applied statuses
    user_docs = current_user.documents
    applied = {a.scholarship_id: a.status for a in current_user.applications}

    result = []
    for s in scholarships:
        elig_status, reasons = check_eligibility(current_user, s)
        missing = get_missing_documents(user_docs, s.required_documents or [])
        item = ScholarshipWithEligibility.model_validate(s)
        item.eligibility_status = elig_status
        item.eligibility_reasons = reasons
        item.missing_documents = missing
        item.is_saved = s.id in saved_ids
        item.application_status = applied.get(s.id)
        result.append(item)

    # Apply client-side filters that depend on JSON columns
    if state:
        result = [r for r in result if not r.eligible_states or state in r.eligible_states]
    if category:
        result = [r for r in result if not r.eligible_categories or category in r.eligible_categories]
    if course:
        result = [r for r in result if not r.eligible_courses or any(
            course.lower() in c.lower() for c in r.eligible_courses)]

    # Filter eligible client-side
    if eligible_only:
        result = [r for r in result if r.eligibility_status == "eligible"]

    return result


@router.get("/{scholarship_id}", response_model=ScholarshipWithEligibility)
def get_scholarship(
    scholarship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    s = db.query(Scholarship).filter(Scholarship.id == scholarship_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scholarship not found")

    elig_status, reasons = check_eligibility(current_user, s)
    user_docs = current_user.documents
    missing = get_missing_documents(user_docs, s.required_documents or [])
    saved_ids = {sv.scholarship_id for sv in current_user.saved_scholarships}
    applied = {a.scholarship_id: a.status for a in current_user.applications}

    item = ScholarshipWithEligibility.model_validate(s)
    item.eligibility_status = elig_status
    item.eligibility_reasons = reasons
    item.missing_documents = missing
    item.is_saved = s.id in saved_ids
    item.application_status = applied.get(s.id)
    return item


@router.post("/", response_model=ScholarshipOut, status_code=201)
def create_scholarship(
    data: ScholarshipCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    scholarship = Scholarship(**data.model_dump(), created_by=current_user.id)
    db.add(scholarship)
    db.commit()
    db.refresh(scholarship)
    return scholarship


@router.put("/{scholarship_id}", response_model=ScholarshipOut)
def update_scholarship(
    scholarship_id: int,
    data: ScholarshipUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    s = db.query(Scholarship).filter(Scholarship.id == scholarship_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(s, field, value)
    db.commit()
    db.refresh(s)
    return s


@router.delete("/{scholarship_id}")
def delete_scholarship(
    scholarship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    s = db.query(Scholarship).filter(Scholarship.id == scholarship_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Scholarship not found")
    db.delete(s)
    db.commit()
    return {"message": "Scholarship deleted"}


@router.post("/{scholarship_id}/save")
def save_scholarship(
    scholarship_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    existing = db.query(SavedScholarship).filter_by(
        user_id=current_user.id, scholarship_id=scholarship_id
    ).first()
    if existing:
        db.delete(existing)
        db.commit()
        return {"message": "Unsaved", "saved": False}
    saved = SavedScholarship(user_id=current_user.id, scholarship_id=scholarship_id)
    db.add(saved)
    db.commit()
    return {"message": "Saved", "saved": True}


@router.get("/saved/list", response_model=List[ScholarshipWithEligibility])
def get_saved_scholarships(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    saved = db.query(SavedScholarship).filter_by(user_id=current_user.id).all()
    result = []
    user_docs = current_user.documents
    for sv in saved:
        s = sv.scholarship
        if not s:
            continue
        elig_status, reasons = check_eligibility(current_user, s)
        missing = get_missing_documents(user_docs, s.required_documents or [])
        item = ScholarshipWithEligibility.model_validate(s)
        item.eligibility_status = elig_status
        item.eligibility_reasons = reasons
        item.missing_documents = missing
        item.is_saved = True
        result.append(item)
    return result
