from pydantic import BaseModel
from typing import Optional

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