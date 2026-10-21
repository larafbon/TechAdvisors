from fastapi import APIRouter
from database import supabase
from models.atividade_recurso import AtividadeRecursoCreate

router = APIRouter(prefix="/atividade-recurso", tags=["Atividade Recurso"])

@router.post("")
def vincular_atividade_recurso(item: AtividadeRecursoCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("atividade_recurso").insert(dados).execute()
    return res.data[0]

@router.get("/{id_atividade}")
def listar_recursos_da_atividade(id_atividade: int):
    res = supabase.table("atividade_recurso").select("*, recurso_acessibilidade(*)").eq("id_atividade", id_atividade).execute()
    return res.data or []

@router.delete("/{id_atividade}/{id_recurso}")
def desvincular_atividade_recurso(id_atividade: int, id_recurso: int):
    res = supabase.table("atividade_recurso").delete().eq("id_atividade", id_atividade).eq("id_recurso", id_recurso).execute()
    return {"message": "Vínculo removido", "data": res.data}