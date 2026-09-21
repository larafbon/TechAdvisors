from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

router = APIRouter(prefix="/recursos", tags=["Recursos de Acessibilidade"])

@router.get("/", response_model=list[schemas.RecursoResponse])
def listar_recursos(db: Session = Depends(get_db)):
    return db.query(models.RecursoAcessibilidade).all()

@router.post("/", response_model=schemas.RecursoResponse)
def criar_recurso(recurso: schemas.RecursoCreate, db: Session = Depends(get_db)):
    novo_recurso = models.RecursoAcessibilidade(**recurso.model_dump())
    db.add(novo_recurso)
    db.commit()
    db.refresh(novo_recurso)
    return novo_recurso