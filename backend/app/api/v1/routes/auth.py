from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets

from app.database.base import get_db
from app.models.user import User
from app.models.notification import Notification
from app.schemas.user import (
    UserCreate, UserLogin, TokenResponse, UserOut,
    ForgotPasswordRequest, ResetPasswordRequest
)
from app.core.security import (
    get_password_hash, verify_password,
    create_access_token, create_refresh_token,
    create_verification_token, decode_token
)
from app.services.document_verification import calculate_profile_completion

router = APIRouter()


@router.post("/signup", response_model=dict, status_code=201)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    verification_token = create_verification_token(user_data.email)
    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        verification_token=verification_token,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create welcome notification
    notif = Notification(
        user_id=user.id,
        title="Welcome to ScholarBridge! 🎓",
        message="Complete your profile to discover scholarships you're eligible for.",
        notif_type="info",
        action_url="/dashboard/profile",
    )
    db.add(notif)
    db.commit()

    # In production: send verification email
    print(f"[EMAIL] Verify: token={verification_token}")

    return {
        "message": "Account created successfully. Please verify your email.",
        "user_id": user.id,
        "verification_token": verification_token,  # expose for dev convenience
    }


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = create_refresh_token({"sub": str(user.id)})

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.model_validate(user),
    )


@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    payload = decode_token(token)
    if not payload or payload.get("type") != "verification":
        raise HTTPException(status_code=400, detail="Invalid or expired token")

    email = payload.get("sub")
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_verified = True
    user.verification_token = None
    db.commit()
    return {"message": "Email verified successfully"}


@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if user:
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.utcnow() + timedelta(hours=1)
        db.commit()
        # In production: send email
        print(f"[EMAIL] Reset token: {reset_token}")
    # Always return success to prevent email enumeration
    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == request.token).first()
    if not user or not user.reset_token_expires or user.reset_token_expires < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    user.hashed_password = get_password_hash(request.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    db.commit()
    return {"message": "Password reset successfully"}


@router.post("/refresh")
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}
