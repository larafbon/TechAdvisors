from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class RecursoAcessibilidade(Base):
    __tablename__ = "recurso_acessibilidade"

    id_recurso = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(150), nullable=False)
    descricao = Column(String, nullable=True)
    tipo = Column(String(50), nullable=True)
    formato = Column(String(20), nullable=True)


class Professor(Base):
    __tablename__ = "professor"

    id_professor = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    status = Column(String(20), default="ativo")

    turmas = relationship("Turma", back_populates="professor")


class Turma(Base):
    __tablename__ = "turma"

    id_turma = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_turma = Column(String(20), unique=True, nullable=False)
    nome_turma = Column(String(100), nullable=False)
    serie_ano = Column(String(50), nullable=False)
    disciplina = Column(String(100), nullable=False)
    turno = Column(String(20), nullable=False)
    ano_letivo = Column(Integer, nullable=False)
    status_turma = Column(String(20), default="ativa")
    id_professor = Column(Integer, ForeignKey("professor.id_professor"), nullable=False)

    professor = relationship("Professor", back_populates="turmas")