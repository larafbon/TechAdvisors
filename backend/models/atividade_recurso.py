from pydantic import BaseModel

class AtividadeRecursoCreate(BaseModel):
    id_atividade: int
    id_recurso: int