import pytest
from app.models import AdminUser, Project, EpitechProject, PageView, AnalyticsEvent
from app.database import get_db

def test_get_db_session(db_session):
    assert db_session is not None
    admin = db_session.query(AdminUser).first()
    assert admin is not None
    assert admin.username == "testadmin"

def test_create_and_query_project_model(db_session):
    p = Project(
        slug="test-slug-db",
        lang="fr",
        title="DB Test Project",
        tagline="Testing DB Model",
        stack=["Python", "SQLite"],
        sections=[{"heading": "Test", "body": "Section Body"}]
    )
    db_session.add(p)
    db_session.commit()
    db_session.refresh(p)
    
    assert p.id is not None
    assert p.slug == "test-slug-db"

def test_create_and_query_analytics_event_model(db_session):
    ev = AnalyticsEvent(
        event_name="click_test",
        target="button_1",
        path="/",
        visitor_hash="abc123hash",
        extra_data={"key": "value"}
    )
    db_session.add(ev)
    db_session.commit()
    db_session.refresh(ev)
    
    assert ev.id is not None
    assert ev.extra_data["key"] == "value"
