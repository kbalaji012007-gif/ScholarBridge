"""
ChatHistory model — stores AI Career Assistant conversation history.
"""
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.base import Base


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String(100), nullable=False, index=True)  # Groups messages into sessions

    role = Column(String(20), nullable=False)          # "user" | "assistant"
    message = Column(Text, nullable=False)
    context_used = Column(JSON, nullable=True)         # What profile context was injected
    tokens_used = Column(Integer, nullable=True)

    is_starred = Column(Boolean, default=False)        # User can star useful responses
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", foreign_keys=[user_id])
