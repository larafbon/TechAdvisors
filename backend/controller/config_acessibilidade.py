from fastapi import APIRouter
from database import supabase
from models.config_acessibilidade import ConfigAcessibilidadeCreate, ConfigAcessibilidadeResponse

router = APIRouter(prefix="/config-acessibilidade", tags=["Config. Acessibilidade"])

@router.post("", response_model=ConfigAcessibilidadeResponse)
def criar_config_acessibilidade(item: ConfigAcessibilidadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("config_acessibilidade").insert(dados).execute()
    return res.data[0]

@router.get("/aluno/{id_aluno}")
def obter_config_aluno(id_aluno: int):
    res = supabase.table("config_acessibilidade").select("*").eq("id_aluno", id_aluno).execute()
    return res.data[0] if res.data else {}

@router.put("/{id_config}")
def atualizar_config_acessibilidade(id_config: int, item: ConfigAcessibilidadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("config_acessibilidade").update(dados).eq("id_config", id_config).execute()
    return res.data or {}