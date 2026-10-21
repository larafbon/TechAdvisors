from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
import bcrypt


from database import supabase
from schemas import (
   LoginRequest,
   ProfessorCreate, ProfessorResponse,
   ResponsavelCreate, ResponsavelResponse,
   TipoDeficienciaCreate, TipoDeficienciaResponse,
   NivelSuporteCreate, NivelSuporteResponse,
   TurmaCreate, TurmaResponse,
   AlunoCreate, AlunoResponse,
   AlunoDeficienciaCreate, AlunoDeficienciaResponse,
   ConfigAcessibilidadeCreate, ConfigAcessibilidadeResponse,
   TipoAtividadeCreate, TipoAtividadeResponse,
   AtividadeCreate, AtividadeResponse,
   RecursoAcessibilidadeCreate, RecursoAcessibilidadeResponse,
   AtividadeRecursoCreate,
   RespostaCreate, RespostaResponse,
   RespostaRecursoCreate,
   AnaliseIaCreate, AnaliseIaResponse
)


app = FastAPI(
   title="Educa Inclui API",
   version="4.0.0",
   description="API Completa com 15 tabelas para Gestão Escolar e Inclusão."
)


app.add_middleware(
   CORSMiddleware,
   allow_origins=["*"],
   allow_credentials=True,
   allow_methods=["*"],
   allow_headers=["*"],
)


def hash_password(password: str) -> str:
   return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
   try:
       return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
   except Exception:
       return False




# ==========================================
# AUTENTICAÇÃO (LOGIN ÚNICO)
# ==========================================
@app.post("/login", tags=["Autenticação"])
def login(credentials: LoginRequest):
    email = credentials.email.strip().lower()
    senha = credentials.senha

    # 1. Verificar Professor
    prof_res = supabase.table("professor").select("*").eq("email", email).execute()
    if prof_res.data:
        prof = prof_res.data[0]
        if prof.get("senha") and (verify_password(senha, prof["senha"]) or prof["senha"] == senha):
            return {
                "id": prof["id_professor"],
                "nome": prof["nome"],
                "email": prof["email"],
                "role": "professor"
            }

    # 2. Verificar Responsável
    resp_res = supabase.table("responsavel").select("*").eq("email", email).execute()
    if resp_res.data:
        resp = resp_res.data[0]
        if resp.get("senha") and (verify_password(senha, resp["senha"]) or resp["senha"] == senha):
            return {
                "id": resp["id_responsavel"],
                "nome": resp["nome"],
                "email": resp["email"],
                "role": "responsavel"
            }

    # 3. Verificar Aluno
    aluno_res = supabase.table("aluno").select("*").eq("email", email).execute()
    if aluno_res.data:
        aluno = aluno_res.data[0]
        if aluno.get("senha") and (verify_password(senha, aluno["senha"]) or aluno["senha"] == senha):
            return {
                "id": aluno["id_aluno"],
                "nome": aluno["nome"],
                "email": aluno["email"],
                "role": "aluno"
            }

    raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")


# ==========================================
# 1. PROFESSOR
# ==========================================
@app.post("/professores", response_model=ProfessorResponse, tags=["Professores"])
def criar_professor(prof: ProfessorCreate):
    dados = prof.model_dump() if hasattr(prof, "model_dump") else prof.dict()
    dados["email"] = dados["email"].lower()
    dados["senha"] = hash_password(dados["senha"])
    dados["status"] = dados.get("status") or "ativo"
    
    res = supabase.table("professor").insert(dados).execute()
    return res.data[0]


@app.get("/professores/{id_professor}/disciplinas", tags=["Professores"])
def obter_disciplinas_professor(id_professor: int):
    # Consulta todas as turmas vinculadas ao professor para extrair as disciplinas
    res = supabase.table("turma").select("disciplina, nome_turma, codigo_turma").eq("id_professor", id_professor).execute()
    
    if not res.data:
        return {"id_professor": id_professor, "disciplinas": []}
    
    # Extrai uma lista com as disciplinas sem duplicatas
    disciplinas = list(set([turma["disciplina"] for turma in res.data]))
    return {
        "id_professor": id_professor,
        "disciplinas": disciplinas,
        "turmas": res.data
    }

@app.put("/professores/{id_professor}", tags=["Professores"])
def atualizar_professor(id_professor: int, prof: ProfessorCreate):
    dados = prof.model_dump() if hasattr(prof, "model_dump") else prof.dict()
    dados["email"] = dados["email"].lower()
    if dados.get("senha"):
        dados["senha"] = hash_password(dados["senha"])
    else:
        dados.pop("senha", None)
        
    res = supabase.table("professor").update(dados).eq("id_professor", id_professor).execute()
    return res.data or {}


@app.delete("/professores/{id_professor}", tags=["Professores"])
def deletar_professor(id_professor: int):
    try:
        res = supabase.table("professor").delete().eq("id_professor", id_professor).execute()
        return {"message": "Professor excluído com sucesso."}
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Não é possível excluir este professor pois ele possui turmas cadastradas. Exclua as turmas primeiro."
        )


# ==========================================
# 2. RESPONSÁVEL
# ==========================================
@app.post("/responsaveis", response_model=ResponsavelResponse, tags=["Responsáveis"])
def criar_responsavel(resp: ResponsavelCreate):
    novo = resp.model_dump() if hasattr(resp, "model_dump") else resp.dict()
    if novo.get("senha"):
        novo["senha"] = hash_password(novo["senha"])
    if novo.get("email"):
        novo["email"] = novo["email"].lower()
        
    res = supabase.table("responsavel").insert(novo).execute()
    return res.data[0]


@app.get("/responsaveis", response_model=List[ResponsavelResponse], tags=["Responsáveis"])
def listar_responsaveis():
    res = supabase.table("responsavel").select("*").execute()
    return res.data or []


@app.put("/responsaveis/{id_responsavel}", tags=["Responsáveis"])
def atualizar_responsavel(id_responsavel: int, resp: ResponsavelCreate):
    dados = resp.model_dump(exclude_unset=True) if hasattr(resp, "model_dump") else resp.dict(exclude_unset=True)
    if dados.get("senha"):
        dados["senha"] = hash_password(dados["senha"])
    if dados.get("email"):
        dados["email"] = dados["email"].lower()
        
    res = supabase.table("responsavel").update(dados).eq("id_responsavel", id_responsavel).execute()
    return res.data or {}


@app.delete("/responsaveis/{id_responsavel}", tags=["Responsáveis"])
def deletar_responsavel(id_responsavel: int):
    res = supabase.table("responsavel").delete().eq("id_responsavel", id_responsavel).execute()
    return {"message": "Responsável excluído com sucesso", "data": res.data}


# ==========================================
# 3. TIPO DE DEFICIÊNCIA
# ==========================================
@app.post("/tipos-deficiencia", response_model=TipoDeficienciaResponse, tags=["Tipos de Deficiência"])
def criar_tipo_deficiencia(item: TipoDeficienciaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("tipo_deficiencia").insert(dados).execute()
    return res.data[0]


@app.get("/tipos-deficiencia", response_model=List[TipoDeficienciaResponse], tags=["Tipos de Deficiência"])
def listar_tipos_deficiencia():
    res = supabase.table("tipo_deficiencia").select("*").execute()
    return res.data or []


@app.put("/tipos-deficiencia/{id_tipo_deficiencia}", tags=["Tipos de Deficiência"])
def atualizar_tipo_deficiencia(id_tipo_deficiencia: int, item: TipoDeficienciaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("tipo_deficiencia").update(dados).eq("id_tipo_deficiencia", id_tipo_deficiencia).execute()
    return res.data or {}


@app.delete("/tipos-deficiencia/{id_tipo_deficiencia}", tags=["Tipos de Deficiência"])
def deletar_tipo_deficiencia(id_tipo_deficiencia: int):
    res = supabase.table("tipo_deficiencia").delete().eq("id_tipo_deficiencia", id_tipo_deficiencia).execute()
    return {"message": "Excluído com sucesso", "data": res.data}


# ==========================================
# 4. NÍVEL DE SUPORTE
# ==========================================
@app.post("/niveis-suporte", response_model=NivelSuporteResponse, tags=["Níveis de Suporte"])
def criar_nivel_suporte(item: NivelSuporteCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("nivel_suporte").insert(dados).execute()
    return res.data[0]


@app.get("/niveis-suporte", response_model=List[NivelSuporteResponse], tags=["Níveis de Suporte"])
def listar_niveis_suporte():
    res = supabase.table("nivel_suporte").select("*").execute()
    return res.data or []


@app.put("/niveis-suporte/{id_nivel_suporte}", tags=["Níveis de Suporte"])
def atualizar_nivel_suporte(id_nivel_suporte: int, item: NivelSuporteCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("nivel_suporte").update(dados).eq("id_nivel_suporte", id_nivel_suporte).execute()
    return res.data or {}


@app.delete("/niveis-suporte/{id_nivel_suporte}", tags=["Níveis de Suporte"])
def deletar_nivel_suporte(id_nivel_suporte: int):
    res = supabase.table("nivel_suporte").delete().eq("id_nivel_suporte", id_nivel_suporte).execute()
    return {"message": "Excluído com sucesso", "data": res.data}


# ==========================================
# 5. TURMA
# ==========================================
@app.post("/turmas", response_model=TurmaResponse, tags=["Turmas"])
def criar_turma(turma: TurmaCreate):
    try:
        dados = turma.model_dump() if hasattr(turma, "model_dump") else turma.dict()
        res = supabase.table("turma").insert(dados).execute()
        
        if not res.data:
            raise HTTPException(status_code=400, detail="Não foi possível salvar a turma no Supabase.")
            
        return res.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro interno no servidor: {str(e)}")


@app.get("/turmas", response_model=List[TurmaResponse], tags=["Turmas"])
def listar_turmas(id_professor: Optional[int] = None):
    query = supabase.table("turma").select("*")
    if id_professor:
        query = query.eq("id_professor", id_professor)
    res = query.execute()
    return res.data or []


@app.put("/turmas/{id_turma}", tags=["Turmas"])
def atualizar_turma(id_turma: int, turma: TurmaCreate):
    dados = turma.model_dump() if hasattr(turma, "model_dump") else turma.dict()
    res = supabase.table("turma").update(dados).eq("id_turma", id_turma).execute()
    return res.data or {}


@app.delete("/turmas/{id_turma}", tags=["Turmas"])
def deletar_turma(id_turma: int):
    res = supabase.table("turma").delete().eq("id_turma", id_turma).execute()
    return {"message": "Turma excluída com sucesso", "data": res.data}


# ==========================================
# 6. ALUNO
# ==========================================
@app.post("/alunos", response_model=AlunoResponse, tags=["Alunos"])
def criar_aluno(aluno: AlunoCreate):
    dados = aluno.model_dump() if hasattr(aluno, "model_dump") else aluno.dict()
    dados["data_nascimento"] = str(dados["data_nascimento"])
    if dados.get("email"):
        dados["email"] = dados["email"].lower()
    if dados.get("senha"):
        dados["senha"] = hash_password(dados["senha"])
        
    res = supabase.table("aluno").insert(dados).execute()
    return res.data[0]


@app.get("/alunos", response_model=List[AlunoResponse], tags=["Alunos"])
def listar_alunos(id_turma: Optional[int] = None, id_responsavel: Optional[int] = None):
    query = supabase.table("aluno").select("*")
    if id_turma:
        query = query.eq("id_turma", id_turma)
    if id_responsavel:
        query = query.eq("id_responsavel", id_responsavel)
    res = query.execute()
    return res.data or []


@app.put("/alunos/{id_aluno}", tags=["Alunos"])
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


@app.delete("/alunos/{id_aluno}", tags=["Alunos"])
def deletar_aluno(id_aluno: int):
    res = supabase.table("aluno").delete().eq("id_aluno", id_aluno).execute()
    return {"message": "Aluno excluído com sucesso", "data": res.data}


# ==========================================
# 7. ALUNO DEFICIÊNCIA
# ==========================================
@app.post("/alunos-deficiencia", response_model=AlunoDeficienciaResponse, tags=["Aluno Deficiência"])
def criar_aluno_deficiencia(item: AlunoDeficienciaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("aluno_deficiencia").insert(dados).execute()
    return res.data[0]


@app.get("/alunos-deficiencia", response_model=List[AlunoDeficienciaResponse], tags=["Aluno Deficiência"])
def listar_alunos_deficiencia(id_aluno: Optional[int] = None):
    query = supabase.table("aluno_deficiencia").select("*")
    if id_aluno:
        query = query.eq("id_aluno", id_aluno)
    res = query.execute()
    return res.data or []


@app.delete("/alunos-deficiencia/{id_aluno_deficiencia}", tags=["Aluno Deficiência"])
def deletar_aluno_deficiencia(id_aluno_deficiencia: int):
    res = supabase.table("aluno_deficiencia").delete().eq("id_aluno_deficiencia", id_aluno_deficiencia).execute()
    return {"message": "Registro excluído", "data": res.data}


# ==========================================
# 8. CONFIGURAÇÃO DE ACESSIBILIDADE
# ==========================================
@app.post("/config-acessibilidade", response_model=ConfigAcessibilidadeResponse, tags=["Config. Acessibilidade"])
def criar_config_acessibilidade(item: ConfigAcessibilidadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("config_acessibilidade").insert(dados).execute()
    return res.data[0]


@app.get("/config-acessibilidade/aluno/{id_aluno}", tags=["Config. Acessibilidade"])
def obter_config_aluno(id_aluno: int):
    res = supabase.table("config_acessibilidade").select("*").eq("id_aluno", id_aluno).execute()
    return res.data[0] if res.data else {}


@app.put("/config-acessibilidade/{id_config}", tags=["Config. Acessibilidade"])
def atualizar_config_acessibilidade(id_config: int, item: ConfigAcessibilidadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("config_acessibilidade").update(dados).eq("id_config", id_config).execute()
    return res.data or {}


# ==========================================
# 9. TIPO DE ATIVIDADE
# ==========================================
@app.post("/tipos-atividade", response_model=TipoAtividadeResponse, tags=["Tipos de Atividade"])
def criar_tipo_atividade(item: TipoAtividadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("tipo_atividade").insert(dados).execute()
    return res.data[0]


@app.get("/tipos-atividade", response_model=List[TipoAtividadeResponse], tags=["Tipos de Atividade"])
def listar_tipos_atividade():
    res = supabase.table("tipo_atividade").select("*").execute()
    return res.data or []


@app.put("/tipos-atividade/{id_tipo_atividade}", tags=["Tipos de Atividade"])
def atualizar_tipo_atividade(id_tipo_atividade: int, item: TipoAtividadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("tipo_atividade").update(dados).eq("id_tipo_atividade", id_tipo_atividade).execute()
    return res.data or {}


@app.delete("/tipos-atividade/{id_tipo_atividade}", tags=["Tipos de Atividade"])
def deletar_tipo_atividade(id_tipo_atividade: int):
    res = supabase.table("tipo_atividade").delete().eq("id_tipo_atividade", id_tipo_atividade).execute()
    return {"message": "Excluído com sucesso", "data": res.data}


# ==========================================
# 10. ATIVIDADE
# ==========================================
@app.post("/atividades", response_model=AtividadeResponse, tags=["Atividades"])
def criar_atividade(item: AtividadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    dados["data_criacao"] = str(dados["data_criacao"])
    res = supabase.table("atividade").insert(dados).execute()
    return res.data[0]


@app.get("/atividades", response_model=List[AtividadeResponse], tags=["Atividades"])
def listar_atividades():
    res = supabase.table("atividade").select("*").execute()
    return res.data or []


@app.put("/atividades/{id_atividade}", tags=["Atividades"])
def atualizar_atividade(id_atividade: int, item: AtividadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    dados["data_criacao"] = str(dados["data_criacao"])
    res = supabase.table("atividade").update(dados).eq("id_atividade", id_atividade).execute()
    return res.data or {}


@app.delete("/atividades/{id_atividade}", tags=["Atividades"])
def deletar_atividade(id_atividade: int):
    res = supabase.table("atividade").delete().eq("id_atividade", id_atividade).execute()
    return {"message": "Atividade excluída com sucesso", "data": res.data}


# ==========================================
# 11. RECURSO DE ACESSIBILIDADE
# ==========================================
@app.post("/recursos-acessibilidade", response_model=RecursoAcessibilidadeResponse, tags=["Recursos de Acessibilidade"])
def criar_recurso_acessibilidade(item: RecursoAcessibilidadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("recurso_acessibilidade").insert(dados).execute()
    return res.data[0]


@app.get("/recursos-acessibilidade", response_model=List[RecursoAcessibilidadeResponse], tags=["Recursos de Acessibilidade"])
def listar_recursos_acessibilidade():
    res = supabase.table("recurso_acessibilidade").select("*").execute()
    return res.data or []


@app.put("/recursos-acessibilidade/{id_recurso}", tags=["Recursos de Acessibilidade"])
def atualizar_recurso_acessibilidade(id_recurso: int, item: RecursoAcessibilidadeCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("recurso_acessibilidade").update(dados).eq("id_recurso", id_recurso).execute()
    return res.data or {}


@app.delete("/recursos-acessibilidade/{id_recurso}", tags=["Recursos de Acessibilidade"])
def deletar_recurso_acessibilidade(id_recurso: int):
    res = supabase.table("recurso_acessibilidade").delete().eq("id_recurso", id_recurso).execute()
    return {"message": "Excluído com sucesso", "data": res.data}


# ==========================================
# 12. ATIVIDADE RECURSO
# ==========================================
@app.post("/atividade-recurso", tags=["Atividade Recurso"])
def vincular_atividade_recurso(item: AtividadeRecursoCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("atividade_recurso").insert(dados).execute()
    return res.data[0]


@app.get("/atividade-recurso/{id_atividade}", tags=["Atividade Recurso"])
def listar_recursos_da_atividade(id_atividade: int):
    res = supabase.table("atividade_recurso").select("*, recurso_acessibilidade(*)").eq("id_atividade", id_atividade).execute()
    return res.data or []


@app.delete("/atividade-recurso/{id_atividade}/{id_recurso}", tags=["Atividade Recurso"])
def desvincular_atividade_recurso(id_atividade: int, id_recurso: int):
    res = supabase.table("atividade_recurso").delete().eq("id_atividade", id_atividade).eq("id_recurso", id_recurso).execute()
    return {"message": "Vínculo removido", "data": res.data}


# ==========================================
# 13. RESPOSTA
# ==========================================
@app.post("/respostas", response_model=RespostaResponse, tags=["Respostas"])
def criar_resposta(item: RespostaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    dados["data_resposta"] = str(dados["data_resposta"])
    res = supabase.table("resposta").insert(dados).execute()
    return res.data[0]


@app.get("/respostas", response_model=List[RespostaResponse], tags=["Respostas"])
def listar_respostas(id_aluno: Optional[int] = None, id_atividade: Optional[int] = None):
    query = supabase.table("resposta").select("*")
    if id_aluno:
        query = query.eq("id_aluno", id_aluno)
    if id_atividade:
        query = query.eq("id_atividade", id_atividade)
    res = query.execute()
    return res.data or []


@app.put("/respostas/{id_resposta}", tags=["Respostas"])
def atualizar_resposta(id_resposta: int, item: RespostaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    dados["data_resposta"] = str(dados["data_resposta"])
    res = supabase.table("resposta").update(dados).eq("id_resposta", id_resposta).execute()
    return res.data or {}


@app.delete("/respostas/{id_resposta}", tags=["Respostas"])
def deletar_resposta(id_resposta: int):
    res = supabase.table("resposta").delete().eq("id_resposta", id_resposta).execute()
    return {"message": "Resposta excluída", "data": res.data}


# ==========================================
# 14. RESPOSTA RECURSO
# ==========================================
@app.post("/resposta-recurso", tags=["Resposta Recurso"])
def vincular_resposta_recurso(item: RespostaRecursoCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    res = supabase.table("resposta_recurso").insert(dados).execute()
    return res.data[0]


@app.get("/resposta-recurso/{id_resposta}", tags=["Resposta Recurso"])
def listar_recursos_da_resposta(id_resposta: int):
    res = supabase.table("resposta_recurso").select("*, recurso_acessibilidade(*)").eq("id_resposta", id_resposta).execute()
    return res.data or []


# ==========================================
# 15. ANÁLISE IA
# ==========================================
@app.post("/analise-ia", response_model=AnaliseIaResponse, tags=["Análise IA"])
def criar_analise_ia(item: AnaliseIaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    dados["data_analise"] = str(dados["data_analise"])
    res = supabase.table("analise_ia").insert(dados).execute()
    return res.data[0]


@app.get("/analise-ia/resposta/{id_resposta}", tags=["Análise IA"])
def obter_analise_ia(id_resposta: int):
    res = supabase.table("analise_ia").select("*").eq("id_resposta", id_resposta).execute()
    return res.data or []