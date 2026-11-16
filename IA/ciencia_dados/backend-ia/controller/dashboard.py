"""Rotas que entregam dados para os gráficos do dashboard."""
from fastapi import APIRouter

from analise_dashboard import respostas_por_dia, tempo_total_por_dia

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/respostas-por-dia")
def consultar_respostas_por_dia():
    """Quantas respostas distintas foram enviadas em cada dia?"""
    return respostas_por_dia()


@router.get("/tempo-total-por-dia")
def consultar_tempo_total_por_dia():
    """Quantos segundos totais foram gastos em atividades por dia?"""
    return tempo_total_por_dia()