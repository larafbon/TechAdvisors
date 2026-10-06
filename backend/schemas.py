from pydantic import BaseModel, ConfigDict
from datetime import date, datetime
from typing import Optional, List

# --- 1. RESPONSÁVEL ---
class ResponsavelBase(BaseModel):
    nome: str
    telefone: Optional[str] = None
    email: Optional[str] = None
    cpf: Optional[str] = None

class ResponsavelCreate(ResponsavelBase):
    pass

class ResponsavelResponse(ResponsavelBase):
    id_responsavel: int
    model_config = ConfigDict(from_attributes=True)


# --- 2. TIPO DEFICIÊNCIA ---
class TipoDeficienciaBase(BaseModel):
    codigo: str
    descricao: str

class TipoDeficienciaCreate(TipoDeficienciaBase):
    pass

class TipoDeficienciaResponse(TipoDeficienciaBase):
    id_tipo_deficiencia: int
    model_config = ConfigDict(from_attributes=True)


# --- 3. NÍVEL DE SUPORTE ---
class NivelSuporteBase(BaseModel):
    codigo: str
    descricao: str

class NivelSuporteCreate(NivelSuporteBase):
    pass

class NivelSuporteResponse(NivelSuporteBase):
    id_nivel_suporte: int
    model_config = ConfigDict(from_attributes=True)


# --- 4. PROFESSOR ---
class ProfessorBase(BaseModel):
    nome: str
    email: str
    status: Optional[str] = 'ativo'

class ProfessorCreate(ProfessorBase):
    senha: str  # Senha obrigatória na criação do cadastro

class ProfessorResponse(ProfessorBase):
    id_professor: int
    # Opcional: omitimos a senha no retorno da API por questões de segurança
    model_config = ConfigDict(from_attributes=True)
    
# --- 5. TIPO ATIVIDADE ---
class TipoAtividadeBase(BaseModel):
    nome: str
    descricao: Optional[str] = None

class TipoAtividadeCreate(TipoAtividadeBase):
    pass

class TipoAtividadeResponse(TipoAtividadeBase):
    id_tipo_atividade: int
    model_config = ConfigDict(from_attributes=True)


# --- 6. RECURSO DE ACESSIBILIDADE ---
class RecursoAcessibilidadeBase(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: Optional[str] = None
    formato: Optional[str] = None

class RecursoAcessibilidadeCreate(RecursoAcessibilidadeBase):
    pass

class RecursoAcessibilidadeResponse(RecursoAcessibilidadeBase):
    id_recurso: int
    model_config = ConfigDict(from_attributes=True)


# --- 7. TURMA ---
class TurmaBase(BaseModel):
    codigo_turma: str
    nome_turma: str
    serie_ano: str
    disciplina: str
    turno: str
    ano_letivo: int
    status_turma: Optional[str] = 'ativa'
    id_professor: int

class TurmaCreate(TurmaBase):
    pass

class TurmaResponse(TurmaBase):
    id_turma: int
    model_config = ConfigDict(from_attributes=True)


# --- 8. ALUNO ---
class AlunoBase(BaseModel):
    nome: str
    data_nascimento: date
    email: Optional[str] = None
    matricula: str
    id_responsavel: Optional[int] = None
    id_turma: Optional[int] = None
    id_nivel_suporte: Optional[int] = None
    id_tipo_deficiencia: Optional[int] = None

class AlunoCreate(AlunoBase):
    pass

class AlunoResponse(AlunoBase):
    id_aluno: int
    model_config = ConfigDict(from_attributes=True)


# --- 9. ATIVIDADE ---
class AtividadeBase(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    id_tipo_atividade: int

class AtividadeCreate(AtividadeBase):
    pass

class AtividadeResponse(AtividadeBase):
    id_atividade: int
    data_criacao: date
    model_config = ConfigDict(from_attributes=True)


# --- 10. CONFIG ACESSIBILIDADE ---
class ConfigAcessibilidadeBase(BaseModel):
    id_aluno: int
    preferencia_audio: bool = False
    preferencia_visual: bool = False
    preferencia_simplificado: bool = False
    outras_configuracoes: Optional[str] = None

class ConfigAcessibilidadeCreate(ConfigAcessibilidadeBase):
    pass

class ConfigAcessibilidadeResponse(ConfigAcessibilidadeBase):
    id_config: int
    model_config = ConfigDict(from_attributes=True)


# --- 11. ALUNO DEFICIÊNCIA (N:M) ---
class AlunoDeficienciaBase(BaseModel):
    id_aluno: int
    id_tipo_deficiencia: int
    id_nivel_suporte: int

class AlunoDeficienciaCreate(AlunoDeficienciaBase):
    pass

class AlunoDeficienciaResponse(AlunoDeficienciaBase):
    id_aluno_deficiencia: int
    model_config = ConfigDict(from_attributes=True)


# --- 12. ATIVIDADE RECURSO (N:M) ---
class AtividadeRecursoBase(BaseModel):
    id_atividade: int
    id_recurso: int

class AtividadeRecursoCreate(AtividadeRecursoBase):
    pass

class AtividadeRecursoResponse(AtividadeRecursoBase):
    model_config = ConfigDict(from_attributes=True)


# --- 13. RESPOSTA ---
class RespostaBase(BaseModel):
    id_aluno: int
    id_atividade: int
    conteudo_resposta: str
    nota: Optional[float] = None

class RespostaCreate(RespostaBase):
    pass

class RespostaResponse(RespostaBase):
    id_resposta: int
    data_resposta: datetime
    model_config = ConfigDict(from_attributes=True)


# --- 14. ANÁLISE IA ---
class AnaliseIABase(BaseModel):
    id_resposta: int
    resultado: str
    sugestoes: Optional[str] = None
    modelo_utilizado: str

class AnaliseIACreate(AnaliseIABase):
    pass

class AnaliseIAResponse(AnaliseIABase):
    id_analise: int
    data_analise: datetime
    model_config = ConfigDict(from_attributes=True)


# --- 15. RESPOSTA RECURSO (N:M) ---
class RespostaRecursoBase(BaseModel):
    id_resposta: int
    id_recurso: int

class RespostaRecursoCreate(RespostaRecursoBase):
    pass

class RespostaRecursoResponse(RespostaRecursoBase):
    model_config = ConfigDict(from_attributes=True)