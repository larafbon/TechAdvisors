from sqlalchemy import Column, Integer, String, Text
from database import Base


class Professor(Base):
    __tablename__ = "professor"

    id_professor = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    status = Column(String(20), default="ativo")
    senha = Column(String(255), nullable=True)


class Responsavel(Base):
    __tablename__ = "responsavel"

    id_responsavel = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    telefone = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    cpf = Column(String(11), unique=True, nullable=True)


class TipoDeficiencia(Base):
    __tablename__ = "tipo_deficiencia"

    id_tipo_deficiencia = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=False)
    descricao = Column(Text, nullable=False)


class NivelSuporte(Base):
    __tablename__ = "nivel_suporte"

    id_nivel_suporte = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(50), unique=True, nullable=False)
    descricao = Column(Text, nullable=False)


class TipoAtividade(Base):
    __tablename__ = "tipo_atividade"

    id_tipo_atividade = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=True)


class RecursoAcessibilidade(Base):
    __tablename__ = "recurso_acessibilidade"

    id_recurso = Column(Integer, primary_key=True, index=True)
    nome = Column(String(150), nullable=False)
    descricao = Column(Text, nullable=True)
    tipo = Column(String(50), nullable=True)
    formato = Column(String(20), nullable=True)