import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# URL de Conexão com o PostgreSQL do Supabase (Transaction Pooler em IPv4)
# Contém o usuário, senha, endereço do servidor, porta (6543) e nome do banco
DATABASE_URL = "postgresql://postgres.zarnjgllibjujgkrxnfv:password@aws-0-ca-central-1.pooler.supabase.com:6543/postgres"

# Cria o 'Engine' (Mapeador e Gerenciador de conexões com o Banco de Dados)
# pool_pre_ping=True: testa se a conexão está viva antes de fazer uma consulta
# pool_recycle=300: renova conexões a cada 5 minutos para não travar
# connect_args={"connect_timeout": 10}: espera até 10 segundos para conectar antes de dar erro
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={"connect_timeout": 10}
)

# Cria a fábrica de Sessões (SessionLocal), usada para abrir e fechar transações no banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe Base que todas as nossas tabelas no 'models.py' vão herdar
Base = declarative_base()

# Função Injeção de Dependência (get_db)
# Abre uma conexão temporária com o banco para cada requisição da API e garante o fechamento ao final
def get_db():
    db = SessionLocal()  # Abre a sessão/conexão com o banco
    try:
        yield db         # Entrega a conexão ativa para a rota da API utilizar
    finally:
        db.close()       # Fecha a conexão com segurança logo após o uso
