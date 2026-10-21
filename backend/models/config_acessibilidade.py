from pydantic import BaseModel
from typing import Optional

class ConfigAcessibilidadeCreate(BaseModel):
    id_aluno: int
    preferencia_visual: Optional[bool] = False
    preferencia_audio: Optional[bool] = False
    preferencia_simplificado: Optional[bool] = False
    outras_configuracoes: Optional[str] = None

class ConfigAcessibilidadeResponse(BaseModel):
    id_config: int
    id_aluno: int
    preferencia_visual: Optional[bool]
    preferencia_audio: Optional[bool]
    preferencia_simplificado: Optional[bool]
    outras_configuracoes: Optional[str]