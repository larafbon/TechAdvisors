from pydantic import BaseModel
from typing import Optional

class TipoAtividadeCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None

class TipoAtividadeResponse(BaseModel):
    id_tipo_atividade: int
    nome: str
    descricao: Optional[str]