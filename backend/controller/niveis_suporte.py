from fastapi import APIRouter
from typing import List
from database import supabase
from models.niveis_suporte import NivelSuporteCreate, NivelSuporteResponse

router = APIRouter(prefix="/niveis-suporte", tags=["Níveis de Suporte"])

@router.post("", response_model=NivelSuporteResponse)
def criar_nivel_suporte(item: NivelSuporteCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("nivel_suporte").insert(dados).execute()
    return res.data[0]

@router.get("", response_model=List[NivelSuporteResponse])
def listar_niveis_suporte():
    res = supabase.table("nivel_suporte").select("*").execute()
    return res.data or []

@router.put("/{id_nivel_suporte}")
def atualizar_nivel_suporte(id_nivel_suporte: int, item: NivelSuporteCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("nivel_suporte").update(dados).eq("id_nivel_suporte", id_nivel_suporte).execute()
    return res.data or {}

@router.delete("/{id_nivel_suporte}")
def deletar_nivel_suporte(id_nivel_suporte: int):
    res = supabase.table("nivel_suporte").delete().eq("id_nivel_suporte", id_nivel_suporte).execute()
    return {"message": "Excluído com sucesso", "data": res.data}