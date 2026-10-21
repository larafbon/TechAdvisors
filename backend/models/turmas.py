from pydantic import BaseModel
from typing import Optional

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