from pydantic import BaseModel
from typing import Optional
from datetime import date

class AlunoCreate(BaseModel):
    nome: str
    matricula: str
    data_nascimento: date
    email: Optional[str] = None
    senha: Optional[str] = None
    id_turma: Optional[int] = None
    id_nivel_suporte: Optional[int] = None
    id_tipo_deficiencia: Optional[int] = None
    id_responsavel: Optional[int] = None

class AlunoResponse(BaseModel):
    id_aluno: int
    nome: str
    matricula: str
    data_nascimento: date
    email: Optional[str]
    id_turma: Optional[int]
    id_nivel_suporte: Optional[int]
    id_tipo_deficiencia: Optional[int]
    id_responsavel: Optional[int]