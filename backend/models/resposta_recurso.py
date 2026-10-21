from pydantic import BaseModel

class RespostaRecursoCreate(BaseModel):
    id_resposta: int
    id_recurso: int