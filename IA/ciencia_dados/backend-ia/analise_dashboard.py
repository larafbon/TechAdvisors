"""Séries diárias para os gráficos do dashboard usando o cliente Supabase."""
from collections import defaultdict
from fonte_supabase import buscar_dados_view


def _agrupar_por_dia():
    linhas = buscar_dados_view()
    dias = defaultdict(dict)
    for r in linhas:
        data_raw = r.get("data_envio")
        id_resp = r.get("id_resposta")
        if data_raw and id_resp is not None:
            dia = str(data_raw)[:10]
            dias[dia][id_resp] = float(r.get("nota") or 0)
    return dias


def respostas_por_dia():
    dias = _agrupar_por_dia()
    return [
        {"data": dia, "total_respostas": len(dias[dia])}
        for dia in sorted(dias.keys())
    ]


def media_notas_por_dia():
    dias = _agrupar_por_dia()
    resultado = []
    for dia in sorted(dias.keys()):
        notas = list(dias[dia].values())
        media = round(sum(notas) / len(notas), 2) if notas else 0.0
        resultado.append({"data": dia, "nota_media": media})
    return resultado