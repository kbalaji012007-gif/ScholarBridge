"""
AI Chat Assistant API routes.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from app.database.base import get_db
from app.core.deps import get_current_active_user
from app.models.user import User
from app.models.chat import ChatHistory
from app.services import ai_service

router = APIRouter()


class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None


@router.post("/message")
def send_message(
    request: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Send a message to the AI Career Assistant and get a response."""
    session_id = request.session_id or str(uuid.uuid4())

    # Get recent history for this session
    history_records = db.query(ChatHistory).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.session_id == session_id,
    ).order_by(ChatHistory.created_at.asc()).limit(12).all()

    history = [{"role": h.role, "message": h.message} for h in history_records]

    # Build user context from profile
    user_context = {
        "name": current_user.full_name,
        "college": current_user.college,
        "course": current_user.course,
        "branch": current_user.branch,
        "cgpa": current_user.cgpa,
        "category": current_user.category,
        "state": current_user.state,
        "family_income": current_user.family_income,
        "skills": current_user.skills or [],
        "career_interests": current_user.career_interests or [],
        "target_role": current_user.target_role,
    }

    # Get AI response
    ai_response = ai_service.chat_with_assistant(
        message=request.message,
        user_context=user_context,
        history=history,
    )

    # Save user message
    user_msg = ChatHistory(
        user_id=current_user.id,
        session_id=session_id,
        role="user",
        message=request.message,
        context_used=user_context,
    )
    db.add(user_msg)

    # Save AI response
    ai_msg = ChatHistory(
        user_id=current_user.id,
        session_id=session_id,
        role="assistant",
        message=ai_response,
    )
    db.add(ai_msg)
    db.commit()

    return {
        "session_id": session_id,
        "response": ai_response,
        "role": "assistant",
    }


@router.get("/history")
def get_chat_history(
    session_id: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get chat history. If session_id provided, get that session; else latest messages."""
    q = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id)
    if session_id:
        q = q.filter(ChatHistory.session_id == session_id)
    messages = q.order_by(ChatHistory.created_at.asc()).limit(limit).all()

    return [
        {"id": m.id, "session_id": m.session_id, "role": m.role,
         "message": m.message, "is_starred": m.is_starred, "created_at": m.created_at}
        for m in messages
    ]


@router.get("/sessions")
def get_chat_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Get list of unique chat sessions for the current user."""
    from sqlalchemy import distinct, func
    sessions = db.query(
        ChatHistory.session_id,
        func.min(ChatHistory.created_at).label("started_at"),
        func.count(ChatHistory.id).label("message_count"),
    ).filter(
        ChatHistory.user_id == current_user.id,
        ChatHistory.role == "user"
    ).group_by(ChatHistory.session_id).order_by(func.min(ChatHistory.created_at).desc()).limit(10).all()

    return [{"session_id": s.session_id, "started_at": s.started_at, "message_count": s.message_count}
            for s in sessions]


@router.delete("/clear")
def clear_chat_history(
    session_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Clear chat history. If session_id provided, clear only that session."""
    q = db.query(ChatHistory).filter(ChatHistory.user_id == current_user.id)
    if session_id:
        q = q.filter(ChatHistory.session_id == session_id)
    deleted = q.delete()
    db.commit()
    return {"message": f"Cleared {deleted} messages"}
