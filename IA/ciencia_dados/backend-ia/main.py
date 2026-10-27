from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd

from analise import (
    ler_dados, resumo, por_aluno, por_tipo_deficiencia,
    por_atividade, por_recursos_usados, por_data, alunos_em_risco,
)

app = FastAPI(title='Personalização de Estudos • Neurodivergência')

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_methods=["GET"],
    allow_headers=["Content-Type"],
)


def carregar_dados():
    try:
        return ler_dados()
    except (OSError, UnicodeError) as erro:
        raise HTTPException(
            status_code=503,
            detail='Não foi possível abrir database/dados.csv.',
        ) from erro
    except (ValueError, pd.errors.ParserError) as erro:
        raise HTTPException(
            status_code=422,
            detail=f'CSV inválido: {erro}',
        ) from erro


@app.get('/')
def inicio():
    return {'mensagem': 'Backend de personalização de estudos funcionando'}


@app.get('/analise/resumo')
def consultar_resumo():
    return resumo(carregar_dados())


@app.get('/analise/alunos')
def consultar_alunos():
    return por_aluno(carregar_dados())


@app.get('/analise/deficiencias')
def consultar_deficiencias():
    return por_tipo_deficiencia(carregar_dados())


@app.get('/analise/atividades')
def consultar_atividades():
    return por_atividade(carregar_dados())


@app.get('/analise/recursos-usados')
def consultar_recursos():
    return por_recursos_usados(carregar_dados())


@app.get('/analise/datas')
def consultar_datas():
    return por_data(carregar_dados())


@app.get('/analise/risco/{nivel}')
def consultar_risco(nivel: str):
    if nivel not in ('baixo', 'medio', 'alto'):
        raise HTTPException(
            status_code=400,
            detail='Nível deve ser baixo, medio ou alto.',
        )
    return alunos_em_risco(carregar_dados(), nivel)
