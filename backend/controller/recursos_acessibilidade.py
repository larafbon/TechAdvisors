from fastapi import APIRouter
from typing import List
from database import supabase
from models.recursos_acessibilidade import RecursoAcessibilidadeCreate, RecursoAcessibilidadeResponse

router = APIRouter(prefix="/recursos-acessibilidade", tags=["Recursos de Acessibilidade"])

@router.post("", response_model=RecursoAcessibilidadeResponse)
def criar_recurso_acessibilidade(item: RecursoAcessibilidadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("recurso_acessibilidade").insert(dados).execute()
    return res.data[0]

@router.get("", response_model=List[RecursoAcessibilidadeResponse])
def listar_recursos_acessibilidade():
    res = supabase.table("recurso_acessibilidade").select("*").execute()
    return res.data or []

@router.put("/{id_recurso}")
def atualizar_recurso_acessibilidade(id_recurso: int, item: RecursoAcessibilidadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("recurso_acessibilidade").update(dados).eq("id_recurso", id_recurso).execute()
    return res.data or {}

@router.delete("/{id_recurso}")
def deletar_recurso_acessibilidade(id_recurso: int):
    res = supabase.table("recurso_acessibilidade").delete().eq("id_recurso", id_recurso).execute()
    return {"message": "Excluído com sucesso", "data": res.data}