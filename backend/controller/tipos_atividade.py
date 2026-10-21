from fastapi import APIRouter
from typing import List
from database import supabase
from models.tipos_atividade import TipoAtividadeCreate, TipoAtividadeResponse

router = APIRouter(prefix="/tipos-atividade", tags=["Tipos de Atividade"])

@router.post("", response_model=TipoAtividadeResponse)
def criar_tipo_atividade(item: TipoAtividadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("tipo_atividade").insert(dados).execute()
    return res.data[0]

@router.get("", response_model=List[TipoAtividadeResponse])
def listar_tipos_atividade():
    res = supabase.table("tipo_atividade").select("*").execute()
    return res.data or []

@router.put("/{id_tipo_atividade}")
def atualizar_tipo_atividade(id_tipo_atividade: int, item: TipoAtividadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("tipo_atividade").update(dados).eq("id_tipo_atividade", id_tipo_atividade).execute()
    return res.data or {}

@router.delete("/{id_tipo_atividade}")
def deletar_tipo_atividade(id_tipo_atividade: int):
    res = supabase.table("tipo_atividade").delete().eq("id_tipo_atividade", id_tipo_atividade).execute()
    return {"message": "Excluído com sucesso", "data": res.data}