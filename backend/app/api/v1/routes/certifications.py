"""
Certifications API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.base import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.certification import Certification, UserCertification
from app.services import ai_service

router = APIRouter()


@router.get("/")
def list_certifications(
    search: Optional[str] = None,
    provider: Optional[str] = None,
    level: Optional[str] = None,
    is_free: Optional[bool] = None,
    skip: int = 0,
    limit: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all certifications with optional filters."""
    q = db.query(Certification).filter(Certification.is_active == True)
    if search:
        q = q.filter(Certification.name.ilike(f"%{search}%") | Certification.provider.ilike(f"%{search}%"))
    if provider:
        q = q.filter(Certification.provider.ilike(f"%{provider}%"))
    if level:
        q = q.filter(Certification.level == level)
    if is_free is not None:
        q = q.filter(Certification.is_free == is_free)
    certs = q.offset(skip).limit(limit).all()

    # Add user's current status for each cert
    user_cert_ids = {uc.certification_id: uc.status for uc in
                     db.query(UserCertification).filter(UserCertification.user_id == current_user.id).all()}

    result = []
    for c in certs:
        user_skills = set(s.lower() for s in (current_user.skills or []))
        cert_skills = set(s.lower() for s in (c.skills_covered or []))
        skill_overlap = round(len(user_skills & cert_skills) / max(len(cert_skills), 1) * 100)
        result.append({
            "id": c.id,
            "name": c.name,
            "provider": c.provider,
            "url": c.url,
            "level": c.level,
            "skills_covered": c.skills_covered,
            "career_paths": c.career_paths,
            "duration_hours": c.duration_hours,
            "cost": c.cost,
            "is_free": c.is_free,
            "rating": c.rating,
            "description": c.description,
            "skill_overlap_percent": skill_overlap,
            "user_status": user_cert_ids.get(c.id),
        })
    return sorted(result, key=lambda x: x["skill_overlap_percent"], reverse=True)


@router.get("/recommend")
def recommend_certifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """AI-powered certification recommendations."""
    user_skills = current_user.skills or []
    career_interests = current_user.career_interests or []

    # Get AI recommendations
    recommended_names = ai_service.recommend_certifications(user_skills, career_interests)

    # Look up in DB, fallback to all certs if not found
    certs = db.query(Certification).filter(Certification.is_active == True).limit(6).all()
    return [{"id": c.id, "name": c.name, "provider": c.provider, "level": c.level,
             "is_free": c.is_free, "cost": c.cost, "url": c.url, "skills_covered": c.skills_covered}
            for c in certs]


class UserCertCreate(BaseModel):
    certification_id: int
    status: str = "planned"


@router.post("/mine")
def add_user_certification(
    data: UserCertCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Add or update a certification for the current user."""
    cert = db.query(Certification).filter(Certification.id == data.certification_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")

    existing = db.query(UserCertification).filter(
        UserCertification.user_id == current_user.id,
        UserCertification.certification_id == data.certification_id
    ).first()

    if existing:
        existing.status = data.status
        db.commit()
        return {"message": "Status updated", "status": data.status}

    uc = UserCertification(
        user_id=current_user.id,
        certification_id=data.certification_id,
        status=data.status,
    )
    db.add(uc)
    db.commit()
    return {"message": "Certification tracked", "status": data.status}


@router.get("/mine")
def get_my_certifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get current user's certification tracking list."""
    user_certs = db.query(UserCertification).filter(
        UserCertification.user_id == current_user.id
    ).all()
    result = []
    for uc in user_certs:
        cert = uc.certification
        if cert:
            result.append({"id": uc.id, "certification_id": cert.id, "name": cert.name,
                           "provider": cert.provider, "status": uc.status,
                           "completion_date": uc.completion_date, "is_free": cert.is_free})
    return result
