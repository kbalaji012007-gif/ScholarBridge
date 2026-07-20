"""
Auto-migration utility — inspects existing database schema and runs ALTER TABLE statements
to add missing columns automatically. This prevents crashes when columns are added to existing tables.
"""
import logging
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session
from app.database.base import engine

logger = logging.getLogger(__name__)


def run_auto_migrations():
    """Check for missing columns and run ALTER TABLE statements if needed."""
    inspector = inspect(engine)
    
    # 1. Migrate Users table
    user_columns = {col["name"]: col["type"] for col in inspector.get_columns("users")}
    
    users_to_add = {
        "skills": "JSON",
        "career_interests": "JSON",
        "resume_path": "VARCHAR(512)",
        "linkedin_url": "VARCHAR(512)",
        "github_url": "VARCHAR(512)",
        "year_of_study": "INTEGER",
        "target_company": "VARCHAR(255)",
        "target_role": "VARCHAR(255)",
    }

    with engine.connect() as conn:
        # We need to run ALTER TABLE statements in a transaction
        trans = conn.begin()
        try:
            db_type = engine.url.drivername
            is_sqlite = "sqlite" in db_type
            
            # Migrate users columns
            for col_name, col_type in users_to_add.items():
                if col_name not in user_columns:
                    # SQLite does not support JSON type natively, use TEXT or just VARCHAR/JSON based on SQLite compatibility
                    type_str = "TEXT" if (is_sqlite and col_type == "JSON") else col_type
                    logger.info(f"Adding column {col_name} ({type_str}) to users table...")
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {type_str}"))
            
            # 2. Migrate Scholarships table
            scholarship_columns = {col["name"]: col["type"] for col in inspector.get_columns("scholarships")}
            
            scholarships_to_add = {
                "scholarship_type": "VARCHAR(30)",
                "opening_date": "TIMESTAMP" if not is_sqlite else "DATETIME",
                "min_percentage": "FLOAT",
                "max_age": "INTEGER",
                "applicable_state": "VARCHAR(100)",
                "eligible_branches": "JSON",
                "year_of_study": "JSON",
                "renewal_rules": "TEXT",
                "selection_process": "TEXT",
                "benefits": "TEXT",
                "is_verified": "BOOLEAN DEFAULT FALSE" if not is_sqlite else "BOOLEAN DEFAULT 0",
                "last_updated": "TIMESTAMP" if not is_sqlite else "DATETIME",
                "official_notification": "VARCHAR(512)",
                "application_link": "VARCHAR(512)",
            }
            
            for col_name, col_type in scholarships_to_add.items():
                if col_name not in scholarship_columns:
                    type_str = "TEXT" if (is_sqlite and col_type == "JSON") else col_type
                    logger.info(f"Adding column {col_name} ({type_str}) to scholarships table...")
                    conn.execute(text(f"ALTER TABLE scholarships ADD COLUMN {col_name} {type_str}"))
                    
            trans.commit()
            logger.info("Auto-migrations completed successfully.")
        except Exception as e:
            trans.rollback()
            logger.error(f"Auto-migration failed: {repr(e)}")
            # Raise so the app startup is aware
            raise
