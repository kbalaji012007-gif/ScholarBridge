from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str

    @validator("password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None
    college: Optional[str] = None
    university: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    semester: Optional[int] = None
    cgpa: Optional[float] = None
    category: Optional[str] = None
    religion: Optional[str] = None
    is_minority: Optional[bool] = None
    family_income: Optional[float] = None
    has_disability: Optional[bool] = None
    disability_type: Optional[str] = None
    has_sports_quota: Optional[bool] = None
    has_ncc: Optional[bool] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    is_verified: bool
    profile_completion: int
    state: Optional[str]
    district: Optional[str]
    college: Optional[str]
    university: Optional[str]
    course: Optional[str]
    branch: Optional[str]
    semester: Optional[int]
    cgpa: Optional[float]
    category: Optional[str]
    religion: Optional[str]
    is_minority: bool
    family_income: Optional[float]
    has_disability: bool
    has_sports_quota: bool
    has_ncc: bool
    gender: Optional[str]
    dob: Optional[str]
    phone: Optional[str]
    address: Optional[str]
    profile_photo: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @validator("new_password")
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v
