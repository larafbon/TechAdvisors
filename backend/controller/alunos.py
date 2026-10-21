from fastapi import APIRouter
from typing import List, Optional
from database import supabase
from security import hash_password
from models.alunos import AlunoCreate, AlunoResponse

router = APIRouter(prefix="/alunos", tags=["Alunos"])

@router.post("", response_model=AlunoResponse)
def criar_aluno(aluno: AlunoCreate):
    dados = aluno.model_dump() if hasattr(aluno, "model_dump") else aluno.dict()
    dados["data_nascimento"] = str(dados["data_nascimento"])
    if dados.get("email"):
        dados["email"] = dados["email"].lower()
    if dados.get("senha"):
        dados["senha"] = hash_password(dados["senha"])
        
    res = supabase.table("aluno").insert(dados).execute()
    return res.data[0]

@router.get("", response_model=List[AlunoResponse])
def listar_alunos(id_turma: Optional[int] = None, id_responsavel: Optional[int] = None):
    query = supabase.table("aluno").select("*")
    if id_turma:
        query = query.eq("id_turma", id_turma)
    if id_responsavel:
        query = query.eq("id_responsavel", id_responsavel)
    res = query.execute()
    return res.data or []

@router.put("/{id_aluno}")
def atualizar_aluno(id_aluno: int, aluno: AlunoCreate):
    dados = aluno.model_dump() if hasattr(aluno, "model_dump") else aluno.dict()
    dados["data_nascimento"] = str(dados["data_nascimento"])
    if dados.get("email"):
        dados["email"] = dados["email"].lower()
    if dados.get("senha"):
        dados["senha"] = hash_password(dados["senha"])
    else:
        dados.pop("senha", None)
        
    res = supabase.table("aluno").update(dados).eq("id_aluno", id_aluno).execute()
    return res.data or {}

@router.delete("/{id_aluno}")
def deletar_aluno(id_aluno: int):
    res = supabase.table("aluno").delete().eq("id_aluno", id_aluno).execute()
    return {"message": "Aluno excluído com sucesso", "data": res.data}