from pydantic import BaseModel
from typing import Optional

class RecursoBase(BaseModel):
    nome: str
    descricao: Optional[str] = None

class RecursoCreate(RecursoBase):
    pass

class RecursoResponse(RecursoBase):
    id_recurso: int

    class Config:
        from_attributes = True