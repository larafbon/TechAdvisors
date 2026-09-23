import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# URL Oficial do Transaction Pooler IPv4
DATABASE_URL = "postgresql://postgres.zarnjgllibjujgkrxnfv:TechAdvisors2026@aws-0-ca-central-1.pooler.supabase.com:6543/postgres"

# Argumentos para evitar travamento de conexão no Codespaces/Supabase
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_recycle=300,
    connect_args={"connect_timeout": 10}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()