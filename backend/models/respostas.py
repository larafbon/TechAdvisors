from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class RespostaCreate(BaseModel):
    conteudo_resposta: str
    id_aluno: int
    id_atividade: int
    data_resposta: datetime
    nota: Optional[float] = None

class RespostaResponse(BaseModel):
    id_resposta: int
    conteudo_resposta: str
    id_aluno: int
    id_atividade: int
    data_resposta: datetime
    nota: Optional[float]