from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime


class ScholarshipBase(BaseModel):
    title: str
    provider: str
    provider_type: str = "government"
    scholarship_type: Optional[str] = "national"
    amount: Optional[float] = None
    amount_description: Optional[str] = None
    last_date: Optional[datetime] = None
    opening_date: Optional[datetime] = None
    description: Optional[str] = None
    official_website: Optional[str] = None
    application_link: Optional[str] = None
    official_notification: Optional[str] = None
    status: str = "active"

    # Eligibility
    min_cgpa: Optional[float] = None
    min_percentage: Optional[float] = None
    max_income: Optional[float] = None
    max_age: Optional[int] = None
    eligible_states: Optional[List[str]] = None
    applicable_state: Optional[str] = None
    eligible_courses: Optional[List[str]] = None
    eligible_branches: Optional[List[str]] = None
    eligible_categories: Optional[List[str]] = None
    eligible_gender: Optional[str] = "all"
    year_of_study: Optional[List[int]] = None
    minority_only: bool = False
    disability_only: bool = False
    sports_quota: bool = False
    ncc_required: bool = False

    required_documents: Optional[List[str]] = None
    renewal_rules: Optional[str] = None
    selection_process: Optional[str] = None
    benefits: Optional[str] = None
    is_verified: bool = False
    last_updated: Optional[datetime] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None


class ScholarshipCreate(ScholarshipBase):
    pass


class ScholarshipUpdate(ScholarshipBase):
    title: Optional[str] = None
    provider: Optional[str] = None


class ScholarshipOut(ScholarshipBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ScholarshipWithEligibility(ScholarshipOut):
    eligibility_status: Optional[str] = None   # eligible / partial / not_eligible
    eligibility_reasons: Optional[List[str]] = None
    missing_documents: Optional[List[str]] = None
    is_saved: Optional[bool] = False
    application_status: Optional[str] = None
