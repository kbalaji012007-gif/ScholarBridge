from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ApplicationCreate(BaseModel):
    scholarship_id: int
    notes: Optional[str] = None


class ApplicationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    admin_remarks: Optional[str] = None


class ScholarshipBrief(BaseModel):
    id: int
    title: str
    provider: str
    amount: Optional[float]
    last_date: Optional[datetime]
    provider_type: str

    class Config:
        from_attributes = True


class ApplicationOut(BaseModel):
    id: int
    user_id: int
    scholarship_id: int
    status: str
    notes: Optional[str]
    admin_remarks: Optional[str]
    submitted_at: Optional[datetime]
    reviewed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    scholarship: Optional[ScholarshipBrief] = None

    class Config:
        from_attributes = True
