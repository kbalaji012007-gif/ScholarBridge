"""
Roadmap model — stores AI-generated learning roadmaps.
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Goal
    goal = Column(String(255), nullable=False)           # "Data Analyst", "Full Stack Dev", etc.
    target_role = Column(String(255), nullable=True)
    duration_days = Column(Integer, nullable=False)      # 30, 60, 90

    # Roadmap content (JSON structure)
    phases = Column(JSON, nullable=True)
    # Format: [
    #   {
    #     "phase": 1, "title": "Foundation", "days": "1-30",
    #     "topics": ["Python Basics", "Data Types", ...],
    #     "resources": [{"type": "youtube", "title": "...", "url": "..."}],
    #     "projects": ["Build a calculator", ...],
    #     "platforms": ["LeetCode", "HackerRank"],
    #   }
    # ]

    # Progress tracking
    status = Column(String(20), default="active")        # "active" / "completed" / "paused"
    progress_percent = Column(Float, default=0.0)
    current_phase = Column(Integer, default=1)
    completed_topics = Column(JSON, nullable=True)       # List of completed topic strings

    # AI metadata
    ai_generated = Column(Boolean, default=True)
    ai_summary = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
