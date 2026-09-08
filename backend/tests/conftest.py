import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

# Force test configuration
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["ADMIN_USERNAME"] = "testadmin"
os.environ["ADMIN_PASSWORD"] = "testpassword123"
os.environ["SECRET_KEY"] = "test-secret-key-for-unit-tests-123456789"

from app.database import Base, get_db
from app.main import app
from app.models import AdminUser
from app.auth import hash_password, create_access_token

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db_session():
    """Isolated in-memory SQLite database per test."""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    
    admin = AdminUser(
        username="testadmin",
        hashed_password=hash_password("testpassword123")
    )
    db.add(admin)
    db.commit()
    
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient injecting test database session."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_token():
    """Generate a valid admin JWT token."""
    return create_access_token(data={"sub": "testadmin"})

@pytest.fixture
def auth_headers(admin_token):
    """Authorization Bearer header."""
    return {"Authorization": f"Bearer {admin_token}"}
