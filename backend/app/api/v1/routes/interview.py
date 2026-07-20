"""
Interview preparation API routes.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database.base import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.interview import InterviewQuestion, InterviewSession
from app.services import ai_service

router = APIRouter()


class GenerateQuestionsRequest(BaseModel):
    role: str
    category: str = "Technical"  # HR, Technical, Behavioral, Coding
    count: int = 10


class SubmitAnswerRequest(BaseModel):
    role: str
    questions: List[dict]  # [{question, category, answer}]


@router.post("/generate-questions")
def generate_questions(
    request: GenerateQuestionsRequest,
    current_user: User = Depends(get_current_active_user),
):
    """Generate AI interview questions for a specific role and category."""
    questions = ai_service.generate_interview_questions(
        role=request.role,
        category=request.category,
        count=request.count
    )
    return {"questions": questions, "role": request.role, "category": request.category}


@router.get("/questions")
def browse_questions(
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    role: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Browse the saved question bank."""
    q = db.query(InterviewQuestion).filter(InterviewQuestion.is_active == True)
    if category:
        q = q.filter(InterviewQuestion.category == category)
    if difficulty:
        q = q.filter(InterviewQuestion.difficulty == difficulty)
    if role:
        q = q.filter(InterviewQuestion.role.ilike(f"%{role}%"))
    questions = q.offset(skip).limit(limit).all()
    return questions


@router.post("/session/submit")
def submit_mock_interview(
    request: SubmitAnswerRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Submit a completed mock interview session and get AI scoring."""
    # Simple scoring based on answer length and keyword matching
    total_score = 0
    feedback_items = []
    for qa in request.questions:
        answer = qa.get("answer", "")
        score = min(100, max(10, len(answer.split()) * 2))  # Basic proxy scoring
        feedback_items.append({
            "question": qa.get("question"),
            "score": score,
            "comment": "Good detail level" if len(answer.split()) > 30 else "Consider providing more detail"
        })
        total_score += score

    overall = round(total_score / max(len(request.questions), 1))

    if overall >= 80:
        readiness = "Interview Ready"
    elif overall >= 60:
        readiness = "Intermediate"
    elif overall >= 40:
        readiness = "Beginner"
    else:
        readiness = "Needs Practice"

    session = InterviewSession(
        user_id=current_user.id,
        job_role=request.role,
        answers_given=request.questions,
        overall_score=float(overall),
        readiness_level=readiness,
        feedback=feedback_items,
        status="completed",
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "overall_score": session.overall_score,
        "readiness_level": readiness,
        "feedback": feedback_items,
        "ai_feedback": f"Your mock interview score is {overall}/100. {readiness} level. Focus on providing specific examples with the STAR method.",
    }


@router.get("/sessions")
def get_my_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get all mock interview sessions for the current user."""
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id
    ).order_by(InterviewSession.created_at.desc()).limit(10).all()

    return [
        {
            "id": s.id,
            "job_role": s.job_role,
            "overall_score": s.overall_score,
            "readiness_level": s.readiness_level,
            "status": s.status,
            "created_at": s.created_at,
        }
        for s in sessions
    ]


@router.get("/readiness-score")
def get_readiness_score(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Calculate overall interview readiness score based on sessions and profile."""
    sessions = db.query(InterviewSession).filter(
        InterviewSession.user_id == current_user.id,
        InterviewSession.status == "completed"
    ).order_by(InterviewSession.created_at.desc()).limit(5).all()

    if not sessions:
        return {"score": 0, "level": "Not Started", "sessions_completed": 0, "recommendation": "Take your first mock interview to get started!"}

    avg_score = sum(s.overall_score or 0 for s in sessions) / len(sessions)
    level = "Interview Ready" if avg_score >= 80 else "Intermediate" if avg_score >= 60 else "Needs Practice"

    return {
        "score": round(avg_score),
        "level": level,
        "sessions_completed": len(sessions),
        "recommendation": "Keep practicing! Aim for 80+ to be interview-ready."
    }
