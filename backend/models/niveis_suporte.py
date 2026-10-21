from pydantic import BaseModel

class NivelSuporteCreate(BaseModel):
    codigo: str
    descricao: str

class NivelSuporteResponse(BaseModel):
    id_nivel_suporte: int
    codigo: str
    descricao: str