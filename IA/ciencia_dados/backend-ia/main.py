"""Execute dentro de backend-ia: python -m uvicorn main:app --port 8001 --reload"""
from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware

from analise import (
    resumo,
    por_tipo_deficiencia,
    por_recurso_acessibilidade,
    por_turma,
)
from controller.dashboard import router as dashboard_router
from controller.chat import router as chat_router

app = FastAPI(
    title="TechAdvisors - API de Inteligência",
    description="Consultas analíticas a partir da view no Supabase com explicação via Ollama local.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:3000",
        "http://localhost:3000",
    ],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(dashboard_router)
app.include_router(chat_router)


@app.get("/")
def inicio():
    return {"mensagem": "API de Inteligência TechAdvisors funcionando na porta 8001"}


@app.get("/analise/resumo")
def consultar_resumo():
    return resumo()


@app.get("/analise/deficiencias")
def consultar_deficiencias():
    return por_tipo_deficiencia()


@app.get("/analise/recursos-usados")
def consultar_recursos():
    return por_recurso_acessibilidade()


@app.get("/analise/turmas")
def consultar_turmas():
    return por_turma()


@app.exception_handler(Exception)
async def dados_indisponiveis(request, erro: Exception):
    print("ERRO SUPABASE:", repr(erro))
    return JSONResponse(
        status_code=503,
        content={"detail": f"Erro ao consultar o Supabase: {erro}"},
    )