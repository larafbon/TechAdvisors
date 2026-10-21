from fastapi import APIRouter
from typing import List
from database import supabase
from models.tipos_deficiencia import TipoDeficienciaCreate, TipoDeficienciaResponse

router = APIRouter(prefix="/tipos-deficiencia", tags=["Tipos de Deficiência"])

@router.post("", response_model=TipoDeficienciaResponse)
def criar_tipo_deficiencia(item: TipoDeficienciaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("tipo_deficiencia").insert(dados).execute()
    return res.data[0]

@router.get("", response_model=List[TipoDeficienciaResponse])
def listar_tipos_deficiencia():
    res = supabase.table("tipo_deficiencia").select("*").execute()
    return res.data or []

@router.put("/{id_tipo_deficiencia}")
def atualizar_tipo_deficiencia(id_tipo_deficiencia: int, item: TipoDeficienciaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("tipo_deficiencia").update(dados).eq("id_tipo_deficiencia", id_tipo_deficiencia).execute()
    return res.data or {}

@router.delete("/{id_tipo_deficiencia}")
def deletar_tipo_deficiencia(id_tipo_deficiencia: int):
    res = supabase.table("tipo_deficiencia").delete().eq("id_tipo_deficiencia", id_tipo_deficiencia).execute()
    return {"message": "Excluído com sucesso", "data": res.data}