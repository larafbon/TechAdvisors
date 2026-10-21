from pydantic import BaseModel
from typing import Optional

class ResponsavelCreate(BaseModel):
    nome: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    cpf: Optional[str] = None
    senha: Optional[str] = None

class ResponsavelResponse(BaseModel):
    id_responsavel: int
    nome: str
    email: Optional[str]
    telefone: Optional[str]
    cpf: Optional[str]