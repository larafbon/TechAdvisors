from pydantic import BaseModel, ConfigDict

# --- Schemas de Aprendizagem (Categoria) ---
class CategoriaCreate(BaseModel):
    nome: str
    descricao: str | None = None

class CategoriaResponse(CategoriaCreate):
    id_categoria: int
    model_config = ConfigDict(from_attributes=True)


# --- Schemas Oficiais do Projeto (ConfiguracaoAcessibilidade) ---
class ConfiguracaoAcessibilidadeCreate(BaseModel):
    nome: str
    descricao: str | None = None

class ConfiguracaoAcessibilidadeResponse(ConfiguracaoAcessibilidadeCreate):
    id_configuracao: int
    model_config = ConfigDict(from_attributes=True) 