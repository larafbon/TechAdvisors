from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from database import engine, Base, get_db
import models
import schemas

# Cria as tabelas no Supabase caso ainda não existam
Base.metadata.create_all(bind=engine)

app = FastAPI(title="API TechAdvisors")


# --- Rotas para ConfiguracaoAcessibilidade (Projeto Oficial) ---

@app.get("/configuracoes_acessibilidade", response_model=list[schemas.ConfiguracaoAcessibilidadeResponse])
def listar_configuracoes(db: Session = Depends(get_db)):
    return db.query(models.ConfiguracaoAcessibilidade).all()


# --- Rotas de Aprendizagem (Categoria) ---

@app.get("/categoria", response_model=list[schemas.CategoriaResponse])
def listar_categorias(db: Session = Depends(get_db)):
    return db.query(models.Categoria).all()