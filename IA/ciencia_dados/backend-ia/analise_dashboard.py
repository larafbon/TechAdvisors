"""Análises por dia para os gráficos do dashboard."""
from decimal import Decimal, InvalidOperation

from analise import ler_dados


def carregar_dados_dashboard():
    """Reaproveita ler_dados e adiciona colunas seguras para agrupar por dia."""
    dados = ler_dados()

    segundos = []
    for valor in dados["tempo_gasto_seg"]:
        try:
            numero = Decimal(str(valor))
            if not numero.is_finite() or numero < 0:
                raise ValueError("tempo_gasto_seg deve ser finito e não negativo.")
            if numero != numero.to_integral_value():
                raise ValueError("tempo_gasto_seg deve ser inteiro (segundos).")
            segundos.append(int(numero))
        except InvalidOperation as erro:
            raise ValueError("tempo_gasto_seg deve ser numérico.") from erro

    dados = dados.copy()
    dados["tempo_gasto_seg"] = segundos
    dados["data_envio"] = dados["data_hora_envio"].dt.strftime("%Y-%m-%d")

    if (dados.groupby("id_resposta")["data_envio"].nunique() > 1).any():
        raise ValueError("Uma resposta possui mais de uma data.")

    return dados


def respostas_por_dia():
    """Quantas respostas distintas foram enviadas em cada dia?"""
    dados = carregar_dados_dashboard()
    totais = dados.groupby("data_envio")["id_resposta"].nunique()
    return [
        {"data": data, "total_respostas": int(total)}
        for data, total in totais.sort_index().items()
    ]


def tempo_total_por_dia():
    """Quantos segundos totais foram gastos em atividades por dia?"""
    dados = carregar_dados_dashboard()
    totais = dados.groupby("data_envio")["tempo_gasto_seg"].sum()
    return [
        {"data": data, "tempo_total_segundos": int(total)}
        for data, total in totais.sort_index().items()
    ]