from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from postgrest.exceptions import APIError
from database import supabase
import schemas

app = FastAPI(
    title="API do Projeto Integrador",
    version="1.0.0"
)

# ==========================================
# TRATAMENTO GLOBAL DE ERROS DO SUPABASE
# ==========================================
@app.exception_handler(APIError)
async def supabase_api_error_handler(request: Request, exc: APIError):
    """
    Captura erros de validação do banco (FK inexistente, CHECK constraint, etc.)
    e evita que o servidor retorne Erro 500.
    """
    mensagem_detalhada = exc.message or "Erro de validação ou restrição no banco de dados."
    if exc.details:
        mensagem_detalhada += f" Detalhes: {exc.details}"
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": mensagem_detalhada, "code": exc.code}
    )


@app.get("/")
def inicio():
    return {"mensagem": "API e conexão com Supabase funcionando!"}


# ==========================================
# 1. RESPONSÁVEL
# ==========================================
@app.post("/responsaveis", status_code=status.HTTP_201_CREATED)
def criar_responsavel(responsavel: schemas.ResponsavelCreate):
    if responsavel.cpf:
        busca = supabase.table("responsavel").select("*").eq("cpf", responsavel.cpf).execute()
        if busca.data:
            raise HTTPException(status_code=400, detail="CPF já cadastrado.")

    resposta = supabase.table("responsavel").insert(responsavel.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.get("/responsaveis")
def listar_responsaveis():
    return supabase.table("responsavel").select("*").execute().data


# ==========================================
# 2. TIPO DEFICIÊNCIA
# ==========================================
@app.post("/tipos-deficiencia", status_code=status.HTTP_201_CREATED)
def criar_tipo_deficiencia(tipo: schemas.TipoDeficienciaCreate):
    busca = supabase.table("tipo_deficiencia").select("*").eq("codigo", tipo.codigo).execute()
    if busca.data:
        raise HTTPException(status_code=400, detail="Código de deficiência já existe.")

    resposta = supabase.table("tipo_deficiencia").insert(tipo.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.get("/tipos-deficiencia")
def listar_tipos_deficiencia():
    return supabase.table("tipo_deficiencia").select("*").execute().data


# ==========================================
# 3. NÍVEL DE SUPORTE
# ==========================================
@app.post("/niveis-suporte", status_code=status.HTTP_201_CREATED)
def criar_nivel_suporte(nivel: schemas.NivelSuporteCreate):
    busca = supabase.table("nivel_suporte").select("*").eq("codigo", nivel.codigo).execute()
    if busca.data:
        raise HTTPException(status_code=400, detail="Código de nível de suporte já existe.")

    resposta = supabase.table("nivel_suporte").insert(nivel.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.get("/niveis-suporte")
def listar_niveis_suporte():
    return supabase.table("nivel_suporte").select("*").execute().data


# ==========================================
# 4. PROFESSOR
# ==========================================
@app.post("/professores", status_code=status.HTTP_201_CREATED)
def criar_professor(professor: schemas.ProfessorCreate):
    busca = supabase.table("professor").select("*").eq("email", professor.email).execute()
    if busca.data:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado para outro professor.")

    resposta = supabase.table("professor").insert(professor.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.get("/professores")
def listar_professores():
    return supabase.table("professor").select("*").execute().data


# ==========================================
# 5. TIPO ATIVIDADE
# ==========================================
@app.post("/tipos-atividade", status_code=status.HTTP_201_CREATED)
def criar_tipo_atividade(tipo: schemas.TipoAtividadeCreate):
    resposta = supabase.table("tipo_atividade").insert(tipo.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.get("/tipos-atividade")
def listar_tipos_atividade():
    return supabase.table("tipo_atividade").select("*").execute().data


# ==========================================
# 6. RECURSO ACESSIBILIDADE
# ==========================================
@app.post("/recursos-acessibilidade", status_code=status.HTTP_201_CREATED)
def criar_recurso_acessibilidade(recurso: schemas.RecursoAcessibilidadeCreate):
    resposta = supabase.table("recurso_acessibilidade").insert(recurso.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.get("/recursos-acessibilidade")
def listar_recursos_acessibilidade():
    return supabase.table("recurso_acessibilidade").select("*").execute().data


# ==========================================
# 7. TURMA
# ==========================================
@app.post("/turmas", status_code=status.HTTP_201_CREATED)
def criar_turma(turma: schemas.TurmaCreate):
    busca = supabase.table("turma").select("*").eq("codigo_turma", turma.codigo_turma).execute()
    if busca.data:
        raise HTTPException(status_code=400, detail="Código de turma já cadastrado.")

    resposta = supabase.table("turma").insert(turma.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.get("/turmas")
def listar_turmas():
    return supabase.table("turma").select("*, professor(*)").execute().data


# ==========================================
# 8. ALUNO
# ==========================================
@app.post("/alunos", status_code=status.HTTP_201_CREATED)
def criar_aluno(aluno: schemas.AlunoCreate):
    busca = supabase.table("aluno").select("*").eq("matricula", aluno.matricula).execute()
    if busca.data:
        raise HTTPException(status_code=400, detail="Matrícula já cadastrada.")

    # model_dump(mode="json") já converte date/datetime para string automaticamente
    dados = aluno.model_dump(mode="json")

    resposta = supabase.table("aluno").insert(dados).execute()
    return resposta.data[0]

@app.get("/alunos")
def listar_alunos():
    return supabase.table("aluno").select("*, responsavel(*), turma(*), nivel_suporte(*), tipo_deficiencia(*)").execute().data


# ==========================================
# 9. ATIVIDADE
# ==========================================
@app.post("/atividades", status_code=status.HTTP_201_CREATED)
def criar_atividade(atividade: schemas.AtividadeCreate):
    resposta = supabase.table("atividade").insert(atividade.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.get("/atividades")
def listar_atividades():
    return supabase.table("atividade").select("*, tipo_atividade(*)").execute().data


# ==========================================
# 10. CONFIGURAÇÕES DE ACESSIBILIDADE
# ==========================================
@app.post("/config-acessibilidade", status_code=status.HTTP_201_CREATED)
def criar_config_acessibilidade(config: schemas.ConfigAcessibilidadeCreate):
    resposta = supabase.table("config_acessibilidade").insert(config.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.get("/config-acessibilidade")
def listar_config_acessibilidade():
    return supabase.table("config_acessibilidade").select("*, aluno(*)").execute().data


# ==========================================
# 11. RESPOSTA
# ==========================================
@app.post("/respostas", status_code=status.HTTP_201_CREATED)
def criar_resposta(resp: schemas.RespostaCreate):
    resposta = supabase.table("resposta").insert(resp.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.get("/respostas")
def listar_respostas():
    return supabase.table("resposta").select("*, aluno(*), atividade(*)").execute().data


# ==========================================
# 12. ANÁLISE IA
# ==========================================
@app.post("/analise-ia", status_code=status.HTTP_201_CREATED)
def criar_analise_ia(analise: schemas.AnaliseIaCreate):
    resposta = supabase.table("analise_ia").insert(analise.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.get("/analise-ia")
def listar_analise_ia():
    return supabase.table("analise_ia").select("*, resposta(*)").execute().data


# ==========================================
# 13. TABELAS DE JUNÇÃO (N:M)
# ==========================================
@app.post("/aluno-deficiencia", status_code=status.HTTP_201_CREATED)
def vincular_aluno_deficiencia(item: schemas.AlunoDeficienciaCreate):
    resposta = supabase.table("aluno_deficiencia").insert(item.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.post("/atividade-recurso", status_code=status.HTTP_201_CREATED)
def vincular_atividade_recurso(item: schemas.AtividadeRecursoCreate):
    resposta = supabase.table("atividade_recurso").insert(item.model_dump(mode="json")).execute()
    return resposta.data[0]

@app.post("/resposta-recurso", status_code=status.HTTP_201_CREATED)
def vincular_resposta_recurso(item: schemas.RespostaRecursoCreate):
    resposta = supabase.table("resposta_recurso").insert(item.model_dump(mode="json")).execute()
    return resposta.data[0]
