from fastapi import APIRouter
from typing import List, Optional
from database import supabase
from models.alunos_deficiencia import AlunoDeficienciaCreate, AlunoDeficienciaResponse

router = APIRouter(prefix="/alunos-deficiencia", tags=["Aluno Deficiência"])

@router.post("", response_model=AlunoDeficienciaResponse)
def criar_aluno_deficiencia(item: AlunoDeficienciaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("aluno_deficiencia").insert(dados).execute()
    return res.data[0]

@router.get("", response_model=List[AlunoDeficienciaResponse])
def listar_alunos_deficiencia(id_aluno: Optional[int] = None):
    query = supabase.table("aluno_deficiencia").select("*")
    if id_aluno:
        query = query.eq("id_aluno", id_aluno)
    res = query.execute()
    return res.data or []

@router.delete("/{id_aluno_deficiencia}")
def deletar_aluno_deficiencia(id_aluno_deficiencia: int):
    res = supabase.table("aluno_deficiencia").delete().eq("id_aluno_deficiencia", id_aluno_deficiencia).execute()
    return {"message": "Registro excluído", "data": res.data}