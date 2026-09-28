from fastapi import FastAPI, Depends, status, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import models
import schemas
from database import engine, get_db

app = FastAPI(title="API TechAdvisors")

models.Base.metadata.create_all(bind=engine)

# --- PROFESSORES ---
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

# --- TURMAS ---
@app.get("/turmas", response_model=list[schemas.TurmaResponse])
def listar_turmas(db: Session = Depends(get_db)):
    return db.query(models.Turma).all()

@app.get("/turmas/{id_turma}", response_model=schemas.TurmaResponse)
def buscar_turma_por_id(id_turma: int, db: Session = Depends(get_db)):
    turma = db.query(models.Turma).filter(models.Turma.id_turma == id_turma).first()
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")
    return turma

@app.post("/turmas", response_model=schemas.TurmaResponse, status_code=status.HTTP_201_CREATED)
def criar_turma(dados: schemas.TurmaCreate, db: Session = Depends(get_db)):
    prof = db.query(models.Professor).filter(models.Professor.id_professor == dados.id_professor).first()
    if not prof:
        raise HTTPException(
            status_code=404, 
            detail=f"Não foi possível criar a turma: Professor com ID {dados.id_professor} não existe."
        )

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

@app.put("/turmas/{id_turma}", response_model=schemas.TurmaResponse)
def atualizar_turma(id_turma: int, dados: schemas.TurmaCreate, db: Session = Depends(get_db)):
    turma_db = db.query(models.Turma).filter(models.Turma.id_turma == id_turma).first()
    if not turma_db:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")
    
    prof = db.query(models.Professor).filter(models.Professor.id_professor == dados.id_professor).first()
    if not prof:
        raise HTTPException(status_code=404, detail=f"Professor com ID {dados.id_professor} não existe.")

    for chave, valor in dados.model_dump().items():
        setattr(turma_db, chave, valor)

    db.commit()
    db.refresh(turma_db)
    return turma_db

@app.delete("/turmas/{id_turma}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_turma(id_turma: int, db: Session = Depends(get_db)):
    turma_db = db.query(models.Turma).filter(models.Turma.id_turma == id_turma).first()
    if not turma_db:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")
    
    db.delete(turma_db)
    db.commit()
    return None