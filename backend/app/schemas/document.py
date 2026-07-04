from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DocumentOut(BaseModel):
    id: int
    user_id: int
    doc_type: str
    filename: str
    original_filename: str
    file_path: str
    file_size: Optional[int]
    mime_type: Optional[str]
    status: str
    rejection_reason: Optional[str]
    is_expired: bool
    expiry_date: Optional[datetime]
    uploaded_at: datetime
    verified_at: Optional[datetime]

    class Config:
        from_attributes = True


class DocumentVerifyUpdate(BaseModel):
    status: str         # verified / rejected
    rejection_reason: Optional[str] = None


class DocumentTypeInfo(BaseModel):
    doc_type: str
    label: str
    required: bool = True
    uploaded: bool = False
    status: Optional[str] = None
    document: Optional[DocumentOut] = None
