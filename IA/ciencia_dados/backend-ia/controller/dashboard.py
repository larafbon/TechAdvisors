"""Rotas que entregam dados para os gráficos do dashboard."""
from fastapi import APIRouter
from analise_dashboard import respostas_por_dia, media_notas_por_dia

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/respostas-por-dia")
def consultar_respostas_por_dia():
    """Quantas respostas distintas foram enviadas em cada dia?"""
    return respostas_por_dia()


@router.get("/media-notas-por-dia")
def consultar_media_notas_por_dia():
    """Qual foi a nota média em cada dia?"""
    return media_notas_por_dia()