from pydantic import BaseModel
from typing import Optional
from datetime import date

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