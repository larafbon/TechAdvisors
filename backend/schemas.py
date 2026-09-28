from pydantic import BaseModel
from typing import Optional

# Esquema para REQUISIÇÃO (Dados enviados no POST pelo cliente/frontend)
class RecursoAcessibilidadeCreate(BaseModel):
    nome: str                         # Campo obrigatório (Texto)
    descricao: Optional[str] = None   # Campo opcional (pode ser Nulo)
    tipo: Optional[str] = None        # Campo opcional (pode ser Nulo)
    formato: Optional[str] = None     # Campo opcional (pode ser Nulo)

# Esquema para RESPOSTA (Dados retornados pela API)
# Herda os campos de 'RecursoAcessibilidadeCreate' e adiciona o 'id_recurso'
class RecursoAcessibilidadeResponse(RecursoAcessibilidadeCreate):
    id_recurso: int                   # ID gerado pelo banco de dados

    # Permite converter automaticamente objetos do SQLAlchemy (models) para JSON
    class Config:
        from_attributes = True