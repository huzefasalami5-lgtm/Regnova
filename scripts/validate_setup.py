"""Automated setup validation script for REGNOVA Monorepo."""
import sys
import os

# Add root of regnova to sys.path
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

def validate():
    print("=" * 60)
    print("REGNOVA — Automated Setup & Environment Validation")
    print("Team: VYSTRAL | SIH 2026 Problem: SIH26080")
    print("=" * 60)

    # Check Python version
    py_ver = sys.version.split()[0]
    print(f"[OK] Python Runtime: {py_ver}")

    # Check Core Packages
    try:
        import numpy
        import pandas
        import fastapi
        import pydantic
        import sqlalchemy
        import shapely
        print("[OK] Core Backend & Scientific Packages imported successfully")
    except Exception as e:
        print(f"[FAIL] Package import error: {e}")
        return False

    # Check DB Initialization
    try:
        from services.api.database import SessionLocal, engine
        from services.api.models import User, District
        db = SessionLocal()
        users_count = db.query(User).count()
        districts_count = db.query(District).count()
        db.close()
        print(f"[OK] Database connected (SQLite/PostgreSQL). Users: {users_count}, Districts: {districts_count}")
    except Exception as e:
        print(f"[FAIL] Database connection error: {e}")
        return False

    # Check ML Modules
    try:
        from services.ml.r_gate import RGateClassifier
        from services.ml.expert_mix import ExpertMixPipeline
        from services.ml.rain_cal import RainCalibrator
        from services.ml.evaluation_engine import EvaluationEngine
        from services.agents.orchestrator import AgentOrchestrator
        r = RGateClassifier()
        em = ExpertMixPipeline()
        rc = RainCalibrator()
        ee = EvaluationEngine()
        ao = AgentOrchestrator()
        print("[OK] R-GATE, EXPERT-MIX, RAIN-CAL & Agent Modules initialized")
    except Exception as e:
        print(f"[FAIL] ML modules error: {e}")
        return False

    print("=" * 60)
    print("ALL ENVIRONMENT & BACKEND CHECKS PASSED [READY]")
    print("=" * 60)
    return True

if __name__ == "__main__":
    if not validate():
        sys.exit(1)
