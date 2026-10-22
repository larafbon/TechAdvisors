from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Importação de todos os controllers
from controller import (
    auth,
    professores,
    responsaveis,
    tipos_deficiencia,
    niveis_suporte,
    turmas,
    alunos,
    alunos_deficiencia,
    config_acessibilidade,
    tipos_atividade,
    atividades,
    recursos_acessibilidade,
    atividade_recurso,
    respostas,
    resposta_recurso,
    analise_ia
)

app = FastAPI(
    title="Tech Advisors API",
    version="4.0.0",
    description="API Completa com suporte total a 15 tabelas."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registo de todos os roteadores
app.include_router(auth.router)
app.include_router(professores.router)
app.include_router(responsaveis.router)
app.include_router(tipos_deficiencia.router)
app.include_router(niveis_suporte.router)
app.include_router(turmas.router)
app.include_router(alunos.router)
app.include_router(alunos_deficiencia.router)
app.include_router(config_acessibilidade.router)
app.include_router(tipos_atividade.router)
app.include_router(atividades.router)
app.include_router(recursos_acessibilidade.router)
app.include_router(atividade_recurso.router)
app.include_router(respostas.router)
app.include_router(resposta_recurso.router)
app.include_router(analise_ia.router)

@app.get("/")
def root():
    return {"message": "API Educa Inclui rodando com sucesso!"}