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
from app.logger import log_success, log_error

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
    results = query.order_by(Project.display_order.asc(), Project.id.asc()).all()
    log_success("projects.py", "list_projects", f"Liste de {len(results)} projets récupérée (lang={lang}, featured={featured_only})")
    return results

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
        log_error("projects.py", "get_project_by_slug", f"Erreur 404 : Projet avec le slug '{slug}' introuvable")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projet introuvable.")
    log_success("projects.py", "get_project_by_slug", f"Projet '{project.title}' (slug: {slug}) chargé avec succès")
    return project

@router.get("/api/epitech-projects", response_model=List[EpitechProjectOut])
def list_epitech_projects(
    lang: str = Query("fr", pattern="^(fr|en)$"),
    db: Session = Depends(get_db)
):
    results = db.query(EpitechProject).filter(EpitechProject.lang == lang).order_by(
        EpitechProject.display_order.asc(), EpitechProject.id.asc()
    ).all()
    log_success("projects.py", "list_epitech_projects", f"Liste de {len(results)} projets Epitech récupérée (lang={lang})")
    return results


# =========================================================================
# ADMIN PROTECTED ENDPOINTS (CRUD)
# =========================================================================

@router.post("/api/admin/projects", response_model=ProjectOut, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    project_dict = payload.model_dump()
    new_project = Project(**project_dict)
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    log_success("projects.py", "create_project", f"Projet '{new_project.title}' (ID: {new_project.id}, slug: {new_project.slug}) créé par '{admin.username}'")
    return new_project

@router.put("/api/admin/projects/{project_id}", response_model=ProjectOut)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        log_error("projects.py", "update_project", f"Erreur 404 : Projet ID {project_id} non trouvé pour modification")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projet introuvable.")
    
    update_data = payload.model_dump(exclude_unset=True)
    if "sections" in update_data and update_data["sections"] is not None:
        update_data["sections"] = [s if isinstance(s, dict) else s.model_dump() for s in update_data["sections"]]

    for key, value in update_data.items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    log_success("projects.py", "update_project", f"Projet ID {project_id} ('{project.title}') mis à jour par '{admin.username}'")
    return project

@router.delete("/api/admin/projects/{project_id}", status_code=status.HTTP_200_OK)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        log_error("projects.py", "delete_project", f"Erreur 404 : Projet ID {project_id} non trouvé pour suppression")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projet introuvable.")
    title = project.title
    db.delete(project)
    db.commit()
    log_success("projects.py", "delete_project", f"Projet ID {project_id} ('{title}') supprimé par '{admin.username}'")
    return {"success": True, "message": f"Projet {project_id} supprimé avec succès."}

# Epitech Projects Admin CRUD
@router.post("/api/admin/epitech-projects", response_model=EpitechProjectOut, status_code=status.HTTP_201_CREATED)
def create_epitech_project(
    payload: EpitechProjectCreate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    new_project = EpitechProject(**payload.model_dump())
    db.add(new_project)
    db.commit()
    db.refresh(new_project)
    log_success("projects.py", "create_epitech_project", f"Projet Epitech '{new_project.name}' (ID: {new_project.id}) créé par '{admin.username}'")
    return new_project

@router.put("/api/admin/epitech-projects/{project_id}", response_model=EpitechProjectOut)
def update_epitech_project(
    project_id: int,
    payload: EpitechProjectUpdate,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    project = db.query(EpitechProject).filter(EpitechProject.id == project_id).first()
    if not project:
        log_error("projects.py", "update_epitech_project", f"Erreur 404 : Projet Epitech ID {project_id} non trouvé")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projet Epitech introuvable.")
    
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(project, key, value)
    
    db.commit()
    db.refresh(project)
    log_success("projects.py", "update_epitech_project", f"Projet Epitech ID {project_id} ('{project.name}') mis à jour par '{admin.username}'")
    return project

@router.delete("/api/admin/epitech-projects/{project_id}", status_code=status.HTTP_200_OK)
def delete_epitech_project(
    project_id: int,
    db: Session = Depends(get_db),
    admin: AdminUser = Depends(get_current_admin)
):
    project = db.query(EpitechProject).filter(EpitechProject.id == project_id).first()
    if not project:
        log_error("projects.py", "delete_epitech_project", f"Erreur 404 : Projet Epitech ID {project_id} non trouvé")
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Projet Epitech introuvable.")
    name = project.name
    db.delete(project)
    db.commit()
    log_success("projects.py", "delete_epitech_project", f"Projet Epitech ID {project_id} ('{name}') supprimé par '{admin.username}'")
    return {"success": True, "message": f"Projet Epitech {project_id} supprimé."}
