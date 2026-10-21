from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

# ==========================================
# AUTENTICAÇÃO
# ==========================================
class LoginRequest(BaseModel):
    email: str
    senha: str


# ==========================================
# 1. PROFESSOR
# ==========================================
class ProfessorCreate(BaseModel):
    nome: str
    email: str
    senha: str
    status: Optional[str] = "ativo"


class ProfessorResponse(BaseModel):
    id_professor: int
    nome: str
    email: str
    status: Optional[str]


# ==========================================
# 2. RESPONSÁVEL
# ==========================================
class ResponsavelCreate(BaseModel):
    nome: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    cpf: Optional[str] = None
    senha: Optional[str] = None


class ResponsavelResponse(BaseModel):
    id_responsavel: int
    nome: str
    email: Optional[str]
    telefone: Optional[str]
    cpf: Optional[str]


# ==========================================
# 3. TIPO DE DEFICIÊNCIA
# ==========================================
class TipoDeficienciaCreate(BaseModel):
    codigo: str
    descricao: str


class TipoDeficienciaResponse(BaseModel):
    id_tipo_deficiencia: int
    codigo: str
    descricao: str


# ==========================================
# 4. NÍVEL DE SUPORTE
# ==========================================
class NivelSuporteCreate(BaseModel):
    codigo: str
    descricao: str


class NivelSuporteResponse(BaseModel):
    id_nivel_suporte: int
    codigo: str
    descricao: str


# ==========================================
# 5. TURMA
# ==========================================
class TurmaCreate(BaseModel):
    codigo_turma: str
    nome_turma: str
    serie_ano: str
    disciplina: str
    turno: str
    ano_letivo: int
    id_professor: int
    status_turma: Optional[str] = "ativa"


class TurmaResponse(BaseModel):
    id_turma: int
    codigo_turma: str
    nome_turma: str
    serie_ano: str
    disciplina: str
    turno: str
    ano_letivo: int
    id_professor: int
    status_turma: Optional[str]


# ==========================================
# 6. ALUNO
# ==========================================
class AlunoCreate(BaseModel):
    nome: str
    matricula: str
    data_nascimento: date
    email: Optional[str] = None
    senha: Optional[str] = None  # Adicionado suporte a senha no cadastro do aluno
    id_turma: Optional[int] = None
    id_nivel_suporte: Optional[int] = None
    id_tipo_deficiencia: Optional[int] = None
    id_responsavel: Optional[int] = None


class AlunoResponse(BaseModel):
    id_aluno: int
    nome: str
    matricula: str
    data_nascimento: date
    email: Optional[str]
    id_turma: Optional[int]
    id_nivel_suporte: Optional[int]
    id_tipo_deficiencia: Optional[int]
    id_responsavel: Optional[int]


# ==========================================
# 7. ALUNO DEFICIÊNCIA
# ==========================================
class AlunoDeficienciaCreate(BaseModel):
    id_aluno: int
    id_tipo_deficiencia: int
    id_nivel_suporte: int


class AlunoDeficienciaResponse(BaseModel):
    id_aluno_deficiencia: int
    id_aluno: int
    id_tipo_deficiencia: int
    id_nivel_suporte: int


# ==========================================
# 8. CONFIGURAÇÃO DE ACESSIBILIDADE
# ==========================================
class ConfigAcessibilidadeCreate(BaseModel):
    id_aluno: int
    preferencia_visual: Optional[bool] = False
    preferencia_audio: Optional[bool] = False
    preferencia_simplificado: Optional[bool] = False
    outras_configuracoes: Optional[str] = None


class ConfigAcessibilidadeResponse(BaseModel):
    id_config: int
    id_aluno: int
    preferencia_visual: Optional[bool]
    preferencia_audio: Optional[bool]
    preferencia_simplificado: Optional[bool]
    outras_configuracoes: Optional[str]


# ==========================================
# 9. TIPO DE ATIVIDADE
# ==========================================
class TipoAtividadeCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None


class TipoAtividadeResponse(BaseModel):
    id_tipo_atividade: int
    nome: str
    descricao: Optional[str]


# ==========================================
# 10. ATIVIDADE
# ==========================================
class AtividadeCreate(BaseModel):
    titulo: str
    id_tipo_atividade: int
    data_criacao: date
    descricao: Optional[str] = None


class AtividadeResponse(BaseModel):
    id_atividade: int
    titulo: str
    id_tipo_atividade: int
    data_criacao: date
    descricao: Optional[str]


# ==========================================
# 11. RECURSO DE ACESSIBILIDADE
# ==========================================
class RecursoAcessibilidadeCreate(BaseModel):
    nome: str
    tipo: Optional[str] = None
    formato: Optional[str] = None
    descricao: Optional[str] = None


class RecursoAcessibilidadeResponse(BaseModel):
    id_recurso: int
    nome: str
    tipo: Optional[str]
    formato: Optional[str]
    descricao: Optional[str]


# ==========================================
# 12. ATIVIDADE RECURSO
# ==========================================
class AtividadeRecursoCreate(BaseModel):
    id_atividade: int
    id_recurso: int


# ==========================================
# 13. RESPOSTA
# ==========================================
class RespostaCreate(BaseModel):
    conteudo_resposta: str
    id_aluno: int
    id_atividade: int
    data_resposta: datetime
    nota: Optional[float] = None


class RespostaResponse(BaseModel):
    id_resposta: int
    conteudo_resposta: str
    id_aluno: int
    id_atividade: int
    data_resposta: datetime
    nota: Optional[float]


# ==========================================
# 14. RESPOSTA RECURSO
# ==========================================
class RespostaRecursoCreate(BaseModel):
    id_resposta: int
    id_recurso: int


# ==========================================
# 15. ANÁLISE IA
# ==========================================
class AnaliseIaCreate(BaseModel):
    modelo_utilizado: str
    id_resposta: int
    resultado: str
    sugestoes: Optional[str] = None
    data_analise: datetime
class AnaliseIaResponse(BaseModel):
    id_analise: int
    modelo_utilizado: str
    id_resposta: int
    resultado: str
    sugestoes: Optional[str]
    data_analise: datetime