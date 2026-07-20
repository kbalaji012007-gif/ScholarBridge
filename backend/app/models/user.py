from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, Text, Enum, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database.base import Base


class GenderEnum(str, enum.Enum):
    male = "male"
    female = "female"
    other = "other"
    prefer_not_to_say = "prefer_not_to_say"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String(512), nullable=True)
    reset_token = Column(String(512), nullable=True)
    reset_token_expires = Column(DateTime, nullable=True)

    # Personal Info
    full_name = Column(String(255), nullable=True)
    dob = Column(String(20), nullable=True)
    gender = Column(String(30), nullable=True)
    phone = Column(String(20), nullable=True)
    address = Column(Text, nullable=True)
    profile_photo = Column(String(512), nullable=True)

    # Academic Info
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    college = Column(String(255), nullable=True)
    university = Column(String(255), nullable=True)
    course = Column(String(100), nullable=True)
    branch = Column(String(100), nullable=True)
    semester = Column(Integer, nullable=True)
    cgpa = Column(Float, nullable=True)

    # Eligibility Info
    category = Column(String(50), nullable=True)      # General/SC/ST/OBC/EWS
    religion = Column(String(50), nullable=True)
    is_minority = Column(Boolean, default=False)
    family_income = Column(Float, nullable=True)
    has_disability = Column(Boolean, default=False)
    disability_type = Column(String(100), nullable=True)
    has_sports_quota = Column(Boolean, default=False)
    has_ncc = Column(Boolean, default=False)

    # Career & Skills (new CareerBridge AI fields)
    skills = Column(JSON, nullable=True)               # ["Python", "SQL", "React", ...]
    career_interests = Column(JSON, nullable=True)     # ["Data Analyst", "Backend Dev", ...]
    resume_path = Column(String(512), nullable=True)   # uploaded resume file path
    linkedin_url = Column(String(512), nullable=True)
    github_url = Column(String(512), nullable=True)
    year_of_study = Column(Integer, nullable=True)     # 1, 2, 3, 4
    target_company = Column(String(255), nullable=True)
    target_role = Column(String(255), nullable=True)

    # Profile completion
    profile_completion = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    applications = relationship("Application", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    saved_scholarships = relationship("SavedScholarship", back_populates="user", cascade="all, delete-orphan")
