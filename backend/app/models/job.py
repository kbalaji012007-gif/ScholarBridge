"""
Job and Internship models.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean
from datetime import datetime
from app.database.base import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    job_type = Column(String(50), nullable=True)    # "Full-time", "Part-time", "Remote"
    work_mode = Column(String(50), nullable=True)   # "Remote", "Hybrid", "On-site"

    # Salary
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    salary_currency = Column(String(10), default="INR")

    # Requirements
    skills_required = Column(JSON, nullable=True)   # ["Python", "Django", ...]
    experience_years = Column(Float, nullable=True) # Minimum years of experience
    education_required = Column(String(255), nullable=True)  # "B.Tech / BE"

    # Meta
    description = Column(Text, nullable=True)
    application_link = Column(String(512), nullable=True)
    deadline = Column(DateTime, nullable=True)
    source = Column(String(100), nullable=True)     # "LinkedIn", "Naukri", etc.
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Internship(Base):
    __tablename__ = "internships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    location = Column(String(255), nullable=True)
    work_mode = Column(String(50), nullable=True)   # "Remote", "Hybrid", "On-site"

    # Duration & Stipend
    duration_months = Column(Integer, nullable=True)
    stipend_min = Column(Float, nullable=True)
    stipend_max = Column(Float, nullable=True)
    stipend_currency = Column(String(10), default="INR")
    ppo_available = Column(Boolean, default=False)  # Pre-Placement Offer

    # Requirements
    skills_required = Column(JSON, nullable=True)
    eligible_courses = Column(JSON, nullable=True)  # ["B.Tech", "BCA", ...]
    eligible_years = Column(JSON, nullable=True)    # [2, 3] — year of study

    # Meta
    description = Column(Text, nullable=True)
    application_link = Column(String(512), nullable=True)
    deadline = Column(DateTime, nullable=True)
    source = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
