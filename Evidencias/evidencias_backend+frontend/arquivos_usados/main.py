from fastapi import FastAPI, Depends, status, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

# Importação dos módulos locais
import models
import schemas
from database import engine, get_db

# Criação das tabelas no banco de dados (se não existirem)
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API TechAdvisors")

# Configuração de CORS para permitir requisições do navegador
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "API TechAdvisors funcionando!"}

# --- ROTAS DE PROFESSORES ---

@app.get("/professores", response_model=list[schemas.ProfessorResponse])
def listar_professores(db: Session = Depends(get_db)):
    return db.query(models.Professor).all()

@app.post("/professores", response_model=schemas.ProfessorResponse, status_code=status.HTTP_211_CREATED if hasattr(status, 'HTTP_211_CREATED') else status.HTTP_201_CREATED)
def criar_professor(professor: schemas.ProfessorCreate, db: Session = Depends(get_db)):
    db_prof = db.query(models.Professor).filter(models.Professor.email == professor.email).first()
    if db_prof:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    
    novo_prof = models.Professor(**professor.model_dump())
    db.add(novo_prof)
    db.commit()
    db.refresh(novo_prof)
    return novo_prof

# --- ROTAS DE TURMAS ---

@app.get("/turmas", response_model=list[schemas.TurmaResponse])
def listar_turmas(db: Session = Depends(get_db)):
    return db.query(models.Turma).all()

@app.get("/turmas/{id_turma}", response_model=schemas.TurmaResponse)
def obter_turma(id_turma: int, db: Session = Depends(get_db)):
    turma = db.query(models.Turma).filter(models.Turma.id_turma == id_turma).first()
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")
    return turma

@app.post("/turmas", response_model=schemas.TurmaResponse, status_code=status.HTTP_201_CREATED)
def criar_turma(turma: schemas.TurmaCreate, db: Session = Depends(get_db)):
    prof = db.query(models.Professor).filter(models.Professor.id_professor == turma.id_professor).first()
    if not prof:
        raise HTTPException(status_code=404, detail="Professor informado não existe.")
    
    nova_turma = models.Turma(**turma.model_dump())
    db.add(nova_turma)
    db.commit()
    db.refresh(nova_turma)
    return nova_turma

@app.put("/turmas/{id_turma}", response_model=schemas.TurmaResponse)
def atualizar_turma(id_turma: int, turma_data: schemas.TurmaCreate, db: Session = Depends(get_db)):
    turma = db.query(models.Turma).filter(models.Turma.id_turma == id_turma).first()
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")
    
    for key, value in turma_data.model_dump().items():
        setattr(turma, key, value)
    
    db.commit()
    db.refresh(turma)
    return turma

@app.delete("/turmas/{id_turma}", status_code=status.HTTP_204_NO_CONTENT)
def deletar_turma(id_turma: int, db: Session = Depends(get_db)):
    turma = db.query(models.Turma).filter(models.Turma.id_turma == id_turma).first()
    if not turma:
        raise HTTPException(status_code=404, detail="Turma não encontrada.")
    
    db.delete(turma)
    db.commit()
    return None