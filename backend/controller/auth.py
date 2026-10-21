from fastapi import APIRouter, HTTPException
from database import supabase
from security import verify_password
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
        if prof.get("senha") and (verify_password(senha, prof["senha"]) or prof["senha"] == senha):
            return {"id": prof["id_professor"], "nome": prof["nome"], "email": prof["email"], "role": "professor"}

    # 2. Responsável
    resp_res = supabase.table("responsavel").select("*").eq("email", email).execute()
    if resp_res.data:
        resp = resp_res.data[0]
        if resp.get("senha") and (verify_password(senha, resp["senha"]) or resp["senha"] == senha):
            return {"id": resp["id_responsavel"], "nome": resp["nome"], "email": resp["email"], "role": "responsavel"}

    # 3. Aluno
    aluno_res = supabase.table("aluno").select("*").eq("email", email).execute()
    if aluno_res.data:
        aluno = aluno_res.data[0]
        if aluno.get("senha") and (verify_password(senha, aluno["senha"]) or aluno["senha"] == senha):
            return {"id": aluno["id_aluno"], "nome": aluno["nome"], "email": aluno["email"], "role": "aluno"}

    raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")