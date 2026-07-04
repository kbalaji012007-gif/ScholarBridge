"""
Document verification service – validates file type, size, duplicates.
"""
import os
from typing import Tuple, Optional
from fastapi import UploadFile
from app.core.config import settings

ALLOWED_MIME_TYPES = {
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
}

MAX_FILE_SIZE = settings.MAX_FILE_SIZE_MB * 1024 * 1024  # bytes

DOCUMENT_LABELS = {
    "aadhaar": "Aadhaar Card",
    "pan": "PAN Card",
    "income_certificate": "Income Certificate",
    "caste_certificate": "Caste Certificate",
    "bonafide": "Bonafide Certificate",
    "marks_card": "Marks Card / Transcript",
    "transfer_certificate": "Transfer Certificate",
    "passport_photo": "Passport Photo",
    "bank_passbook": "Bank Passbook",
}


def validate_file(file: UploadFile, file_size: int) -> Tuple[bool, Optional[str]]:
    """
    Validates file type and size.
    Returns (is_valid, error_message).
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        return False, f"File type '{file.content_type}' not allowed. Allowed: PDF, JPEG, PNG"

    if file_size > MAX_FILE_SIZE:
        size_mb = file_size / (1024 * 1024)
        return False, f"File size {size_mb:.1f}MB exceeds maximum {settings.MAX_FILE_SIZE_MB}MB"

    return True, None


def calculate_profile_completion(user) -> int:
    """Calculate the percentage of profile fields filled."""
    fields = [
        user.full_name, user.dob, user.gender, user.phone,
        user.state, user.district, user.college, user.university,
        user.course, user.branch, user.semester, user.cgpa,
        user.category, user.family_income, user.address,
    ]
    filled = sum(1 for f in fields if f is not None and f != "")
    return int((filled / len(fields)) * 100)


def get_document_label(doc_type: str) -> str:
    return DOCUMENT_LABELS.get(doc_type, doc_type.replace("_", " ").title())
