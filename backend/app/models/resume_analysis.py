"""
ResumeAnalysis model — stores AI-generated resume analysis results.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # File info
    file_path = Column(String(512), nullable=True)
    file_name = Column(String(255), nullable=True)
    raw_text = Column(Text, nullable=True)  # Extracted text from PDF

    # AI Analysis Results
    ats_score = Column(Float, nullable=True)          # 0-100
    ats_grade = Column(String(20), nullable=True)     # "Excellent", "Good", "Average", "Poor"

    # Extracted sections (JSON)
    extracted_skills = Column(JSON, nullable=True)    # ["Python", "SQL", ...]
    extracted_experience = Column(JSON, nullable=True) # [{company, role, duration}, ...]
    extracted_education = Column(JSON, nullable=True)  # [{degree, institution, year}, ...]
    extracted_projects = Column(JSON, nullable=True)   # [{name, description, tech_stack}, ...]
    extracted_certifications = Column(JSON, nullable=True)  # [cert_name, ...]
    extracted_achievements = Column(JSON, nullable=True)    # [achievement_text, ...]

    # Feedback
    strengths = Column(JSON, nullable=True)           # ["Good action verbs", ...]
    weaknesses = Column(JSON, nullable=True)          # ["No quantified achievements", ...]
    missing_keywords = Column(JSON, nullable=True)    # Keywords missing for target role
    improvement_suggestions = Column(JSON, nullable=True)  # Ordered list of suggestions
    ai_summary = Column(Text, nullable=True)          # Paragraph summary by AI

    # Target role context
    target_role = Column(String(255), nullable=True)

    is_latest = Column(Boolean, default=True)  # Whether this is the most recent analysis
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
