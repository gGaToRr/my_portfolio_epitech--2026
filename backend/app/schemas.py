from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field

# ----------------- Auth Schemas -----------------
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str

class LoginRequest(BaseModel):
    username: str = "admin"
    password: str

# ----------------- Project Section Schema -----------------
class ProjectSectionSchema(BaseModel):
    heading: str
    body: str

# ----------------- Project (Personal) Schemas -----------------
class ProjectBase(BaseModel):
    slug: str
    lang: str = "fr"
    title: str
    tagline: str
    stack: List[str] = Field(default_factory=list)
    category: Optional[str] = "personal"
    repo_url: Optional[str] = None
    demo_url: Optional[str] = None
    image_url: Optional[str] = None
    sections: List[ProjectSectionSchema] = Field(default_factory=list)
    featured: bool = True
    display_order: int = 0

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    tagline: Optional[str] = None
    stack: Optional[List[str]] = None
    category: Optional[str] = None
    repo_url: Optional[str] = None
    demo_url: Optional[str] = None
    image_url: Optional[str] = None
    sections: Optional[List[ProjectSectionSchema]] = None
    featured: Optional[bool] = None
    display_order: Optional[int] = None

class ProjectOut(ProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# ----------------- Epitech Project Schemas -----------------
class EpitechProjectBase(BaseModel):
    lang: str = "fr"
    name: str
    category: str
    description: str
    tags: List[str] = Field(default_factory=list)
    repo_url: Optional[str] = None
    display_order: int = 0

class EpitechProjectCreate(EpitechProjectBase):
    pass

class EpitechProjectUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    repo_url: Optional[str] = None
    display_order: Optional[int] = None

class EpitechProjectOut(EpitechProjectBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

# ----------------- Analytics Schemas -----------------
class PageViewCollect(BaseModel):
    path: str
    referrer: Optional[str] = None
    language: Optional[str] = None

class EventCollect(BaseModel):
    event_name: str
    target: Optional[str] = None
    path: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None

class AnalyticsStatsSummary(BaseModel):
    total_pageviews: int
    unique_visitors: int
    today_pageviews: int
    today_unique_visitors: int
    total_cv_downloads: int = 0
    top_pages: List[Dict[str, Any]]
    top_referrers: List[Dict[str, Any]]
    device_breakdown: List[Dict[str, Any]]
    recent_events: List[Dict[str, Any]]
    views_per_day: List[Dict[str, Any]]
    recent_cv_downloads: List[Dict[str, Any]] = Field(default_factory=list)

# ----------------- Contact Schema -----------------
class ContactRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    botcheck: Optional[Any] = None

class ContactMessageOut(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    message: str
    client_ip: Optional[str] = None
    is_read: bool
    created_at: datetime

    model_config = {"from_attributes": True}

