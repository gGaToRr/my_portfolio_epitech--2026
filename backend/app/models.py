from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON, Float
from app.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=utc_now)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), index=True, nullable=False)
    lang = Column(String(10), index=True, default="fr", nullable=False)  # 'fr' ou 'en'
    title = Column(String(150), nullable=False)
    tagline = Column(Text, nullable=False)
    stack = Column(JSON, default=list)  # ex: ["React 19", "Python / Flask"]
    category = Column(String(50), default="personal")
    repo_url = Column(String(255), nullable=True)
    demo_url = Column(String(255), nullable=True)
    image_url = Column(String(255), nullable=True)
    sections = Column(JSON, default=list)  # ex: [{"heading": "Contexte", "body": "..."}]
    featured = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class EpitechProject(Base):
    __tablename__ = "epitech_projects"

    id = Column(Integer, primary_key=True, index=True)
    lang = Column(String(10), index=True, default="fr", nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    tags = Column(JSON, default=list)
    repo_url = Column(String(255), nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

class PageView(Base):
    __tablename__ = "page_views"

    id = Column(Integer, primary_key=True, index=True)
    path = Column(String(255), index=True, nullable=False)
    visitor_hash = Column(String(64), index=True, nullable=False)
    referrer = Column(String(255), nullable=True)
    device_type = Column(String(20), default="desktop")  # desktop, mobile, tablet
    browser = Column(String(50), nullable=True)
    os = Column(String(50), nullable=True)
    language = Column(String(20), nullable=True)
    timestamp = Column(DateTime, default=utc_now, index=True)

class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id = Column(Integer, primary_key=True, index=True)
    event_name = Column(String(100), index=True, nullable=False)  # 'click_project', 'download_cv', etc.
    target = Column(String(255), nullable=True)  # slug ou label
    path = Column(String(255), nullable=True)
    visitor_hash = Column(String(64), index=True, nullable=False)
    extra_data = Column(JSON, default=dict)
    timestamp = Column(DateTime, default=utc_now, index=True)

class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    phone = Column(String(50), nullable=True)
    message = Column(Text, nullable=False)
    client_ip = Column(String(50), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)

class DailyUptimeLog(Base):
    __tablename__ = "daily_uptime_logs"

    id = Column(Integer, primary_key=True, index=True)
    date_str = Column(String(10), index=True, nullable=False)  # "YYYY-MM-DD"
    service = Column(String(50), index=True, nullable=False)   # "general", "api", "database"
    total_checks = Column(Integer, default=0)
    successful_checks = Column(Integer, default=0)
    failed_checks = Column(Integer, default=0)
    uptime_percentage = Column(Float, default=100.0)
    status = Column(String(20), default="operational")          # "operational", "degraded", "outage"
    details = Column(String(255), default="0 incident")
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

