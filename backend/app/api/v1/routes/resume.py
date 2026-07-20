"""
Resume API routes — upload, parse, and AI-analyze resumes.
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional
import os, shutil, logging

from app.database.base import get_db
from app.core.deps import get_current_active_user
from app.core.config import settings
from app.models.user import User
from app.models.resume_analysis import ResumeAnalysis
from app.services import resume_parser, ai_service

router = APIRouter()
logger = logging.getLogger(__name__)


def _save_resume_file(file: UploadFile, user_id: int) -> str:
    """Save uploaded resume to disk and return file path."""
    os.makedirs(settings.RESUME_UPLOAD_DIR, exist_ok=True)
    ext = os.path.splitext(file.filename or "resume.pdf")[1].lower() or ".pdf"
    filename = f"resume_user{user_id}{ext}"
    file_path = os.path.join(settings.RESUME_UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    return file_path


@router.post("/upload", status_code=200)
async def upload_resume(
    file: UploadFile = File(...),
    target_role: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Upload a PDF/DOCX resume, extract text, run AI analysis, and store results."""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc", ".txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT.")

    try:
        # Save file
        file_path = _save_resume_file(file, current_user.id)

        # Extract text
        raw_text = resume_parser.extract_text(file_path)

        # Run AI analysis
        analysis_result = ai_service.analyze_resume(raw_text, target_role)

        # Mark old analyses as not latest
        db.query(ResumeAnalysis).filter(
            ResumeAnalysis.user_id == current_user.id,
            ResumeAnalysis.is_latest == True
        ).update({"is_latest": False})

        # Store new analysis
        analysis = ResumeAnalysis(
            user_id=current_user.id,
            file_path=file_path,
            file_name=file.filename,
            raw_text=raw_text[:10000] if raw_text else None,  # Limit stored text
            target_role=target_role,
            ats_score=analysis_result.get("ats_score"),
            ats_grade=analysis_result.get("ats_grade"),
            extracted_skills=analysis_result.get("extracted_skills", []),
            extracted_experience=analysis_result.get("extracted_experience", []),
            extracted_education=analysis_result.get("extracted_education", []),
            extracted_projects=analysis_result.get("extracted_projects", []),
            extracted_certifications=analysis_result.get("extracted_certifications", []),
            extracted_achievements=analysis_result.get("extracted_achievements", []),
            strengths=analysis_result.get("strengths", []),
            weaknesses=analysis_result.get("weaknesses", []),
            missing_keywords=analysis_result.get("missing_keywords", []),
            improvement_suggestions=analysis_result.get("improvement_suggestions", []),
            ai_summary=analysis_result.get("ai_summary"),
            is_latest=True,
        )
        db.add(analysis)

        # Update user resume path
        current_user.resume_path = file_path
        db.commit()
        db.refresh(analysis)

        return {
            "id": analysis.id,
            "ats_score": analysis.ats_score,
            "ats_grade": analysis.ats_grade,
            "extracted_skills": analysis.extracted_skills,
            "extracted_experience": analysis.extracted_experience,
            "extracted_education": analysis.extracted_education,
            "extracted_projects": analysis.extracted_projects,
            "extracted_achievements": analysis.extracted_achievements,
            "strengths": analysis.strengths,
            "weaknesses": analysis.weaknesses,
            "missing_keywords": analysis.missing_keywords,
            "improvement_suggestions": analysis.improvement_suggestions,
            "ai_summary": analysis.ai_summary,
            "file_name": analysis.file_name,
            "created_at": analysis.created_at,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Resume upload error: %s", repr(e))
        raise HTTPException(status_code=500, detail=f"Analysis failed: {repr(e)}")


@router.get("/analysis")
def get_latest_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get the most recent resume analysis for the current user."""
    analysis = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.user_id == current_user.id,
        ResumeAnalysis.is_latest == True
    ).first()

    if not analysis:
        return None

    return {
        "id": analysis.id,
        "ats_score": analysis.ats_score,
        "ats_grade": analysis.ats_grade,
        "extracted_skills": analysis.extracted_skills,
        "extracted_experience": analysis.extracted_experience,
        "extracted_education": analysis.extracted_education,
        "extracted_projects": analysis.extracted_projects,
        "extracted_achievements": analysis.extracted_achievements,
        "strengths": analysis.strengths,
        "weaknesses": analysis.weaknesses,
        "missing_keywords": analysis.missing_keywords,
        "improvement_suggestions": analysis.improvement_suggestions,
        "ai_summary": analysis.ai_summary,
        "file_name": analysis.file_name,
        "target_role": analysis.target_role,
        "created_at": analysis.created_at,
    }


@router.get("/history")
def get_analysis_history(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get resume analysis history."""
    analyses = db.query(ResumeAnalysis).filter(
        ResumeAnalysis.user_id == current_user.id
    ).order_by(ResumeAnalysis.created_at.desc()).limit(limit).all()

    return [{"id": a.id, "ats_score": a.ats_score, "ats_grade": a.ats_grade,
             "file_name": a.file_name, "is_latest": a.is_latest, "created_at": a.created_at}
            for a in analyses]
