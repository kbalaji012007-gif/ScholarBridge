from fastapi import APIRouter
from app.api.v1.routes import (
    auth, users, scholarships, applications,
    documents, notifications, analytics, dashboard,
    # New CareerBridge AI routes
    resume, career, roadmaps, interview, certifications, chat,
)

api_router = APIRouter()

# ─── Existing Routes ────────────────────────────────────────────────────
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(scholarships.router, prefix="/scholarships", tags=["Scholarships"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

# ─── New CareerBridge AI Routes ─────────────────────────────────────────
api_router.include_router(resume.router, prefix="/resume", tags=["Resume AI"])
api_router.include_router(career.router, prefix="/career", tags=["Career"])
api_router.include_router(roadmaps.router, prefix="/roadmaps", tags=["Learning Roadmaps"])
api_router.include_router(interview.router, prefix="/interview", tags=["Interview Prep"])
api_router.include_router(certifications.router, prefix="/certifications", tags=["Certifications"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Assistant"])
