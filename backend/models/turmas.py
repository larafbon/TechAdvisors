from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class TurmaCreate(BaseModel):
    codigo_turma: str
    nome_turma: str
    serie_ano: str
    disciplina: Optional[str] = None
    turno: str
    ano_letivo: int
    id_professor: Optional[int] = None
    status_turma: Optional[str] = "ativa"


class TurmaUpdate(BaseModel):
    codigo_turma: Optional[str] = None
    nome_turma: Optional[str] = None
    serie_ano: Optional[str] = None
    disciplina: Optional[str] = None
    turno: Optional[str] = None
    ano_letivo: Optional[int] = None
    id_professor: Optional[int] = None
    status_turma: Optional[str] = None


class TurmaResponse(BaseModel):
    id_turma: int
    codigo_turma: Optional[str] = None
    nome_turma: str
    serie_ano: Optional[str] = None
    disciplina: Optional[str] = None
    turno: Optional[str] = None
    ano_letivo: Optional[int] = None
    id_professor: Optional[int] = None
    status_turma: Optional[str] = "ativa"
    created_at: Optional[datetime] = None