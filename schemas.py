from datetime import date
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

# --- RESPONSÁVEL ---
class ResponsavelBase(BaseModel):
    nome: str
    telefone: Optional[str] = None
    email: Optional[EmailStr] = None
    cpf: Optional[str] = Field(None, max_length=11)

class ResponsavelCreate(ResponsavelBase):
    pass


# --- TIPO DEFICIÊNCIA ---
class TipoDeficienciaBase(BaseModel):
    codigo: str
    descricao: str

class TipoDeficienciaCreate(TipoDeficienciaBase):
    pass


# --- NÍVEL DE SUPORTE ---
class NivelSuporteBase(BaseModel):
    codigo: str
    descricao: str

class NivelSuporteCreate(NivelSuporteBase):
    pass


# --- PROFESSOR ---
class ProfessorBase(BaseModel):
    nome: str
    email: EmailStr
    status: Optional[str] = "ativo"

class ProfessorCreate(ProfessorBase):
    senha: str  # Campo adicionado para a tabela professor


# --- TIPO ATIVIDADE ---
class TipoAtividadeBase(BaseModel):
    nome: str
    descricao: Optional[str] = None

class TipoAtividadeCreate(TipoAtividadeBase):
    pass


# --- RECURSO ACESSIBILIDADE ---
class RecursoAcessibilidadeBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: Optional[str] = None
    formato: Optional[str] = None

class RecursoAcessibilidadeCreate(RecursoAcessibilidadeBase):
    pass


# --- TURMA ---
class TurmaBase(BaseModel):
    codigo_turma: str
    nome_turma: str
    serie_ano: str
    disciplina: str
    turno: str
    ano_letivo: int
    status_turma: Optional[str] = "ativa"
    id_professor: int

class TurmaCreate(TurmaBase):
    pass


# --- ALUNO ---
class AlunoBase(BaseModel):
    nome: str
    data_nascimento: date
    email: Optional[EmailStr] = None
    matricula: str
    id_responsavel: Optional[int] = None
    id_turma: Optional[int] = None
    id_nivel_suporte: Optional[int] = None
    id_tipo_deficiencia: Optional[int] = None

class AlunoCreate(AlunoBase):
    pass


# --- ATIVIDADE ---
class AtividadeBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    id_tipo_atividade: int

class AtividadeCreate(AtividadeBase):
    pass


# --- CONFIG ACESSIBILIDADE ---
class ConfigAcessibilidadeBase(BaseModel):
    id_aluno: int
    preferencia_audio: Optional[bool] = False
    preferencia_visual: Optional[bool] = False
    preferencia_simplificado: Optional[bool] = False
    outras_configuracoes: Optional[str] = None

class ConfigAcessibilidadeCreate(ConfigAcessibilidadeBase):
    pass


# --- RESPOSTA ---
class RespostaBase(BaseModel):
    id_aluno: int
    id_atividade: int
    conteudo_resposta: str
    nota: Optional[float] = None

class RespostaCreate(RespostaBase):
    pass


# --- ANÁLISE IA ---
class AnaliseIaBase(BaseModel):
    id_resposta: int
    resultado: str
    sugestoes: Optional[str] = None
    modelo_utilizado: str

class AnaliseIaCreate(AnaliseIaBase):
    pass


# --- VÍNCULOS N:M ---
class AlunoDeficienciaCreate(BaseModel):
    id_aluno: int
    id_tipo_deficiencia: int
    id_nivel_suporte: int

class AtividadeRecursoCreate(BaseModel):
    id_atividade: int
    id_recurso: int

class RespostaRecursoCreate(BaseModel):
    id_resposta: int
    id_recurso: int