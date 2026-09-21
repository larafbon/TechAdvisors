from sqlalchemy import Column, Integer, String
from database import Base

class RecursoAcessibilidade(Base):
    __tablename__ = "recurso_acessibilidade"

    id_recurso = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String)