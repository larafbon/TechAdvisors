from pydantic import BaseModel
from typing import Optional

# --- SCHEMAS DE RECURSO ---
class RecursoAcessibilidadeCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: Optional[str] = None
    formato: Optional[str] = None

class RecursoAcessibilidadeResponse(RecursoAcessibilidadeCreate):
    id_recurso: int

    class Config:
        from_attributes = True

# --- SCHEMAS DE PROFESSOR ---
class ProfessorCreate(BaseModel):
    nome: str
    email: str
    status: Optional[str] = "ativo"

class ProfessorResponse(ProfessorCreate):
    id_professor: int

    class Config:
        from_attributes = True

# --- SCHEMAS DE TURMA ---
class TurmaCreate(BaseModel):
    codigo_turma: str
    nome_turma: str
    serie_ano: str
    disciplina: str
    turno: str
    ano_letivo: int
    id_professor: int

class TurmaResponse(TurmaCreate):
    id_turma: int
    status_turma: str

    class Config:
        from_attributes = True