from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os, shutil, uuid
from datetime import datetime

from app.database.base import get_db
from app.core.deps import get_current_active_user, get_current_admin
from app.models.user import User
from app.models.document import Document
from app.models.notification import Notification
from app.schemas.document import DocumentOut, DocumentVerifyUpdate
from app.services.document_verification import validate_file, get_document_label
from app.core.config import settings

router = APIRouter()

DOCUMENT_TYPES = [
    "aadhaar", "pan", "income_certificate", "caste_certificate",
    "bonafide", "marks_card", "transfer_certificate",
    "passport_photo", "bank_passbook",
]


@router.get("/", response_model=List[DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return db.query(Document).filter_by(user_id=current_user.id).all()


@router.post("/upload", response_model=DocumentOut, status_code=201)
async def upload_document(
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if doc_type not in DOCUMENT_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid document type: {doc_type}")

    # Read file to check size
    file_bytes = await file.read()
    file_size = len(file_bytes)

    is_valid, error = validate_file(file, file_size)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error)

    # Save file
    upload_dir = os.path.join(settings.UPLOAD_DIR, "documents", str(current_user.id))
    os.makedirs(upload_dir, exist_ok=True)

    ext = file.filename.split(".")[-1] if "." in file.filename else "pdf"
    filename = f"{doc_type}_{uuid.uuid4().hex}.{ext}"
    file_path = os.path.join(upload_dir, filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Remove previous document of same type
    existing = db.query(Document).filter_by(
        user_id=current_user.id, doc_type=doc_type
    ).first()
    if existing:
        try:
            os.remove(existing.file_path)
        except FileNotFoundError:
            pass
        db.delete(existing)

    doc = Document(
        user_id=current_user.id,
        doc_type=doc_type,
        filename=filename,
        original_filename=file.filename,
        file_path=file_path,
        file_size=file_size,
        mime_type=file.content_type,
        status="pending",
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/admin/all", response_model=List[DocumentOut])
def list_all_documents(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    q = db.query(Document)
    if status:
        q = q.filter(Document.status == status)
    return q.order_by(Document.uploaded_at.desc()).all()


@router.put("/{doc_id}/verify", response_model=DocumentOut)
def verify_document(
    doc_id: int,
    data: DocumentVerifyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    doc.status = data.status
    doc.rejection_reason = data.rejection_reason
    doc.verified_at = datetime.utcnow()
    doc.verified_by = current_user.id

    label = get_document_label(doc.doc_type)
    msg = f"Your {label} has been {data.status}."
    if data.rejection_reason:
        msg += f" Reason: {data.rejection_reason}"

    notif = Notification(
        user_id=doc.user_id,
        title=f"Document {data.status.title()}",
        message=msg,
        notif_type="document",
        action_url="/dashboard/documents",
    )
    db.add(notif)
    db.commit()
    db.refresh(doc)
    return doc


@router.delete("/{doc_id}")
def delete_document(
    doc_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not current_user.is_admin and doc.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        os.remove(doc.file_path)
    except FileNotFoundError:
        pass
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}
