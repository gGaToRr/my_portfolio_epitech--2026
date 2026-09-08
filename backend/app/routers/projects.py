from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Project, EpitechProject, AdminUser
from app.schemas import (
    ProjectOut, ProjectCreate, ProjectUpdate,
    EpitechProjectOut, EpitechProjectCreate, EpitechProjectUpdate
)
from app.auth import get_current_admin

router = APIRouter(tags=["Projects"])

# =========================================================================
# PUBLIC ENDPOINTS
# =========================================================================

@router.get("/api/projects", response_model=List[ProjectOut])
def list_projects(
    lang: str = Query("fr", pattern="^(fr|en)$"),
    featured_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    query = db.query(Project).filter(Project.lang == lang)
    if featured_only:
        query = query.filter(Project.featured == True)
    return query.order_by(Project.display_order.asc(), Project.id.asc()).all()

@router.get("/api/projects/{slug}", response_model=ProjectOut)
def get_project_by_slug(
    slug: str,
    lang: str = Query("fr", pattern="^(fr|en)$"),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.slug == slug, Project.lang == lang).first()
    if not project:
        # Fallback langue si absent
        project = db.query(Project).filter(Project.slug == slug).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable.")
    return project

@router.get("/api/epitech-projects", response_model=List[EpitechProjectOut])
def list_epitech_projects(
    lang: str = Query("fr", pattern="^(fr|en)$"),
    db: Session = Depends(get_db)
):
    return db.query(EpitechProject).filter(EpitechProject.lang == lang).order_by(
        EpitechProject.display_order.asc(), EpitechProject.id.asc()
    ).all()


# =========================================================================
# ADMIN PROTECTED ENDPOINTS (CRUD)
# =========================================================================

@router.post("/api/admin/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin)
):
    # Convert sections to dicts for JSON column
    project_dict = payload.model_dump()
    new_project = Project(**project_dict)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.put("/api/admin/projects/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable.")
    
    update_data = payload.model_dump(exclude_unset=True)
    if "sections" in update_data and update_data["sections"] is not None:
        update_data["sections"] = [s if isinstance(s, dict) else s.model_dump() for s in update_data["sections"]]

    for key, value in update_data.items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return project

@router.delete("/api/admin/projects/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet introuvable.")
    db.delete(project)
    db.commit()
    return {"success": True, "message": f"Projet {project_id} supprimé avec succès."}

# Epitech Projects Admin CRUD
@router.post("/api/admin/epitech-projects", response_model=EpitechProjectOut, status_code=status.HTTP_201_CREATED)
def create_epitech_project(
    payload: EpitechProjectCreate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin)
):
    new_project = EpitechProject(**payload.model_dump())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    return new_project

@router.put("/api/admin/epitech-projects/{project_id}", response_model=EpitechProjectOut)
def update_epitech_project(
    project_id: int,
    payload: EpitechProjectUpdate,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin)
):
    project = db.query(EpitechProject).filter(EpitechProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet Epitech introuvable.")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    return project

@router.delete("/api/admin/epitech-projects/{project_id}", status_code=status.HTTP_200_OK)
def delete_epitech_project(
    project_id: int,
    db: Session = Depends(get_db),
    _: AdminUser = Depends(get_current_admin)
):
    project = db.query(EpitechProject).filter(EpitechProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Projet Epitech introuvable.")
    db.delete(project)
    db.commit()
    return {"success": True, "message": f"Projet Epitech {project_id} supprimé."}
