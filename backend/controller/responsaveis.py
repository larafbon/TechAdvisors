from fastapi import APIRouter
from typing import List
from database import supabase
from security import hash_password
from models.responsaveis import ResponsavelCreate, ResponsavelResponse

router = APIRouter(prefix="/responsaveis", tags=["Responsáveis"])

@router.post("", response_model=ResponsavelResponse)
def criar_responsavel(resp: ResponsavelCreate):
    novo = resp.model_dump() if hasattr(resp, "model_dump") else resp.dict()
    if novo.get("senha"):
        novo["senha"] = hash_password(novo["senha"])
    if novo.get("email"):
        novo["email"] = novo["email"].lower()
        
    res = supabase.table("responsavel").insert(novo).execute()
    return res.data[0]

@router.get("", response_model=List[ResponsavelResponse])
def listar_responsaveis():
    res = supabase.table("responsavel").select("*").execute()
    return res.data or []

@router.put("/{id_responsavel}")
def atualizar_responsavel(id_responsavel: int, resp: ResponsavelCreate):
    dados = resp.model_dump(exclude_unset=True) if hasattr(resp, "model_dump") else resp.dict(exclude_unset=True)
    if dados.get("senha"):
        dados["senha"] = hash_password(dados["senha"])
    if dados.get("email"):
        dados["email"] = dados["email"].lower()
        
    res = supabase.table("responsavel").update(dados).eq("id_responsavel", id_responsavel).execute()
    return res.data or {}

@router.delete("/{id_responsavel}")
def deletar_responsavel(id_responsavel: int):
    res = supabase.table("responsavel").delete().eq("id_responsavel", id_responsavel).execute()
    return {"message": "Responsável excluído com sucesso", "data": res.data}