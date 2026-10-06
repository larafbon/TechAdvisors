from sqlalchemy import Column, Integer, String, Text, Boolean, Date, DateTime, Numeric, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

# --- BLOCO 1: TABELAS BASE ---

class Responsavel(Base):
    __tablename__ = "responsavel"

    id_responsavel = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(150), nullable=False)
    telefone = Column(String(20), nullable=True)
    email = Column(String(150), nullable=True)
    cpf = Column(String(11), unique=True, nullable=True)

    alunos = relationship("Aluno", back_populates="responsavel")


class TipoDeficiencia(Base):
    __tablename__ = "tipo_deficiencia"

    id_tipo_deficiencia = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    descricao = Column(Text, nullable=False)

    alunos = relationship("Aluno", back_populates="tipo_deficiencia")
    aluno_deficiencias = relationship("AlunoDeficiencia", back_populates="tipo_deficiencia")


class NivelSuporte(Base):
    __tablename__ = "nivel_suporte"

    id_nivel_suporte = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    descricao = Column(Text, nullable=False)

    alunos = relationship("Aluno", back_populates="nivel_suporte")
    aluno_deficiencias = relationship("AlunoDeficiencia", back_populates="nivel_suporte")


class Professor(Base):
    __tablename__ = "professor"

    id_professor = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    status = Column(String(20), default='ativo')
    senha = Column(String(255), nullable=True)

    turmas = relationship("Turma", back_populates="professor")


class TipoAtividade(Base):
    __tablename__ = "tipo_atividade"

    id_tipo_atividade = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text, nullable=True)

    atividades = relationship("Atividade", back_populates="tipo_atividade")


class RecursoAcessibilidade(Base):
    __tablename__ = "recurso_acessibilidade"

    id_recurso = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(150), nullable=False)
    descricao = Column(Text, nullable=True)
    tipo = Column(String(50), nullable=True)
    formato = Column(String(20), nullable=True)

    atividade_recursos = relationship("AtividadeRecurso", back_populates="recurso")
    resposta_recursos = relationship("RespostaRecurso", back_populates="recurso")


# --- BLOCO 2: TABELAS DEPENDENTES ---

class Turma(Base):
    __tablename__ = "turma"

    id_turma = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_turma = Column(String(20), unique=True, nullable=False)
    nome_turma = Column(String(100), nullable=False)
    serie_ano = Column(String(50), nullable=False)
    disciplina = Column(String(100), nullable=False)
    turno = Column(String(20), nullable=False)
    ano_letivo = Column(Integer, nullable=False)
    status_turma = Column(String(20), default='ativa')
    id_professor = Column(Integer, ForeignKey("professor.id_professor", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False)

    professor = relationship("Professor", back_populates="turmas")
    alunos = relationship("Aluno", back_populates="turma")


class Aluno(Base):
    __tablename__ = "aluno"

    id_aluno = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nome = Column(String(150), nullable=False)
    data_nascimento = Column(Date, nullable=False)
    email = Column(String(150), unique=True, nullable=True)
    matricula = Column(String(50), unique=True, nullable=False)
    id_responsavel = Column(Integer, ForeignKey("responsavel.id_responsavel", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
    id_turma = Column(Integer, ForeignKey("turma.id_turma", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
    id_nivel_suporte = Column(Integer, ForeignKey("nivel_suporte.id_nivel_suporte", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
    id_tipo_deficiencia = Column(Integer, ForeignKey("tipo_deficiencia.id_tipo_deficiencia", ondelete="SET NULL", onupdate="CASCADE"), nullable=True)

    responsavel = relationship("Responsavel", back_populates="alunos")
    turma = relationship("Turma", back_populates="alunos")
    nivel_suporte = relationship("NivelSuporte", back_populates="alunos")
    tipo_deficiencia = relationship("TipoDeficiencia", back_populates="alunos")
    config_acessibilidade = relationship("ConfigAcessibilidade", back_populates="aluno", uselist=False)
    aluno_deficiencias = relationship("AlunoDeficiencia", back_populates="aluno")
    respostas = relationship("Resposta", back_populates="aluno")


class Atividade(Base):
    __tablename__ = "atividade"

    id_atividade = Column(Integer, primary_key=True, index=True, autoincrement=True)
    titulo = Column(String(150), nullable=False)
    descricao = Column(Text, nullable=True)
    data_criacao = Column(Date, server_default=func.current_date(), nullable=False)
    id_tipo_atividade = Column(Integer, ForeignKey("tipo_atividade.id_tipo_atividade", ondelete="RESTRICT", onupdate="CASCADE"), nullable=False)

    tipo_atividade = relationship("TipoAtividade", back_populates="atividades")
    atividade_recursos = relationship("AtividadeRecurso", back_populates="atividade")
    respostas = relationship("Resposta", back_populates="atividade")


# --- BLOCO 3: VÍNCULOS E ENTIDADES DERIVADAS ---

class ConfigAcessibilidade(Base):
    __tablename__ = "config_acessibilidade"

    id_config = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_aluno = Column(Integer, ForeignKey("aluno.id_aluno", ondelete="CASCADE", onupdate="CASCADE"), unique=True, nullable=False)
    preferencia_audio = Column(Boolean, default=False)
    preferencia_visual = Column(Boolean, default=False)
    preferencia_simplificado = Column(Boolean, default=False)
    outras_configuracoes = Column(Text, nullable=True)

    aluno = relationship("Aluno", back_populates="config_acessibilidade")


class AlunoDeficiencia(Base):
    __tablename__ = "aluno_deficiencia"

    id_aluno_deficiencia = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_aluno = Column(Integer, ForeignKey("aluno.id_aluno", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    id_tipo_deficiencia = Column(Integer, ForeignKey("tipo_deficiencia.id_tipo_deficiencia", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    id_nivel_suporte = Column(Integer, ForeignKey("nivel_suporte.id_nivel_suporte", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    aluno = relationship("Aluno", back_populates="aluno_deficiencias")
    tipo_deficiencia = relationship("TipoDeficiencia", back_populates="aluno_deficiencias")
    nivel_suporte = relationship("NivelSuporte", back_populates="aluno_deficiencias")


class AtividadeRecurso(Base):
    __tablename__ = "atividade_recurso"

    id_atividade = Column(Integer, ForeignKey("atividade.id_atividade", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    id_recurso = Column(Integer, ForeignKey("recurso_acessibilidade.id_recurso", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)

    atividade = relationship("Atividade", back_populates="atividade_recursos")
    recurso = relationship("RecursoAcessibilidade", back_populates="atividade_recursos")


class Resposta(Base):
    __tablename__ = "resposta"

    id_resposta = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_aluno = Column(Integer, ForeignKey("aluno.id_aluno", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    id_atividade = Column(Integer, ForeignKey("atividade.id_atividade", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    data_resposta = Column(DateTime, server_default=func.current_timestamp(), nullable=False)
    conteudo_resposta = Column(Text, nullable=False)
    nota = Column(Numeric(4, 2), nullable=True)

    aluno = relationship("Aluno", back_populates="respostas")
    atividade = relationship("Atividade", back_populates="respostas")
    analises_ia = relationship("AnaliseIA", back_populates="resposta")
    resposta_recursos = relationship("RespostaRecurso", back_populates="resposta")


# --- BLOCO 4: INTELIGÊNCIA ARTIFICIAL E JUNÇÕES ---

class AnaliseIA(Base):
    __tablename__ = "analise_ia"

    id_analise = Column(Integer, primary_key=True, index=True, autoincrement=True)
    id_resposta = Column(Integer, ForeignKey("resposta.id_resposta", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    data_analise = Column(DateTime, server_default=func.current_timestamp(), nullable=False)
    resultado = Column(Text, nullable=False)
    sugestoes = Column(Text, nullable=True)
    modelo_utilizado = Column(String(100), nullable=False)

    resposta = relationship("Resposta", back_populates="analises_ia")


class RespostaRecurso(Base):
    __tablename__ = "resposta_recurso"

    id_resposta = Column(Integer, ForeignKey("resposta.id_resposta", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)
    id_recurso = Column(Integer, ForeignKey("recurso_acessibilidade.id_recurso", ondelete="CASCADE", onupdate="CASCADE"), primary_key=True)

    resposta = relationship("Resposta", back_populates="resposta_recursos")
    recurso = relationship("RecursoAcessibilidade", back_populates="resposta_recursos")