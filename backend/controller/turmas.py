from fastapi import APIRouter, HTTPException
from typing import List, Optional
from database import supabase
from models.turmas import TurmaCreate, TurmaResponse

router = APIRouter(prefix="/turmas", tags=["Turmas"])

@router.post("", response_model=TurmaResponse)
def criar_turma(turma: TurmaCreate):
    try:
        dados = turma.model_dump() if hasattr(turma, "model_dump") else turma.dict()
        res = supabase.table("turma").insert(dados).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Não foi possível salvar a turma no Supabase.")
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno no servidor: {str(e)}")

@router.get("", response_model=List[TurmaResponse])
def listar_turmas(id_professor: Optional[int] = None):
    query = supabase.table("turma").select("*")
    if id_professor:
        query = query.eq("id_professor", id_professor)
    res = query.execute()
    return res.data or []

@router.put("/{id_turma}")
def atualizar_turma(id_turma: int, turma: TurmaCreate):
    dados = turma.model_dump() if hasattr(turma, "model_dump") else turma.dict()
    res = supabase.table("turma").update(dados).eq("id_turma", id_turma).execute()
    return res.data or {}

@router.delete("/{id_turma}")
def deletar_turma(id_turma: int):
    res = supabase.table("turma").delete().eq("id_turma", id_turma).execute()
    return {"message": "Turma excluída com sucesso", "data": res.data}