from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.core.config import settings

from app.api.v1.router import api_router
from app.database.base import create_tables

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI Scholarship Eligibility & Document Verification Portal",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Serve uploaded files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")


@app.on_event("startup")
async def startup_event():
    create_tables()
    await seed_demo_data()


async def seed_demo_data():
    """Create demo admin and sample scholarships on first run."""
    from app.database.base import SessionLocal
    from app.models.user import User
    from app.models.scholarship import Scholarship
    from app.core.security import get_password_hash
    from datetime import datetime, timedelta

    db = SessionLocal()
    try:
        # Create admin if not exists
        admin = db.query(User).filter(User.email == "admin@scholarbridge.com").first()
        if not admin:
            admin = User(
                email="admin@scholarbridge.com",
                hashed_password=get_password_hash("Admin@123"),
                full_name="ScholarBridge Admin",
                is_admin=True,
                is_active=True,
                is_verified=True,
            )
            db.add(admin)
            db.commit()
            db.refresh(admin)

        # Create demo student if not exists
        student = db.query(User).filter(User.email == "student@example.com").first()
        if not student:
            student = User(
                email="student@example.com",
                hashed_password=get_password_hash("Student@123"),
                full_name="Rahul Sharma",
                is_admin=False,
                is_active=True,
                is_verified=True,
                state="Karnataka",
                college="IIT Bangalore",
                course="B.Tech",
                branch="Computer Science",
                semester=5,
                cgpa=8.5,
                category="General",
                family_income=400000,
                gender="male",
                profile_completion=75,
            )
            db.add(student)
            db.commit()

        # Seed scholarships
        if db.query(Scholarship).count() == 0:
            scholarships = [
                Scholarship(
                    title="National Scholarship for SC/ST Students",
                    provider="Ministry of Social Justice",
                    provider_type="government",
                    amount=50000,
                    last_date=datetime.utcnow() + timedelta(days=45),
                    description="Central government scholarship for meritorious SC/ST students pursuing higher education.",
                    eligible_categories=["SC", "ST"],
                    eligible_courses=["B.Tech", "B.Sc", "B.Com", "BA", "M.Tech"],
                    min_cgpa=6.0,
                    max_income=250000,
                    eligible_gender="all",
                    required_documents=["aadhaar", "income_certificate", "caste_certificate", "marks_card", "bonafide"],
                    status="active",
                    created_by=admin.id,
                ),
                Scholarship(
                    title="Post Matric Scholarship for OBC",
                    provider="Ministry of Social Justice & Empowerment",
                    provider_type="government",
                    amount=35000,
                    last_date=datetime.utcnow() + timedelta(days=60),
                    description="Scholarship to support OBC students in post-matric education.",
                    eligible_categories=["OBC"],
                    min_cgpa=5.5,
                    max_income=300000,
                    eligible_gender="all",
                    required_documents=["aadhaar", "income_certificate", "caste_certificate", "marks_card"],
                    status="active",
                    created_by=admin.id,
                ),
                Scholarship(
                    title="Tata Trusts Merit Scholarship",
                    provider="Tata Trusts",
                    provider_type="private",
                    amount=100000,
                    last_date=datetime.utcnow() + timedelta(days=30),
                    description="Merit-based scholarship from Tata Trusts for outstanding engineering students.",
                    eligible_courses=["B.Tech", "B.E"],
                    min_cgpa=8.0,
                    max_income=600000,
                    eligible_gender="all",
                    required_documents=["aadhaar", "income_certificate", "marks_card", "bonafide", "bank_passbook"],
                    status="active",
                    created_by=admin.id,
                ),
                Scholarship(
                    title="Inspire Scholarship for Women in STEM",
                    provider="Department of Science & Technology",
                    provider_type="government",
                    amount=80000,
                    last_date=datetime.utcnow() + timedelta(days=90),
                    description="Scholarship empowering women to pursue STEM education.",
                    eligible_gender="female",
                    eligible_courses=["B.Tech", "B.Sc", "M.Sc", "M.Tech"],
                    min_cgpa=7.5,
                    required_documents=["aadhaar", "marks_card", "bonafide"],
                    status="active",
                    created_by=admin.id,
                ),
                Scholarship(
                    title="Reliance Foundation Undergraduate Scholarship",
                    provider="Reliance Foundation",
                    provider_type="private",
                    amount=200000,
                    last_date=datetime.utcnow() + timedelta(days=15),
                    description="Comprehensive scholarship covering tuition and living expenses for undergraduate students.",
                    min_cgpa=6.5,
                    max_income=800000,
                    eligible_gender="all",
                    required_documents=["aadhaar", "income_certificate", "marks_card", "bonafide", "bank_passbook"],
                    status="active",
                    created_by=admin.id,
                ),
                Scholarship(
                    title="Karnataka Rajyotsava Scholarship",
                    provider="Government of Karnataka",
                    provider_type="government",
                    amount=25000,
                    last_date=datetime.utcnow() + timedelta(days=20),
                    description="State scholarship for Karnataka students celebrating Rajyotsava.",
                    eligible_states=["Karnataka"],
                    eligible_gender="all",
                    min_cgpa=6.0,
                    required_documents=["aadhaar", "bonafide", "marks_card"],
                    status="active",
                    created_by=admin.id,
                ),
            ]
            for s in scholarships:
                db.add(s)
            db.commit()
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": f"Welcome to {settings.APP_NAME} API", "version": settings.APP_VERSION, "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "healthy"}
