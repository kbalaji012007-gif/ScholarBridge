"""
Career API routes — skill gap analysis, job/internship matching.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from app.database.base import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.job import Job, Internship
from app.services import ai_service

router = APIRouter()


class SkillGapRequest(BaseModel):
    job_description: str
    target_role: Optional[str] = None


@router.post("/skill-gap")
def analyze_skill_gap(
    request: SkillGapRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Analyze skill gap between user's skills and a job description."""
    user_skills = current_user.skills or []
    result = ai_service.analyze_skill_gap(user_skills, request.job_description)
    return result


@router.get("/jobs")
def list_jobs(
    search: Optional[str] = None,
    job_type: Optional[str] = None,
    work_mode: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List active jobs with optional filters."""
    q = db.query(Job).filter(Job.is_active == True)
    if search:
        q = q.filter(Job.title.ilike(f"%{search}%") | Job.company.ilike(f"%{search}%"))
    if job_type:
        q = q.filter(Job.job_type == job_type)
    if work_mode:
        q = q.filter(Job.work_mode == work_mode)
    jobs = q.offset(skip).limit(limit).all()

    user_skills = set(s.lower() for s in (current_user.skills or []))
    result = []
    for job in jobs:
        job_skills = set(s.lower() for s in (job.skills_required or []))
        match = round(len(user_skills & job_skills) / max(len(job_skills), 1) * 100) if job_skills else 0
        result.append({
            "id": job.id,
            "title": job.title,
            "company": job.company,
            "location": job.location,
            "job_type": job.job_type,
            "work_mode": job.work_mode,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "skills_required": job.skills_required,
            "description": job.description,
            "application_link": job.application_link,
            "deadline": job.deadline,
            "match_percent": match,
        })
    return sorted(result, key=lambda x: x["match_percent"], reverse=True)


@router.get("/internships")
def list_internships(
    search: Optional[str] = None,
    work_mode: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """List active internships with match percentage."""
    q = db.query(Internship).filter(Internship.is_active == True)
    if search:
        q = q.filter(Internship.title.ilike(f"%{search}%") | Internship.company.ilike(f"%{search}%"))
    if work_mode:
        q = q.filter(Internship.work_mode == work_mode)
    internships = q.offset(skip).limit(limit).all()

    user_skills = set(s.lower() for s in (current_user.skills or []))
    result = []
    for intern in internships:
        intern_skills = set(s.lower() for s in (intern.skills_required or []))
        match = round(len(user_skills & intern_skills) / max(len(intern_skills), 1) * 100) if intern_skills else 0
        result.append({
            "id": intern.id,
            "title": intern.title,
            "company": intern.company,
            "location": intern.location,
            "work_mode": intern.work_mode,
            "duration_months": intern.duration_months,
            "stipend_min": intern.stipend_min,
            "stipend_max": intern.stipend_max,
            "ppo_available": intern.ppo_available,
            "skills_required": intern.skills_required,
            "application_link": intern.application_link,
            "deadline": intern.deadline,
            "match_percent": match,
        })
    return sorted(result, key=lambda x: x["match_percent"], reverse=True)


@router.get("/career-paths")
def get_career_paths(
    current_user: User = Depends(get_current_active_user),
):
    """Return recommended career paths based on user skills and interests."""
    # Static career path data — could be AI-generated in future
    career_paths = [
        {"id": 1, "title": "Data Analyst", "icon": "BarChart3", "salary_range": "₹4L - ₹12L", "demand": "Very High", "skills_needed": ["Python", "SQL", "Tableau", "Excel", "Statistics"]},
        {"id": 2, "title": "Full Stack Developer", "icon": "Code2", "salary_range": "₹5L - ₹18L", "demand": "Very High", "skills_needed": ["React", "Node.js", "Python", "PostgreSQL", "REST APIs"]},
        {"id": 3, "title": "Machine Learning Engineer", "icon": "Brain", "salary_range": "₹8L - ₹25L", "demand": "High", "skills_needed": ["Python", "TensorFlow", "PyTorch", "Statistics", "Docker"]},
        {"id": 4, "title": "DevOps Engineer", "icon": "Settings", "salary_range": "₹6L - ₹20L", "demand": "High", "skills_needed": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux"]},
        {"id": 5, "title": "Cloud Architect", "icon": "Cloud", "salary_range": "₹10L - ₹35L", "demand": "High", "skills_needed": ["AWS", "Azure", "GCP", "Terraform", "Networking"]},
        {"id": 6, "title": "Cybersecurity Analyst", "icon": "Shield", "salary_range": "₹5L - ₹20L", "demand": "Very High", "skills_needed": ["Networking", "Linux", "Python", "Security Tools", "Risk Assessment"]},
    ]

    user_skills = set(s.lower() for s in (current_user.skills or []))
    for path in career_paths:
        path_skills = set(s.lower() for s in path["skills_needed"])
        path["match_percent"] = round(len(user_skills & path_skills) / max(len(path_skills), 1) * 100)
        path["missing_skills"] = [s for s in path["skills_needed"] if s.lower() not in user_skills]

    return sorted(career_paths, key=lambda x: x["match_percent"], reverse=True)
