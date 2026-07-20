from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Build engine with appropriate settings for SQLite vs PostgreSQL (Supabase)
_db_url = settings.DATABASE_URL

if _db_url.startswith("sqlite"):
    engine = create_engine(
        _db_url,
        connect_args={"check_same_thread": False},
    )
else:
    # PostgreSQL / Supabase — use connection pooling + health-check pings
    engine = create_engine(
        _db_url,
        pool_pre_ping=True,        # verify connection before use
        pool_size=5,               # keep 5 warm connections
        max_overflow=10,           # allow up to 10 extra connections under load
        pool_recycle=300,          # recycle connections every 5 minutes
        connect_args={
            "connect_timeout": 10,
            "sslmode": "require",  # Supabase requires SSL
        },
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a database session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_tables():
    """Import all models then create every table that doesn't already exist."""
    # Ensure all model classes are registered with Base.metadata before create_all
    from app.models import (  # noqa: F401
        user, scholarship, application, document, notification, saved_scholarship,
        resume_analysis, job, roadmap, interview, certification, chat
    )
    Base.metadata.create_all(bind=engine)
    logger.info("create_tables: all tables created/verified.")
    
    # Run auto-migrations for schema updates
    try:
        from app.database.migration import run_auto_migrations
        run_auto_migrations()
    except Exception as e:
        logger.error("Failed to run auto-migrations: %s", repr(e))
