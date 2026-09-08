import pytest
from app.seed import seed_db
from app.models import Project, EpitechProject, AdminUser
from app.database import SessionLocal

def test_seed_database_execution(db_session):
    # Test that seed_db executes idempotently without raising errors
    seed_db()
    db = SessionLocal()
    try:
        assert db.query(AdminUser).count() >= 1
        assert db.query(Project).count() >= 1
        assert db.query(EpitechProject).count() >= 1
    finally:
        db.close()
