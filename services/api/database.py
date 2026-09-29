"""Database connection, session management and engine configuration for REGNOVA.

Seamlessly supports:
- Supabase PostgreSQL (Direct or IPv4 Session/Transaction Pooler)
- Local / CI SQLite fallback (`regnova.db`)

Ensures automatic .env loading, connection recycling, and SSL support.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Automatically load environment variables from multiple standard locations
current_file_dir = Path(__file__).resolve().parent
root_project_dir = current_file_dir.parent.parent

# Load services/api/.env first, then root .env as fallback
load_dotenv(current_file_dir / ".env")
load_dotenv(root_project_dir / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

# Check if user has not yet entered their password
is_placeholder_password = "[YOUR-PASSWORD]" in DATABASE_URL or "[YOUR_PASSWORD]" in DATABASE_URL

if is_placeholder_password or not DATABASE_URL:
    effective_url = "sqlite:///./regnova.db"
    engine_kwargs = {
        "echo": False,
        "future": True,
        "connect_args": {"check_same_thread": False},
    }
else:
    effective_url = DATABASE_URL
    # Normalize PostgreSQL schema URI for SQLAlchemy (use psycopg2 driver explicitly)
    if effective_url.startswith("postgres://"):
        effective_url = effective_url.replace("postgres://", "postgresql+psycopg2://", 1)
    elif effective_url.startswith("postgresql://") and not effective_url.startswith("postgresql+"):
        effective_url = effective_url.replace("postgresql://", "postgresql+psycopg2://", 1)

    engine_kwargs = {
        "echo": False,
        "future": True,
        "pool_pre_ping": True,
        "pool_recycle": 300,
        "pool_size": 10,
        "max_overflow": 20,
    }

engine = create_engine(effective_url, **engine_kwargs)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI dependency for yielding database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_database_status():
    """Diagnostic utility to report active dialect and connection target."""
    dialect_name = engine.dialect.name
    is_postgres = dialect_name == "postgresql"
    is_supabase = is_postgres and ("supabase" in effective_url.lower() or "pooler" in effective_url.lower())
    
    if is_supabase:
        if "pooler" in effective_url:
            target = "Supabase PostgreSQL (Session Pooler - IPv4 Compatible)"
        else:
            target = "Supabase PostgreSQL (Direct Cloud Instance)"
    elif is_postgres:
        target = "Custom PostgreSQL"
    elif is_placeholder_password:
        target = "Local SQLite (regnova.db) — Pending Supabase Password in .env"
    else:
        target = "Local SQLite (regnova.db)"

    return {
        "dialect": dialect_name,
        "is_postgres": is_postgres,
        "is_supabase": is_supabase,
        "is_placeholder_pending": is_placeholder_password,
        "database_target": target,
    }
