from pydantic import BaseModel, ConfigDict
from typing import Optional

# Schema base
class TipoDeficienciaBase(BaseModel):
    codigo: str
    descricao: str

# Schema para criação (POST)
class TipoDeficienciaCreate(TipoDeficienciaBase):
    pass

# Schema para atualização parcial (PUT/PATCH)
class TipoDeficienciaUpdate(BaseModel):
    codigo: Optional[str] = None
    descricao: Optional[str] = None

# Schema de resposta (GET)
class TipoDeficienciaResponse(TipoDeficienciaBase):
    id_tipo_deficiencia: int

    # Compatibilidade do Pydantic v2 com objetos do SQLAlchemy
    model_config = ConfigDict(from_attributes=True)