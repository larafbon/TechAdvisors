from fastapi import APIRouter
from typing import List, Optional
from database import supabase
from models.respostas import RespostaCreate, RespostaResponse

router = APIRouter(prefix="/respostas", tags=["Respostas"])

@router.post("", response_model=RespostaResponse)
def criar_resposta(item: RespostaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    dados["data_resposta"] = str(dados["data_resposta"])
    res = supabase.table("resposta").insert(dados).execute()
    return res.data[0]

@router.get("", response_model=List[RespostaResponse])
def listar_respostas(id_aluno: Optional[int] = None, id_atividade: Optional[int] = None):
    query = supabase.table("resposta").select("*")
    if id_aluno:
        query = query.eq("id_aluno", id_aluno)
    if id_atividade:
        query = query.eq("id_atividade", id_atividade)
    res = query.execute()
    return res.data or []

@router.put("/{id_resposta}")
def atualizar_resposta(id_resposta: int, item: RespostaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    dados["data_resposta"] = str(dados["data_resposta"])
    res = supabase.table("resposta").update(dados).eq("id_resposta", id_resposta).execute()
    return res.data or {}

@router.delete("/{id_resposta}")
def deletar_resposta(id_resposta: int):
    res = supabase.table("resposta").delete().eq("id_resposta", id_resposta).execute()
    return {"message": "Resposta excluída", "data": res.data}