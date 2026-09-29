"""Diagnostic script to test Supabase PostgreSQL / SQLite database connectivity.

Executes a live query, reports connection status, and inspects database tables.
Usage:
  python scripts/test_db_connection.py
"""
import sys
import os

# Monorepo path resolution
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from sqlalchemy import text, inspect
from services.api.database import engine, get_database_status


def test_connection():
    print("=" * 65)
    print("REGNOVA — Live Database Connection Diagnostic")
    print("=" * 65)

    status = get_database_status()
    print(f"Target Database Engine : {status['database_target']}")
    print(f"SQL Dialect            : {status['dialect']}")
    print(f"Is PostgreSQL          : {status['is_postgres']}")
    print(f"Is Supabase            : {status['is_supabase']}")
    print("-" * 65)

    print("Attempting connection to database engine...")
    if "[YOUR-PASSWORD]" in os.getenv("DATABASE_URL", ""):
        print("[NOTICE] DATABASE_URL still contains placeholder '[YOUR-PASSWORD]'.")
        print("Please replace '[YOUR-PASSWORD]' in '.env' with your actual Supabase database password.")
        print("=" * 65)
        return False
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1")).scalar()
            print(f"[SUCCESS] Database handshake passed! Test query result: {result}")

            # Inspect available tables
            inspector = inspect(engine)
            tables = inspector.get_table_names()
            print(f"[OK] Discovered {len(tables)} tables: {', '.join(tables)}")

        print("=" * 65)
        print("DATABASE CONNECTIVITY STATUS: ACTIVE & VERIFIED [OK]")
        print("=" * 65)
        return True
    except Exception as e:
        print("=" * 65)
        print(f"[CONNECTION FAILED] Could not establish connection:")
        print(f"Error: {e}")
        print("=" * 65)
        print("Troubleshooting Tips:")
        print("1. If using direct connection, your local ISP/network may not support IPv6.")
        print("   Switch to the Supabase Session Pooler URL on port 5432 or 6543 (IPv4 compatible).")
        print("2. Ensure your database password in services/api/.env or .env is correct.")
        print("3. Special characters in password (like @, #, $, %) must be URL-encoded (e.g. @ -> %40).")
        print("=" * 65)
        return False


if __name__ == "__main__":
    success = test_connection()
    if not success:
        sys.exit(1)
