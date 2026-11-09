from pydantic import BaseModel
from typing import Optional
from datetime import date


class AtividadeCreate(BaseModel):
    titulo: str
    descricao: Optional[str] = None
    id_turma: int = 1
    id_tipo_atividade: int = 1
    data_criacao: Optional[str] = None
class AtividadeResponse(BaseModel):
    id_atividade: int
    titulo: str
    id_tipo_atividade: int
    id_turma: Optional[int] = None  # <-- NOVO CAMPO RETORNADO
    data_criacao: date
    descricao: Optional[str] = None