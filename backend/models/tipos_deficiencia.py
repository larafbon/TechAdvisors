from pydantic import BaseModel

class TipoDeficienciaCreate(BaseModel):
    codigo: str
    descricao: str

class TipoDeficienciaResponse(BaseModel):
    id_tipo_deficiencia: int
    codigo: str
    descricao: str