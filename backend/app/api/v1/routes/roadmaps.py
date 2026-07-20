"""
Roadmap API routes — generate and manage learning roadmaps.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.database.base import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.roadmap import Roadmap
from app.services import ai_service

router = APIRouter()


class RoadmapGenerateRequest(BaseModel):
    goal: str
    duration_days: int = 60  # 30, 60, or 90
    target_role: Optional[str] = None


class RoadmapProgressRequest(BaseModel):
    progress_percent: float
    current_phase: Optional[int] = None
    completed_topics: Optional[list] = None
    status: Optional[str] = None


@router.post("/generate")
def generate_roadmap(
    request: RoadmapGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Generate an AI-powered learning roadmap."""
    if request.duration_days not in [30, 60, 90]:
        raise HTTPException(status_code=400, detail="Duration must be 30, 60, or 90 days")

    user_skills = current_user.skills or []
    roadmap_data = ai_service.generate_roadmap(request.goal, user_skills, request.duration_days)

    roadmap = Roadmap(
        user_id=current_user.id,
        goal=request.goal,
        target_role=request.target_role or request.goal,
        duration_days=request.duration_days,
        phases=roadmap_data.get("phases", []),
        ai_summary=roadmap_data.get("summary"),
        status="active",
        progress_percent=0.0,
    )
    db.add(roadmap)
    db.commit()
    db.refresh(roadmap)

    return {
        "id": roadmap.id,
        "goal": roadmap.goal,
        "duration_days": roadmap.duration_days,
        "title": roadmap_data.get("title"),
        "summary": roadmap_data.get("summary"),
        "phases": roadmap.phases,
        "final_project": roadmap_data.get("final_project"),
        "career_outcome": roadmap_data.get("career_outcome"),
        "status": roadmap.status,
        "progress_percent": roadmap.progress_percent,
    }


@router.get("/")
def list_roadmaps(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List all roadmaps for the current user."""
    roadmaps = db.query(Roadmap).filter(
        Roadmap.user_id == current_user.id
    ).order_by(Roadmap.created_at.desc()).all()

    return [
        {
            "id": r.id,
            "goal": r.goal,
            "duration_days": r.duration_days,
            "status": r.status,
            "progress_percent": r.progress_percent,
            "current_phase": r.current_phase,
            "created_at": r.created_at,
        }
        for r in roadmaps
    ]


@router.get("/{roadmap_id}")
def get_roadmap(
    roadmap_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get a specific roadmap by ID."""
    roadmap = db.query(Roadmap).filter(
        Roadmap.id == roadmap_id,
        Roadmap.user_id == current_user.id
    ).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


@router.put("/{roadmap_id}/progress")
def update_roadmap_progress(
    roadmap_id: int,
    request: RoadmapProgressRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Update roadmap progress."""
    roadmap = db.query(Roadmap).filter(
        Roadmap.id == roadmap_id,
        Roadmap.user_id == current_user.id
    ).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")

    roadmap.progress_percent = request.progress_percent
    if request.current_phase:
        roadmap.current_phase = request.current_phase
    if request.completed_topics is not None:
        roadmap.completed_topics = request.completed_topics
    if request.status:
        roadmap.status = request.status
    db.commit()
    return {"message": "Progress updated", "progress_percent": roadmap.progress_percent}
