import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Request, Header
from sqlalchemy import func, distinct, desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import PageView, AnalyticsEvent, AdminUser
from app.schemas import PageViewCollect, EventCollect, AnalyticsStatsSummary
from app.auth import get_current_admin
from app.logger import log_success, log_warning, log_interaction

router = APIRouter(tags=["Analytics"])

def parse_user_agent(ua_string: str) -> dict:
    ua = (ua_string or "").lower()
    
    # Device
    if "mobile" in ua or "android" in ua or "iphone" in ua:
        device = "mobile"
    elif "tablet" in ua or "ipad" in ua:
        device = "tablet"
    elif "bot" in ua or "crawler" in ua or "spider" in ua:
        device = "bot"
    else:
        device = "desktop"
        
    # Browser
    if "firefox" in ua:
        browser = "Firefox"
    elif "chrome" in ua and "edg" not in ua and "opr" not in ua:
        browser = "Chrome"
    elif "safari" in ua and "chrome" not in ua:
        browser = "Safari"
    elif "edg" in ua:
        browser = "Edge"
    elif "opera" in ua or "opr" in ua:
        browser = "Opera"
    else:
        browser = "Autre"
        
    # OS
    if "windows" in ua:
        os_name = "Windows"
    elif "macintosh" in ua or "mac os" in ua:
        os_name = "macOS"
    elif "linux" in ua and "android" not in ua:
        os_name = "Linux"
    elif "android" in ua:
        os_name = "Android"
    elif "iphone" in ua or "ipad" in ua or "ios" in ua:
        os_name = "iOS"
    else:
        os_name = "Autre"
        
    return {"device": device, "browser": browser, "os": os_name}

def get_visitor_hash(client_ip: str, user_agent: str) -> str:
    # Sel quotidien pour anonymisation RGPD (change chaque jour)
    today_str = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    raw = f"{today_str}:{client_ip}:{user_agent}"
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()[:24]

# =========================================================================
# PUBLIC COLLECT ENDPOINTS
# =========================================================================

@router.post("/api/analytics/collect", status_code=204)
def collect_pageview(
    payload: PageViewCollect,
    request: Request,
    user_agent: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    client_ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "unknown")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    ua_info = parse_user_agent(user_agent or "")
    # Exclure les bots des statistiques
    if ua_info["device"] == "bot":
        log_warning("analytics.py", "collect_pageview", f"Bot/Crawler détecté et ignoré : UA='{user_agent}' (IP: {client_ip})")
        return

    v_hash = get_visitor_hash(client_ip, user_agent or "")

    # Nettoyage referrer
    ref = payload.referrer
    if ref:
        ref = ref.strip()
        if len(ref) > 250:
            ref = ref[:250]

    view = PageView(
        path=payload.path[:250] if payload.path else "/",
        visitor_hash=v_hash,
        referrer=ref,
        device_type=ua_info["device"],
        browser=ua_info["browser"],
        os=ua_info["os"],
        language=payload.language[:20] if payload.language else None,
    )
    db.add(view)
    db.commit()
    log_success("analytics.py", "collect_pageview", f"Page vue enregistrée sur '{view.path}' (Appareil: {ua_info['device']}, OS: {ua_info['os']}, Navigateur: {ua_info['browser']})")
    return None

@router.post("/api/analytics/event", status_code=204)
def collect_event(
    payload: EventCollect,
    request: Request,
    user_agent: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    client_ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else "unknown")
    if "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    v_hash = get_visitor_hash(client_ip, user_agent or "")

    extra = payload.extra_data or {}
    source_file = extra.get("source_file", "App.js")
    source_func = extra.get("source_func", payload.event_name)

    event = AnalyticsEvent(
        event_name=payload.event_name[:100],
        target=payload.target[:250] if payload.target else None,
        path=payload.path[:250] if payload.path else None,
        visitor_hash=v_hash,
        extra_data=extra,
    )
    db.add(event)
    db.commit()

    detail = f"Action interactive : '{payload.event_name}'"
    if payload.target:
        detail += f" sur '{payload.target}'"
    if payload.path:
        detail += f" (Page: {payload.path})"

    log_interaction(source_file, source_func, detail)
    return None

# =========================================================================
# ADMIN STATS ENDPOINT
# =========================================================================

@router.get("/api/admin/analytics/stats", response_model=AnalyticsStatsSummary)
def get_analytics_stats(
    days: int = 30,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    now = datetime.now(timezone.utc)
    start_date = now - timedelta(days=days)
    today_start = datetime(now.year, now.month, now.day, tzinfo=timezone.utc)
    log_success("analytics.py", "get_analytics_stats", f"Consultation des statistiques Analytics ({days} jours) par '{admin.username}'")

    # 1. Totaux
    total_views = db.query(func.count(PageView.id)).scalar() or 0
    unique_visitors = db.query(func.count(distinct(PageView.visitor_hash))).scalar() or 0

    # 2. Aujourd'hui
    today_views = db.query(func.count(PageView.id)).filter(PageView.timestamp >= today_start).scalar() or 0
    today_visitors = db.query(func.count(distinct(PageView.visitor_hash))).filter(PageView.timestamp >= today_start).scalar() or 0

    # 3. Top Pages
    top_pages_rows = db.query(
        PageView.path,
        func.count(PageView.id).label("count")
    ).filter(PageView.timestamp >= start_date)\
     .group_by(PageView.path)\
     .order_by(desc("count"))\
     .limit(10).all()
    
    top_pages = [{"path": row[0], "count": row[1]} for row in top_pages_rows]

    # 4. Top Referrers
    top_ref_rows = db.query(
        PageView.referrer,
        func.count(PageView.id).label("count")
    ).filter(PageView.timestamp >= start_date, PageView.referrer.isnot(None), PageView.referrer != "")\
     .group_by(PageView.referrer)\
     .order_by(desc("count"))\
     .limit(8).all()
    
    top_referrers = [{"referrer": row[0], "count": row[1]} for row in top_ref_rows]

    # 5. Device Breakdown
    device_rows = db.query(
        PageView.device_type,
        func.count(PageView.id).label("count")
    ).filter(PageView.timestamp >= start_date)\
     .group_by(PageView.device_type).all()
    
    device_breakdown = [{"device": row[0], "count": row[1]} for row in device_rows]

    # 6. Événements récents (téléchargements CV, clics de projets...)
    event_rows = db.query(
        AnalyticsEvent.event_name,
        AnalyticsEvent.target,
        func.count(AnalyticsEvent.id).label("count")
    ).filter(AnalyticsEvent.timestamp >= start_date)\
     .group_by(AnalyticsEvent.event_name, AnalyticsEvent.target)\
     .order_by(desc("count"))\
     .limit(10).all()
    
    recent_events = [{"event_name": row[0], "target": row[1], "count": row[2]} for row in event_rows]

    # 7. Vues par jour (pour graphique d'évolution)
    # Récupérer les vues des N derniers jours
    daily_stats = []
    for i in range(days - 1, -1, -1):
        day_date = (now - timedelta(days=i)).date()
        d_start = datetime(day_date.year, day_date.month, day_date.day, tzinfo=timezone.utc)
        d_end = d_start + timedelta(days=1)
        
        day_views = db.query(func.count(PageView.id)).filter(
            PageView.timestamp >= d_start, PageView.timestamp < d_end
        ).scalar() or 0
        
        day_uniques = db.query(func.count(distinct(PageView.visitor_hash))).filter(
            PageView.timestamp >= d_start, PageView.timestamp < d_end
        ).scalar() or 0
        
        daily_stats.append({
            "date": day_date.strftime("%d/%m"),
            "views": day_views,
            "visitors": day_uniques
        })

    return {
        "total_pageviews": total_views,
        "unique_visitors": unique_visitors,
        "today_pageviews": today_views,
        "today_unique_visitors": today_visitors,
        "top_pages": top_pages,
        "top_referrers": top_referrers,
        "device_breakdown": device_breakdown,
        "recent_events": recent_events,
        "views_per_day": daily_stats
    }
