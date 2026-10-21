from fastapi import APIRouter
from typing import List
from database import supabase
from models.atividades import AtividadeCreate, AtividadeResponse

router = APIRouter(prefix="/atividades", tags=["Atividades"])

@router.post("", response_model=AtividadeResponse)
def criar_atividade(item: AtividadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    dados["data_criacao"] = str(dados["data_criacao"])
    res = supabase.table("atividade").insert(dados).execute()
    return res.data[0]

@router.get("", response_model=List[AtividadeResponse])
def listar_atividades():
    res = supabase.table("atividade").select("*").execute()
    return res.data or []

@router.put("/{id_atividade}")
def atualizar_atividade(id_atividade: int, item: AtividadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    dados["data_criacao"] = str(dados["data_criacao"])
    res = supabase.table("atividade").update(dados).eq("id_atividade", id_atividade).execute()
    return res.data or {}

@router.delete("/{id_atividade}")
def deletar_atividade(id_atividade: int):
    res = supabase.table("atividade").delete().eq("id_atividade", id_atividade).execute()
    return {"message": "Atividade excluída com sucesso", "data": res.data}