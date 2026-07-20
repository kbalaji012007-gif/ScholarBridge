from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import os, shutil, uuid

from app.database.base import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.scholarship import Scholarship
from app.models.saved_scholarship import SavedScholarship
from app.models.application import Application
from app.services.eligibility import check_eligibility
from app.schemas.user import UserOut, UserProfileUpdate
from app.services.document_verification import calculate_profile_completion
from app.core.config import settings
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.get("/me/dashboard-stats")
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
        "eligible_count": eligible_count,
        "saved_count": saved_count,
        "applied_count": applied_count,
        "deadlines_count": deadlines_count,
    }


@router.put("/me", response_model=UserOut)
def update_profile(
    data: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(current_user, field, value)
    current_user.profile_completion = calculate_profile_completion(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/photo", response_model=UserOut)
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if file.content_type not in ["image/jpeg", "image/png", "image/jpg"]:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG images allowed")

    upload_dir = os.path.join(settings.UPLOAD_DIR, "photos")
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1]
    filename = f"user_{current_user.id}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    current_user.profile_photo = f"/uploads/photos/{filename}"
    db.commit()
    db.refresh(current_user)
    return current_user


@router.get("/", response_model=List[UserOut])
def list_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    return db.query(User).offset(skip).limit(limit).all()


@router.get("/{user_id}", response_model=UserOut)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not current_user.is_admin and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Admin only")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}
