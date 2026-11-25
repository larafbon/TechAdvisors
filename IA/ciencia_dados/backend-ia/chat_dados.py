"""Perguntas cadastradas que o banco PostgreSQL responde."""
from analise import (
    resumo,
    por_tipo_deficiencia,
    por_recurso_acessibilidade,
    por_turma,
)
from analise_dashboard import respostas_por_dia, media_notas_por_dia

CONSULTAS = {
    "Qual é o resumo geral das respostas?": resumo,
    "Qual é a nota média dos alunos?": lambda: {"nota_media": resumo()["nota_media"]},
    "Como está o desempenho por tipo de deficiência?": por_tipo_deficiencia,
    "Quais recursos de acessibilidade são mais usados?": por_recurso_acessibilidade,
    "Como está o desempenho por turma?": por_turma,
    "Quantas respostas foram enviadas por dia?": respostas_por_dia,
    "Qual é a nota média por dia?": media_notas_por_dia,
}


def encontrar_pergunta(texto):
    texto = texto.strip().casefold()
    for pergunta in CONSULTAS:
        if pergunta.casefold() == texto:
            return pergunta
    return None


def consultar(pergunta):
    return CONSULTAS[pergunta]()