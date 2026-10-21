from fastapi import APIRouter
from database import supabase
from models.resposta_recurso import RespostaRecursoCreate

router = APIRouter(prefix="/resposta-recurso", tags=["Resposta Recurso"])

@router.post("")
def vincular_resposta_recurso(item: RespostaRecursoCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("resposta_recurso").insert(dados).execute()
    return res.data[0]

@router.get("/{id_resposta}")
def listar_recursos_da_resposta(id_resposta: int):
    res = supabase.table("resposta_recurso").select("*, recurso_acessibilidade(*)").eq("id_resposta", id_resposta).execute()
    return res.data or []