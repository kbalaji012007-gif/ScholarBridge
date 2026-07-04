from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class Scholarship(Base):
    __tablename__ = "scholarships"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(300), nullable=False, index=True)
    provider = Column(String(255), nullable=False)
    provider_type = Column(String(20), default="government")  # government / private
    amount = Column(Float, nullable=True)
    amount_description = Column(String(255), nullable=True)
    last_date = Column(DateTime, nullable=True)
    description = Column(Text, nullable=True)
    official_website = Column(String(512), nullable=True)
    status = Column(String(20), default="active")  # active / inactive / expired

    # Eligibility criteria
    min_cgpa = Column(Float, nullable=True)
    max_income = Column(Float, nullable=True)
    eligible_states = Column(JSON, nullable=True)       # ["Karnataka","Maharashtra",...]
    eligible_courses = Column(JSON, nullable=True)      # ["B.Tech","M.Tech",...]
    eligible_categories = Column(JSON, nullable=True)   # ["SC","ST","OBC",...]
    eligible_gender = Column(String(30), nullable=True) # "all"/"male"/"female"
    minority_only = Column(Boolean, default=False)
    disability_only = Column(Boolean, default=False)
    sports_quota = Column(Boolean, default=False)
    ncc_required = Column(Boolean, default=False)

    # Required documents
    required_documents = Column(JSON, nullable=True)    # ["aadhaar","income_certificate",...]

    created_by = Column(Integer, nullable=True)  # admin user id
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    applications = relationship("Application", back_populates="scholarship", cascade="all, delete-orphan")
    saved_by = relationship("SavedScholarship", back_populates="scholarship", cascade="all, delete-orphan")
