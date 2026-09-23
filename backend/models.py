from sqlalchemy import Column, Integer, String
from database import Base

class RecursoAcessibilidade(Base):
    __tablename__ = "recurso_acessibilidade"

    id_recurso = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(150), nullable=False)
    descricao = Column(String, nullable=True)
    tipo = Column(String(50), nullable=True)
    formato = Column(String(20), nullable=True)