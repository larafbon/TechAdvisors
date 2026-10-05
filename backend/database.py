import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Carrega as variáveis do arquivo .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("A variável DATABASE_URL não está configurada no arquivo .env")

# Configuração do Engine com suporte ao Pooler do Supabase e psycopg 3
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "prepare_threshold": None,  # Desativa prepared statements (evita erro no pooler)
        "sslmode": "require"         # Exige conexão SSL segura
    },
    pool_pre_ping=True,            # Testa a conexão antes de executar queries
    pool_recycle=300,              # Recicla conexões a cada 5 minutos
)

# Sessão para consultas ao banco
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Classe Base para os modelos SQLAlchemy
Base = declarative_base()

# Dependency do FastAPI para injetar a sessão do BD nas rotas
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()