"""
Certification model — tracks recommended and earned certifications.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class Certification(Base):
    """Master list of certifications from various providers."""
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    provider = Column(String(255), nullable=False)     # "Google", "AWS", "Microsoft", "Coursera"
    url = Column(String(512), nullable=True)
    level = Column(String(50), nullable=True)          # "Beginner", "Intermediate", "Advanced", "Professional"
    skills_covered = Column(JSON, nullable=True)       # ["Python", "ML", "Data Analysis"]
    career_paths = Column(JSON, nullable=True)         # ["Data Analyst", "ML Engineer"]
    duration_hours = Column(Integer, nullable=True)    # Approximate hours
    cost = Column(String(100), nullable=True)          # "Free", "Paid", "₹2,500"
    is_free = Column(Boolean, default=False)
    rating = Column(Float, nullable=True)              # 1.0-5.0
    badge_image = Column(String(512), nullable=True)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserCertification(Base):
    """Tracks which certifications a student has earned or is pursuing."""
    __tablename__ = "user_certifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    certification_id = Column(Integer, ForeignKey("certifications.id", ondelete="CASCADE"), nullable=False)

    status = Column(String(30), default="planned")     # "planned", "in_progress", "completed"
    completion_date = Column(DateTime, nullable=True)
    certificate_url = Column(String(512), nullable=True)
    credential_id = Column(String(255), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    certification = relationship("Certification", foreign_keys=[certification_id])
