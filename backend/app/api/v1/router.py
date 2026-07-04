from fastapi import APIRouter
from app.api.v1.routes import auth, users, scholarships, applications, documents, notifications, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(scholarships.router, prefix="/scholarships", tags=["Scholarships"])
api_router.include_router(applications.router, prefix="/applications", tags=["Applications"])
api_router.include_router(documents.router, prefix="/documents", tags=["Documents"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
