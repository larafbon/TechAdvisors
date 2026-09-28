from fastapi import FastAPI, Depends, status
from sqlalchemy.orm import Session
import models
import schemas
from database import engine, get_db

# Inicializa a aplicação FastAPI com o título do projeto
app = FastAPI(title="API TechAdvisors")

# Cria automaticamente as tabelas no banco de dados caso elas ainda não existam
models.Base.metadata.create_all(bind=engine)

# ROTA 1: GET /recursos_acessibilidade (Consulta de Dados)
# Retorna uma lista de recursos formatados segundo o 'RecursoAcessibilidadeResponse'
@app.get("/recursos_acessibilidade", response_model=list[schemas.RecursoAcessibilidadeResponse])
def listar_recursos(db: Session = Depends(get_db)):
    # Executa a consulta 'SELECT * FROM recurso_acessibilidade' e retorna todos os registros
    return db.query(models.RecursoAcessibilidade).all()

# ROTA 2: POST /recursos_acessibilidade (Criação de Dados)
# Recebe um JSON validado pelo 'RecursoAcessibilidadeCreate' e retorna o Status Code 201 (Created)
@app.post(
    "/recursos_acessibilidade",
    response_model=schemas.RecursoAcessibilidadeResponse,
    status_code=status.HTTP_201_CREATED
)
def criar_recurso(dados: schemas.RecursoAcessibilidadeCreate, db: Session = Depends(get_db)):
    # 1. Instancia um novo objeto da tabela com os dados recebidos da requisição
    recurso = models.RecursoAcessibilidade(
        nome=dados.nome,
        descricao=dados.descricao,
        tipo=dados.tipo,
        formato=dados.formato
    )
    # 2. Adiciona o objeto à transação do banco de dados (INSERT)
    db.add(recurso)
    # 3. Confirma e salva permanentemente a transação no Supabase
    db.commit()
    # 4. Atualiza o objeto para obter o id_recurso recém-gerado pelo banco
    db.refresh(recurso)
    # 5. Devolve o recurso cadastrado com ID e status 201 Created
    return recurso