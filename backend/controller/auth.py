from fastapi import APIRouter, HTTPException
from database import supabase
from security import verify_password, hash_password
from models.auth import LoginRequest

router = APIRouter(tags=["Autenticação"])

@router.post("/login")
def login(credentials: LoginRequest):
    email = credentials.email.strip().lower()
    senha = credentials.senha

    # 1. Professor
    prof_res = supabase.table("professor").select("*").eq("email", email).execute()
    if prof_res.data:
        prof = prof_res.data[0]
        senha_db = prof.get("senha") or ""
        if verify_password(senha, senha_db) or senha_db == senha:
            if senha_db == senha:
                supabase.table("professor").update({"senha": hash_password(senha)}).eq("id_professor", prof["id_professor"]).execute()
            return {
                "id": prof["id_professor"],
                "id_professor": prof["id_professor"],
                "nome": prof["nome"],
                "email": prof["email"],
                "role": "professor"
            }

    # 2. Responsável (Administrador)
    resp_res = supabase.table("responsavel").select("*").eq("email", email).execute()
    if resp_res.data:
        resp = resp_res.data[0]
        senha_db = resp.get("senha") or ""
        if verify_password(senha, senha_db) or senha_db == senha:
            if senha_db == senha:
                supabase.table("responsavel").update({"senha": hash_password(senha)}).eq("id_responsavel", resp["id_responsavel"]).execute()
            return {
                "id": resp["id_responsavel"],
                "id_responsavel": resp["id_responsavel"],
                "nome": resp["nome"],
                "email": resp["email"],
                "role": "admin"
            }

    # 3. Aluno (Inclui id_turma para carregar atividades corretamente)
    aluno_res = supabase.table("aluno").select("*").eq("email", email).execute()
    if aluno_res.data:
        aluno = aluno_res.data[0]
        senha_db = aluno.get("senha") or ""
        if verify_password(senha, senha_db) or senha_db == senha:
            if senha_db == senha:
                supabase.table("aluno").update({"senha": hash_password(senha)}).eq("id_aluno", aluno["id_aluno"]).execute()
            return {
                "id": aluno["id_aluno"],
                "id_aluno": aluno["id_aluno"],
                "id_turma": aluno.get("id_turma") or 1,
                "nome": aluno["nome"],
                "email": aluno["email"],
                "role": "aluno"
            }

    raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")