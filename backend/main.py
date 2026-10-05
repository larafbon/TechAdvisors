from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

# Cria as tabelas caso ainda não existam no banco
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inclusao Escolar API",
    description="API com FastAPI, SQLAlchemy e Supabase PostgreSQL para Gestão Escolar Inclusiva",
    version="1.0.0"
)

@app.get("/", tags=["Health Check"])
def read_root():
    return {"status": "ok", "message": "API rodando com sucesso!"}

@app.post(
    "/tipos-deficiencia/", 
    response_model=schemas.TipoDeficienciaResponse, 
    status_code=status.HTTP_201_CREATED, 
    tags=["Tipos de Deficiência"]
)
def create_tipo_deficiencia(
    tipo: schemas.TipoDeficienciaCreate, 
    db: Session = Depends(get_db)
):
    # Verifica se já existe um registro com o mesmo código
    db_existente = db.query(models.TipoDeficiencia).filter(models.TipoDeficiencia.codigo == tipo.codigo).first()
    if db_existente:
        raise HTTPException(status_code=400, detail="Código de tipo de deficiência já cadastrado.")

    db_tipo = models.TipoDeficiencia(**tipo.model_dump())
    db.add(db_tipo)
    db.commit()
    db.refresh(db_tipo)
    return db_tipo

@app.get(
    "/tipos-deficiencia/", 
    response_model=List[schemas.TipoDeficienciaResponse], 
    tags=["Tipos de Deficiência"]
)
def read_tipos_deficiencia(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    tipos = db.query(models.TipoDeficiencia).offset(skip).limit(limit).all()
    return tipos

@app.get(
    "/tipos-deficiencia/{tipo_id}", 
    response_model=schemas.TipoDeficienciaResponse, 
    tags=["Tipos de Deficiência"]
)
def read_tipo_deficiencia(tipo_id: int, db: Session = Depends(get_db)):
    tipo = db.query(models.TipoDeficiencia).filter(models.TipoDeficiencia.id_tipo_deficiencia == tipo_id).first()
    if tipo is None:
        raise HTTPException(status_code=404, detail="Tipo de deficiência não encontrado.")
    return tipo