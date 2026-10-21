from fastapi import APIRouter, HTTPException
from typing import List
from database import supabase
from security import hash_password
from models.professores import ProfessorCreate, ProfessorResponse

router = APIRouter(prefix="/professores", tags=["Professores"])

@router.post("", response_model=ProfessorResponse)
def criar_professor(prof: ProfessorCreate):
    dados = prof.model_dump() if hasattr(prof, "model_dump") else prof.dict()
    dados["email"] = dados["email"].lower()
    dados["senha"] = hash_password(dados["senha"])
    dados["status"] = dados.get("status") or "ativo"
    
    res = supabase.table("professor").insert(dados).execute()
    return res.data[0]

@router.get("/{id_professor}/disciplinas")
def obter_disciplinas_professor(id_professor: int):
    res = supabase.table("turma").select("disciplina, nome_turma, codigo_turma").eq("id_professor", id_professor).execute()
    if not res.data:
        return {"id_professor": id_professor, "disciplinas": []}
    
    disciplinas = list(set([turma["disciplina"] for turma in res.data]))
    return {"id_professor": id_professor, "disciplinas": disciplinas, "turmas": res.data}

@router.put("/{id_professor}")
def atualizar_professor(id_professor: int, prof: ProfessorCreate):
    dados = prof.model_dump() if hasattr(prof, "model_dump") else prof.dict()
    dados["email"] = dados["email"].lower()
    if dados.get("senha"):
        dados["senha"] = hash_password(dados["senha"])
    else:
        dados.pop("senha", None)
        
    res = supabase.table("professor").update(dados).eq("id_professor", id_professor).execute()
    return res.data or {}

@router.delete("/{id_professor}")
def deletar_professor(id_professor: int):
    try:
        supabase.table("professor").delete().eq("id_professor", id_professor).execute()
        return {"message": "Professor excluído com sucesso."}
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Não é possível excluir este professor pois ele possui turmas cadastradas."
        )