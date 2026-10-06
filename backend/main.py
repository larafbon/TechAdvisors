from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models
import schemas
from database import engine, get_db

# Cria todas as tabelas mapeadas
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Inclusao Escolar API",
    description="API Completa com FastAPI, SQLAlchemy e Supabase PostgreSQL para Gestão Escolar Inclusiva",
    version="1.0.0"
)

@app.get("/", tags=["Health Check"])
def read_root():
    return {"status": "ok", "message": "API Completa rodando com sucesso!"}

# --- ENDPOINTS: TIPO DEFICIÊNCIA ---
@app.post("/tipos-deficiencia/", response_model=schemas.TipoDeficienciaResponse, status_code=status.HTTP_201_CREATED, tags=["Tipos de Deficiência"])
def create_tipo_deficiencia(tipo: schemas.TipoDeficienciaCreate, db: Session = Depends(get_db)):
    if db.query(models.TipoDeficiencia).filter(models.TipoDeficiencia.codigo == tipo.codigo).first():
        raise HTTPException(status_code=400, detail="Código de tipo de deficiência já cadastrado.")
    db_tipo = models.TipoDeficiencia(**tipo.model_dump())
    db.add(db_tipo)
    db.commit()
    db.refresh(db_tipo)
    return db_tipo

@app.get("/tipos-deficiencia/", response_model=List[schemas.TipoDeficienciaResponse], tags=["Tipos de Deficiência"])
def read_tipos_deficiencia(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.TipoDeficiencia).offset(skip).limit(limit).all()

# --- ENDPOINTS: PROFESSOR ---
@app.post("/professores/", response_model=schemas.ProfessorResponse, status_code=status.HTTP_201_CREATED, tags=["Professores"])
def create_professor(prof: schemas.ProfessorCreate, db: Session = Depends(get_db)):
    if db.query(models.Professor).filter(models.Professor.email == prof.email).first():
        raise HTTPException(status_code=400, detail="E-mail de professor já cadastrado.")
    
    db_prof = models.Professor(**prof.model_dump())
    db.add(db_prof)
    db.commit()
    db.refresh(db_prof)
    return db_prof

# --- ENDPOINTS: RESPONSAVEL ---
@app.post("/responsaveis/", response_model=schemas.ResponsavelResponse, status_code=status.HTTP_201_CREATED, tags=["Responsáveis"])
def create_responsavel(resp: schemas.ResponsavelCreate, db: Session = Depends(get_db)):
    db_resp = models.Responsavel(**resp.model_dump())
    db.add(db_resp)
    db.commit()
    db.refresh(db_resp)
    return db_resp

@app.get("/responsaveis/", response_model=List[schemas.ResponsavelResponse], tags=["Responsáveis"])
def read_responsaveis(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Responsavel).offset(skip).limit(limit).all()

# --- ENDPOINTS: ALUNO ---
@app.post("/alunos/", response_model=schemas.AlunoResponse, status_code=status.HTTP_201_CREATED, tags=["Alunos"])
def create_aluno(aluno: schemas.AlunoCreate, db: Session = Depends(get_db)):
    if db.query(models.Aluno).filter(models.Aluno.matricula == aluno.matricula).first():
        raise HTTPException(status_code=400, detail="Matrícula de aluno já cadastrada.")
    db_aluno = models.Aluno(**aluno.model_dump())
    db.add(db_aluno)
    db.commit()
    db.refresh(db_aluno)
    return db_aluno

@app.get("/alunos/", response_model=List[schemas.AlunoResponse], tags=["Alunos"])
def read_alunos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Aluno).offset(skip).limit(limit).all()