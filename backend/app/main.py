from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import logging

from app.core.config import settings
from app.api.v1.router import api_router
from app.database.base import create_tables

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="CareerBridge AI — One Platform for Scholarships, Careers, Placements and AI Guidance",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS — allow Vercel frontend and local dev origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://scholar-bridge-lyart.vercel.app",
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
    ],
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
    """Create tables and optionally seed demo data on startup."""
    try:
        create_tables()
        logger.info("Database tables created/verified successfully.")
    except Exception as e:
        logger.error("Failed to create database tables: %s", repr(e))
        # Don't crash the app — Render will show healthy; tables may already exist

    try:
        await seed_demo_data()
        logger.info("Demo data seeding complete.")
    except Exception as e:
        logger.warning("Demo data seeding failed (non-fatal): %s", repr(e))


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
            db.refresh(student)

        # Seed scholarships only if none exist
        import csv
        if db.query(Scholarship).count() == 0:
            csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "scholarships.csv")
            if os.path.exists(csv_path):
                with open(csv_path, mode="r", encoding="utf-8") as f:
                    reader = csv.DictReader(f)
                    for row in reader:
                        def to_float(val):
                            try: return float(val) if val else None
                            except: return None
                        def to_int(val):
                            try: return int(val) if val else None
                            except: return None
                        def to_bool(val):
                            return val.lower() == "true"
                        
                        s = Scholarship(
                            title=row["title"],
                            provider=row["provider"],
                            provider_type=row["provider_type"],
                            scholarship_type=row.get("scholarship_type", "national"),
                            amount=to_float(row["amount"]),
                            amount_description=row["amount_description"],
                            description=row["description"],
                            official_website=row["official_website"],
                            application_link=row["application_link"],
                            last_date=datetime.utcnow() + timedelta(days=45),
                            status="active",
                            min_cgpa=to_float(row["min_cgpa"]),
                            min_percentage=to_float(row["min_percentage"]),
                            max_income=to_float(row["max_income"]),
                            max_age=to_int(row["max_age"]),
                            applicable_state=row["applicable_state"],
                            eligible_states=[row["applicable_state"]] if row["applicable_state"] != "All" else None,
                            eligible_gender=row["eligible_gender"],
                            minority_only=to_bool(row["minority_only"]),
                            disability_only=to_bool(row["disability_only"]),
                            sports_quota=to_bool(row["sports_quota"]),
                            ncc_required=to_bool(row["ncc_required"]),
                            is_verified=to_bool(row["is_verified"]),
                            created_by=admin.id,
                        )
                        db.add(s)
                db.commit()
                logger.info("Successfully seeded scholarships from CSV.")

        # Seed demo Jobs
        from app.models.job import Job, Internship
        if db.query(Job).count() == 0:
            jobs = [
                Job(
                    title="Junior Data Analyst",
                    company="TechGen solutions",
                    location="Bangalore, Karnataka",
                    job_type="Full-time",
                    work_mode="Hybrid",
                    salary_min=400000.0,
                    salary_max=600000.0,
                    skills_required=["Python", "SQL", "Excel", "Data Visualization"],
                    description="Analyze business data, generate reports, and build basic visualizations.",
                    application_link="https://linkedin.com",
                    deadline=datetime.utcnow() + timedelta(days=30),
                ),
                Job(
                    title="Python Backend Developer",
                    company="Innovate Labs",
                    location="Remote",
                    job_type="Full-time",
                    work_mode="Remote",
                    salary_min=600000.0,
                    salary_max=900000.0,
                    skills_required=["Python", "FastAPI", "SQL", "Git"],
                    description="Develop RESTful APIs, manage databases, and deploy cloud microservices.",
                    application_link="https://linkedin.com",
                    deadline=datetime.utcnow() + timedelta(days=20),
                ),
                Job(
                    title="Associate Software Engineer",
                    company="Wipro",
                    location="Hyderabad, Telangana",
                    job_type="Full-time",
                    work_mode="On-site",
                    salary_min=350000.0,
                    salary_max=500000.0,
                    skills_required=["Java", "SQL", "HTML", "CSS"],
                    description="Entry-level software engineering role focusing on application development and maintenance.",
                    application_link="https://wipro.com",
                    deadline=datetime.utcnow() + timedelta(days=45),
                ),
            ]
            for j in jobs:
                db.add(j)
            db.commit()
            logger.info("Successfully seeded demo jobs.")

        # Seed demo Internships
        if db.query(Internship).count() == 0:
            internships = [
                Internship(
                    title="Data Science Intern",
                    company="Kaggle Labs",
                    location="Remote",
                    work_mode="Remote",
                    duration_months=3,
                    stipend_min=15000.0,
                    stipend_max=20000.0,
                    ppo_available=True,
                    skills_required=["Python", "Pandas", "Scikit-learn"],
                    application_link="https://internshala.com",
                    deadline=datetime.utcnow() + timedelta(days=15),
                ),
                Internship(
                    title="Web Development Intern",
                    company="WebWorks",
                    location="Bangalore, Karnataka",
                    work_mode="Hybrid",
                    duration_months=6,
                    stipend_min=12000.0,
                    stipend_max=18000.0,
                    ppo_available=False,
                    skills_required=["React", "HTML", "CSS", "JavaScript"],
                    application_link="https://internshala.com",
                    deadline=datetime.utcnow() + timedelta(days=10),
                ),
            ]
            for i in internships:
                db.add(i)
            db.commit()
            logger.info("Successfully seeded demo internships.")

        # Seed Certifications
        from app.models.certification import Certification
        if db.query(Certification).count() == 0:
            certs = [
                Certification(
                    name="Google Data Analytics Professional Certificate",
                    provider="Google / Coursera",
                    url="https://coursera.org",
                    level="Beginner",
                    skills_covered=["SQL", "Data Analysis", "Tableau", "R"],
                    career_paths=["Data Analyst"],
                    duration_hours=180,
                    cost="Free (audit)",
                    is_free=True,
                    rating=4.8,
                    description="Gain in-demand skills that can lead to an entry-level job in data analytics.",
                ),
                Certification(
                    name="AWS Certified Cloud Practitioner",
                    provider="AWS",
                    url="https://aws.amazon.com",
                    level="Beginner",
                    skills_covered=["Cloud Computing", "AWS", "Networking"],
                    career_paths=["Cloud Engineer", "DevOps Engineer"],
                    duration_hours=40,
                    cost="₹8,000",
                    is_free=False,
                    rating=4.7,
                    description="Validates overall understanding of the AWS Cloud platform.",
                ),
                Certification(
                    name="Python for Everybody Specialization",
                    provider="University of Michigan / Coursera",
                    url="https://coursera.org",
                    level="Beginner",
                    skills_covered=["Python", "Data Structures", "Databases"],
                    career_paths=["Python Developer", "Data Analyst"],
                    duration_hours=80,
                    cost="Free (audit)",
                    is_free=True,
                    rating=4.9,
                    description="Learn to program and analyze data with Python.",
                ),
            ]
            for c in certs:
                db.add(c)
            db.commit()
            logger.info("Successfully seeded certifications.")

    except Exception as e:
        db.rollback()
        logger.error("seed_demo_data error: %s", repr(e))
        raise
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "version": settings.APP_VERSION,
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
