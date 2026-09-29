"""Database migration & schema initialization script for Supabase / PostgreSQL / SQLite.

Verifies database connectivity, creates all REGNOVA tables if not present, and seeds default records.
Usage:
  python scripts/migrate_to_supabase.py
"""
import sys
import os

# Monorepo path resolution
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from sqlalchemy import inspect
from services.api.database import engine, Base, SessionLocal, get_database_status
from services.api.models import (
    User,
    District,
    Dataset,
    ForecastRun,
    DistrictForecast,
    ModelArtifact,
    EvaluationRun,
    AgentRun,
    AuditLog,
)
from services.api.auth import hash_password
from services.ml.data_generator import SAMPLE_DISTRICTS


def run_migration():
    print("=" * 65)
    print("REGNOVA — Database & Supabase Migration Runner")
    print("=" * 65)

    status = get_database_status()
    print(f"Target Database Engine : {status['database_target']}")
    print(f"SQL Dialect            : {status['dialect']}")
    print(f"Supabase Mode          : {'YES (Cloud PostgreSQL)' if status['is_supabase'] else 'NO (Local/Generic)'}")
    print("-" * 65)

    # 1. Create all tables defined in models
    print("Creating / verifying all database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("[OK] Base.metadata.create_all completed successfully.")
    except Exception as e:
        print(f"[FAIL] Error creating tables: {e}")
        return False

    # 2. Inspect created tables
    inspector = inspect(engine)
    table_names = inspector.get_table_names()
    print(f"[OK] Found {len(table_names)} tables in database: {', '.join(table_names)}")

    # 3. Seed initial users & districts if needed
    db = SessionLocal()
    try:
        user_count = db.query(User).count()
        if user_count == 0:
            print("Seeding initial default users...")
            demo_user = User(
                username="demo_viewer",
                email="demo@regnova.vystral.org",
                hashed_password=hash_password("regnova2026"),
                role="DEMO_VIEWER",
                full_name="SIH Evaluation Reviewer",
            )
            admin_user = User(
                username="admin",
                email="admin@regnova.vystral.org",
                hashed_password=hash_password("admin2026"),
                role="ADMIN",
                full_name="Lead Meteorologist Admin",
            )
            db.add_all([demo_user, admin_user])
            db.commit()
            print("[OK] Created default demo and admin users.")
        else:
            print(f"[OK] Users table already populated ({user_count} records).")

        district_count = db.query(District).count()
        if district_count == 0:
            print("Seeding representative meteorological districts...")
            district_objs = []
            for d in SAMPLE_DISTRICTS:
                district_objs.append(
                    District(
                        id=d["district_id"],
                        district_name=d["district_name"],
                        state_name=d["state_name"],
                        centroid_lat=d["lat"],
                        centroid_lon=d["lon"],
                        terrain_elevation_m=d["elevation"],
                        coastal_proximity_km=d["coastal_dist"],
                        climatological_mean_jjas_mm=d["climatology"],
                    )
                )
            db.add_all(district_objs)
            db.commit()
            print(f"[OK] Seeded {len(district_objs)} meteorological districts.")
        else:
            print(f"[OK] Districts table already populated ({district_count} records).")

    except Exception as e:
        db.rollback()
        print(f"[FAIL] Error during data seeding: {e}")
        return False
    finally:
        db.close()

    print("=" * 65)
    print("MIGRATION & SCHEMA INITIALIZATION COMPLETED [SUCCESS]")
    print("=" * 65)
    return True


if __name__ == "__main__":
    success = run_migration()
    if not success:
        sys.exit(1)
