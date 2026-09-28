from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models, schemas

# Cria um roteador modular com o prefixo '/recursos' e agrupado na tag de documentação
router = APIRouter(prefix="/recursos", tags=["Recursos de Acessibilidade"])

# Rota GET modularizada para listar todos os recursos
@router.get("/", response_model=list[schemas.RecursoResponse])
def listar_recursos(db: Session = Depends(get_db)):
    return db.query(models.RecursoAcessibilidade).all()

# Rota POST modularizada usando o desempacotamento de dicionário (**recurso.model_dump())
@router.post("/", response_model=schemas.RecursoResponse)
def criar_recurso(recurso: schemas.RecursoCreate, db: Session = Depends(get_db)):
    # **recurso.model_dump() converte o esquema Pydantic direto em argumentos para o SQLAlchemy
    novo_recurso = models.RecursoAcessibilidade(**recurso.model_dump())
    db.add(novo_recurso)
    db.commit()
    db.refresh(novo_recurso)
    return novo_recurso