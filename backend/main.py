from fastapi import FastAPI, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import models
import schemas
from database import engine, get_db

app = FastAPI(title="API TechAdvisors")

# Cria as tabelas caso ainda não existam no banco
models.Base.metadata.create_all(bind=engine)


# ==========================================
# ROTAS PARA RECURSOS DE ACESSIBILIDADE
# ==========================================

@app.get("/recursos_acessibilidade", response_model=list[schemas.RecursoAcessibilidadeResponse])
def listar_recursos(db: Session = Depends(get_db)):
    return db.query(models.RecursoAcessibilidade).all()

@app.post("/recursos_acessibilidade", response_model=schemas.RecursoAcessibilidadeResponse, status_code=status.HTTP_201_CREATED)
def criar_recurso(dados: schemas.RecursoAcessibilidadeCreate, db: Session = Depends(get_db)):
    recurso = models.RecursoAcessibilidade(**dados.model_dump())
    db.add(recurso)
    db.commit()
    db.refresh(recurso)
    return recurso


# ==========================================
# ROTAS PARA PROFESSORES (Tabela Base - PK)
# ==========================================

@app.get("/professores", response_model=list[schemas.ProfessorResponse])
def listar_professores(db: Session = Depends(get_db)):
    return db.query(models.Professor).all()

@app.post("/professores", response_model=schemas.ProfessorResponse, status_code=status.HTTP_201_CREATED)
def criar_professor(dados: schemas.ProfessorCreate, db: Session = Depends(get_db)):
    if db.query(models.Professor).filter(models.Professor.email == dados.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    
    professor = models.Professor(**dados.model_dump())
    db.add(professor)
    db.commit()
    db.refresh(professor)
    return professor


# ==========================================
# ROTAS PARA TURMAS (Tabela Dependente - FK)
# ==========================================

@app.get("/turmas", response_model=list[schemas.TurmaResponse])
def listar_turmas(db: Session = Depends(get_db)):
    return db.query(models.Turma).all()

@app.post("/turmas", response_model=schemas.TurmaResponse, status_code=status.HTTP_201_CREATED)
def criar_turma(dados: schemas.TurmaCreate, db: Session = Depends(get_db)):
    # 1. Validação da Chave Estrangeira (FK): verifica se o professor existe
    prof = db.query(models.Professor).filter(models.Professor.id_professor == dados.id_professor).first()
    if not prof:
        raise HTTPException(
            status_code=404, 
            detail=f"Não foi possível criar a turma: Professor com ID {dados.id_professor} não existe."
        )

    # 2. Tenta inserir a turma e trata erros de banco de dados
    try:
        nova_turma = models.Turma(**dados.model_dump())
        db.add(nova_turma)
        db.commit()
        db.refresh(nova_turma)
        return nova_turma
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail=f"Erro de Banco de Dados: {str(e.orig)}"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Erro interno: {str(e)}"
        )