from pydantic import BaseModel
from typing import Optional
from datetime import date

class AtividadeCreate(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    id_turma: int = 1
    id_tipo_atividade: int = 1
    ficheiro_url: Optional[str] = None

class AtividadeResponse(BaseModel):
    id_atividade: int
    titulo: str
    descricao: Optional[str] = None
    data_criacao: date
    id_tipo_atividade: int
    id_turma: Optional[int] = None
    ficheiro_url: Optional[str] = None