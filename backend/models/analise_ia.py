from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AnaliseIaCreate(BaseModel):
    modelo_utilizado: str
    id_resposta: int
    resultado: str
    sugestoes: Optional[str] = None
    data_analise: datetime

class AnaliseIaResponse(BaseModel):
    id_analise: int
    modelo_utilizado: str
    id_resposta: int
    resultado: str
    sugestoes: Optional[str]
    data_analise: datetime