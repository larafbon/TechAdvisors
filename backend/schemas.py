from pydantic import BaseModel
from typing import Optional

class RecursoAcessibilidadeCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    tipo: Optional[str] = None
    formato: Optional[str] = None

class RecursoAcessibilidadeResponse(RecursoAcessibilidadeCreate):
    id_recurso: int

    class Config:
        from_attributes = True