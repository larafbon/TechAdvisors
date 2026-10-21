from pydantic import BaseModel
from typing import Optional

class ProfessorCreate(BaseModel):
    nome: str
    email: str
    senha: str
    status: Optional[str] = "ativo"

class ProfessorResponse(BaseModel):
    id_professor: int
    nome: str
    email: str
    status: Optional[str]