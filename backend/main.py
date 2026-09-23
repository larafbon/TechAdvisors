from fastapi import FastAPI, Depends, status
from sqlalchemy.orm import Session
import models
import schemas
from database import engine, get_db

app = FastAPI(title="API TechAdvisors")

# Cria as tabelas caso nao existam
models.Base.metadata.create_all(bind=engine)

@app.get("/recursos_acessibilidade", response_model=list[schemas.RecursoAcessibilidadeResponse])
def listar_recursos(db: Session = Depends(get_db)):
    return db.query(models.RecursoAcessibilidade).all()

@app.post(
    "/recursos_acessibilidade",
    response_model=schemas.RecursoAcessibilidadeResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_recurso(dados: schemas.RecursoAcessibilidadeCreate, db: Session = Depends(get_db)):
    recurso = models.RecursoAcessibilidade(
        nome=dados.nome,
        descricao=dados.descricao,
        tipo=dados.tipo,
        formato=dados.formato
    )
    db.add(recurso)
    db.commit()
    db.refresh(recurso)
    return recurso