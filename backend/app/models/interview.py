"""
Interview preparation models — questions bank and mock sessions.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class InterviewQuestion(Base):
    """Curated interview question bank."""
    __tablename__ = "interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False)      # "HR", "Technical", "Behavioral", "Coding"
    difficulty = Column(String(20), nullable=True)     # "Easy", "Medium", "Hard"
    role = Column(String(100), nullable=True)          # "Software Engineer", "Data Analyst", etc.
    domain = Column(String(100), nullable=True)        # "Python", "System Design", "DSA"
    question = Column(Text, nullable=False)
    expected_answer = Column(Text, nullable=True)
    tips = Column(Text, nullable=True)                 # Tips for answering
    tags = Column(JSON, nullable=True)                 # ["FAANG", "Startup", "PSU"]
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class InterviewSession(Base):
    """Records a student's mock interview session."""
    __tablename__ = "interview_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Session info
    job_role = Column(String(255), nullable=True)
    session_type = Column(String(50), nullable=True)   # "Technical", "HR", "Full"

    # Questions and answers
    questions_used = Column(JSON, nullable=True)       # [question_id, ...]
    answers_given = Column(JSON, nullable=True)        # [{question_id, answer, score}, ...]

    # Scoring
    overall_score = Column(Float, nullable=True)       # 0-100
    readiness_level = Column(String(50), nullable=True) # "Not Ready", "Beginner", "Intermediate", "Ready"
    feedback = Column(JSON, nullable=True)             # [{aspect, score, comment}, ...]
    ai_feedback = Column(Text, nullable=True)          # Overall AI feedback paragraph

    # Status
    status = Column(String(20), default="in_progress") # "in_progress" / "completed"
    duration_minutes = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
