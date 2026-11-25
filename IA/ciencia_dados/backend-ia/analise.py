"""Indicadores da view vw_respostas_analiticas usando o cliente Supabase."""
from collections import defaultdict
from fonte_supabase import buscar_dados_view


def resumo():
    linhas = buscar_dados_view()
    if not linhas:
        return {
            "total_respostas": 0,
            "total_alunos": 0,
            "total_atividades_realizadas": 0,
            "total_turmas": 0,
            "nota_media": 0.0,
            "periodo_inicio": None,
            "periodo_fim": None,
        }

    respostas_unicas = {}
    alunos = set()
    atividades = set()
    turmas = set()
    datas = []

    for r in linhas:
        id_resp = r.get("id_resposta")
        if id_resp is not None and id_resp not in respostas_unicas:
            respostas_unicas[id_resp] = float(r.get("nota") or 0)
        if r.get("id_aluno") is not None:
            alunos.add(r["id_aluno"])
        if r.get("id_atividade") is not None:
            atividades.add(r["id_atividade"])
        if r.get("id_turma") is not None:
            turmas.add(r["id_turma"])
        if r.get("data_envio"):
            datas.append(str(r["data_envio"])[:10])

    notas = list(respostas_unicas.values())
    media = round(sum(notas) / len(notas), 2) if notas else 0.0

    return {
        "total_respostas": len(respostas_unicas),
        "total_alunos": len(alunos),
        "total_atividades_realizadas": len(atividades),
        "total_turmas": len(turmas),
        "nota_media": media,
        "periodo_inicio": min(datas) if datas else None,
        "periodo_fim": max(datas) if datas else None,
    }


def por_tipo_deficiencia():
    linhas = buscar_dados_view()
    grupos = defaultdict(lambda: {"alunos": set(), "respostas": {}})

    for r in linhas:
        tipo = r.get("tipo_deficiencia") or "NAO_INFORMADO"
        if r.get("id_aluno") is not None:
            grupos[tipo]["alunos"].add(r["id_aluno"])
        id_resp = r.get("id_resposta")
        if id_resp is not None:
            grupos[tipo]["respostas"][id_resp] = float(r.get("nota") or 0)

    resultado = []
    for tipo, dados in grupos.items():
        notas = list(dados["respostas"].values())
        media = round(sum(notas) / len(notas), 2) if notas else 0.0
        resultado.append({
            "tipo_deficiencia": tipo,
            "total_alunos": len(dados["alunos"]),
            "total_respostas": len(dados["respostas"]),
            "nota_media": media,
        })

    return sorted(resultado, key=lambda x: x["nota_media"], reverse=True)


def por_recurso_acessibilidade():
    linhas = buscar_dados_view()
    grupos = defaultdict(dict)

    for r in linhas:
        recurso = r.get("recurso_acessibilidade")
        if not recurso:
            continue
        id_resp = r.get("id_resposta")
        if id_resp is not None:
            grupos[recurso][id_resp] = float(r.get("nota") or 0)

    resultado = []
    for recurso, respostas in grupos.items():
        notas = list(respostas.values())
        media = round(sum(notas) / len(notas), 2) if notas else 0.0
        resultado.append({
            "recurso_acessibilidade": recurso,
            "total_respostas": len(respostas),
            "nota_media": media,
        })

    return sorted(resultado, key=lambda x: x["total_respostas"], reverse=True)


def por_turma():
    linhas = buscar_dados_view()
    grupos = defaultdict(lambda: {"nome": "Sem turma", "alunos": set(), "respostas": {}})

    for r in linhas:
        cod = r.get("codigo_turma") or "SEM_TURMA"
        grupos[cod]["nome"] = r.get("nome_turma") or "Sem turma"
        if r.get("id_aluno") is not None:
            grupos[cod]["alunos"].add(r["id_aluno"])
        id_resp = r.get("id_resposta")
        if id_resp is not None:
            grupos[cod]["respostas"][id_resp] = float(r.get("nota") or 0)

    resultado = []
    for cod in sorted(grupos.keys()):
        dados = grupos[cod]
        notas = list(dados["respostas"].values())
        media = round(sum(notas) / len(notas), 2) if notas else 0.0
        resultado.append({
            "codigo_turma": cod,
            "nome_turma": dados["nome"],
            "total_alunos": len(dados["alunos"]),
            "total_respostas": len(dados["respostas"]),
            "nota_media": media,
        })

    return resultado