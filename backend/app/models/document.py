from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    doc_type = Column(String(100), nullable=False)
    # aadhaar, pan, income_certificate, caste_certificate, bonafide,
    # marks_card, transfer_certificate, passport_photo, bank_passbook

    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(512), nullable=False)
    file_size = Column(BigInteger, nullable=True)       # bytes
    mime_type = Column(String(100), nullable=True)

    status = Column(String(30), default="pending")      # pending / verified / rejected
    rejection_reason = Column(String(512), nullable=True)
    is_expired = Column(Boolean, default=False)
    expiry_date = Column(DateTime, nullable=True)

    uploaded_at = Column(DateTime, default=datetime.utcnow)
    verified_at = Column(DateTime, nullable=True)
    verified_by = Column(Integer, nullable=True)        # admin user id

    # Relationships
    user = relationship("User", back_populates="documents")
