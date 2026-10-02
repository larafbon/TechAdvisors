from pathlib import Path
import pandas as pd


# ---------------------------------------------------------------------------
# Caminho do CSV (independente do diretório de execução)
# ---------------------------------------------------------------------------
CAMINHO_CSV = Path(__file__).resolve().parent.parent / "database" / "dados.csv"


# ---------------------------------------------------------------------------
# Colunas obrigatórias do CSV autoral
# ---------------------------------------------------------------------------
COLUNAS_OBRIGATORIAS = [
    "id_resposta",
    "id_aluno",
    "nome_completo",
    "tipo_deficiencia",
    "nivel_suporte",
    "id_turma",
    "codigo_turma",
    "serie_ano",
    "disciplina",
    "turno",
    "ano_letivo",
    "id_atividade",
    "titulo",
    "tipo_atividade",
    "data_hora_abertura",
    "data_hora_entrega",
    "nota_maxima",
    "status_atividade",
    "data_hora_envio",
    "tempo_gasto_seg",
    "tentativa",
    "nota_obtida",
    "acertos",
    "erros",
    "status_resposta",
]

COLUNAS_NUMERICAS = [
    "nivel_suporte",
    "ano_letivo",
    "nota_maxima",
    "tempo_gasto_seg",
    "tentativa",
    "nota_obtida",
    "acertos",
    "erros",
]

COLUNAS_INTEIRAS = [
    "nivel_suporte",
    "ano_letivo",
    "tempo_gasto_seg",
    "tentativa",
    "acertos",
    "erros",
]

COLUNAS_DATAS = [
    "data_hora_abertura",
    "data_hora_entrega",
    "data_hora_envio",
]


# ---------------------------------------------------------------------------
# 1. Leitura + validação da fonte
# ---------------------------------------------------------------------------
def ler_dados() -> pd.DataFrame:
    """
    Lê o CSV e valida a estrutura, tipos e regras básicas.

    Levanta ValueError se a fonte estiver inválida.
    Levanta OSError se o arquivo não puder ser aberto.
    """
    df = pd.read_csv(CAMINHO_CSV, encoding="utf-8-sig")

    # 1.1 Colunas obrigatórias presentes
    faltando = set(COLUNAS_OBRIGATORIAS) - set(df.columns)
    if faltando:
        raise ValueError(f"Colunas ausentes no CSV: {sorted(faltando)}")

    # 1.2 Recorta apenas as colunas de interesse (ordem previsível)
    df = df[COLUNAS_OBRIGATORIAS].copy()

    # 1.3 Sem valores ausentes
    if df.empty:
        raise ValueError("O CSV está vazio.")
    if df.isna().any().any():
        colunas_com_nulos = df.columns[df.isna().any()].tolist()
        raise ValueError(f"CSV contém valores ausentes em: {colunas_com_nulos}")

    # 1.4 Conversão de datas
    for coluna in COLUNAS_DATAS:
        df[coluna] = pd.to_datetime(df[coluna], errors="raise")

    # 1.5 Conversão numérica
    for coluna in COLUNAS_NUMERICAS:
        df[coluna] = pd.to_numeric(df[coluna], errors="raise")

    # 1.6 Sem infinitos
    if df[COLUNAS_NUMERICAS].isin([float("inf"), -float("inf")]).any().any():
        raise ValueError("CSV contém valores infinitos.")

    # 1.7 Inteiros onde se espera inteiro
    for coluna in COLUNAS_INTEIRAS:
        if (df[coluna] % 1 != 0).any():
            raise ValueError(f"A coluna '{coluna}' deve conter inteiros.")

    # 1.8 Regras de negócio
    if (df["nota_obtida"] < 0).any():
        raise ValueError("Há notas negativas.")
    if (df["nota_obtida"] > df["nota_maxima"]).any():
        raise ValueError("Há notas acima da nota máxima.")
    if (df["tempo_gasto_seg"] < 0).any():
        raise ValueError("Há tempos negativos.")
    if (df["tentativa"] < 1).any():
        raise ValueError("Tentativa deve ser >= 1.")
    if not df["nivel_suporte"].between(1, 3).all():
        raise ValueError("nivel_suporte deve estar entre 1 e 3.")

    # 1.9 Duplicatas exatas
    if df.duplicated().any():
        raise ValueError("Há linhas idênticas no CSV. Verifique a fonte.")

    # 1.10 Cada id_resposta é única
    if df["id_resposta"].duplicated().any():
        raise ValueError("id_resposta duplicado — cada resposta deve ser única.")

    # 1.11 Uma resposta pertence a um único aluno, atividade e turma
    for coluna in ["id_aluno", "id_atividade", "id_turma"]:
        if (df.groupby("id_resposta")[coluna].nunique() > 1).any():
            raise ValueError(f"Uma resposta tem '{coluna}' conflitante.")

    # 1.12 Envio não pode ser antes da abertura
    if (df["data_hora_envio"] < df["data_hora_abertura"]).any():
        raise ValueError("Há envio anterior à abertura da atividade.")

    return df


# ---------------------------------------------------------------------------
# 2. Estatísticas descritivas (retorno serializável)
# ---------------------------------------------------------------------------
def estatisticas(df: pd.DataFrame, coluna: str) -> dict:
    """Retorna dicionário com estatísticas descritivas da coluna numérica."""
    if coluna not in df.columns:
        raise ValueError(f"Coluna '{coluna}' não existe.")
    if not pd.api.types.is_numeric_dtype(df[coluna]):
        raise ValueError(f"Coluna '{coluna}' não é numérica.")

    serie = df[coluna]
    return {
        "coluna": coluna,
        "contagem": int(serie.count()),
        "media": round(float(serie.mean()), 2),
        "mediana": round(float(serie.median()), 2),
        "moda": float(serie.mode().iloc[0]),
        "minimo": float(serie.min()),
        "maximo": float(serie.max()),
        "amplitude": round(float(serie.max() - serie.min()), 2),
        "variancia": round(float(serie.var()), 2),
        "desvio_padrao": round(float(serie.std()), 2),
    }


# ---------------------------------------------------------------------------
# 3. Agregações
# ---------------------------------------------------------------------------
def agregar(
    df: pd.DataFrame,
    coluna_grupo: str,
    coluna_valor: str,
    operacao: str = "media",
) -> list[dict]:
    """
    Agrupa por `coluna_grupo` e aplica operação em `coluna_valor`.

    operacao: 'soma' | 'contagem' | 'media'
    Retorna lista de dicionários (serializável em JSON).
    """
    if coluna_grupo not in df.columns:
        raise ValueError(f"Coluna de grupo '{coluna_grupo}' não existe.")
    if coluna_valor not in df.columns:
        raise ValueError(f"Coluna de valor '{coluna_valor}' não existe.")

    grupo = df.groupby(coluna_grupo, as_index=False)[coluna_valor]

    if operacao == "soma":
        resultado = grupo.sum()
    elif operacao == "contagem":
        resultado = grupo.count()
    elif operacao == "media":
        resultado = grupo.mean()
    else:
        raise ValueError("Operação deve ser: soma, contagem ou media.")

    resultado[coluna_valor] = resultado[coluna_valor].round(2)
    resultado = resultado.sort_values(coluna_valor, ascending=False)
    return resultado.to_dict(orient="records")


# ---------------------------------------------------------------------------
# 4. Classificação com critério documentado
# ---------------------------------------------------------------------------
# Critério adotado: escala de avaliação escolar brasileira (0 a 10).
#   nota < 5  -> "insuficiente"
#   5 <= nota < 7  -> "regular"
#   7 <= nota < 9  -> "bom"
#   nota >= 9 -> "excelente"
# Esse critério foi escolhido porque as notas do CSV seguem a escala 0–10,
# padrão da educação básica brasileira.
def classificar_nota(valor: float) -> str:
    if valor < 5:
        return "insuficiente"
    if valor < 7:
        return "regular"
    if valor < 9:
        return "bom"
    return "excelente"


def aplicar_classificacao(df: pd.DataFrame, coluna: str = "nota_obtida") -> pd.DataFrame:
    """Adiciona coluna 'classificacao' com base no critério documentado."""
    if coluna not in df.columns:
        raise ValueError(f"Coluna '{coluna}' não existe.")
    df = df.copy()
    df["classificacao"] = df[coluna].apply(classificar_nota)
    return df


def distribuicao_classificacao(df: pd.DataFrame, coluna: str = "nota_obtida") -> list[dict]:
    """Retorna a contagem de respostas por classificação."""
    df_class = aplicar_classificacao(df, coluna)
    tabela = (
        df_class.groupby("classificacao", as_index=False)
        .size()
        .rename(columns={"size": "quantidade"})
    )
    ordem = ["insuficiente", "regular", "bom", "excelente"]
    tabela["classificacao"] = pd.Categorical(
        tabela["classificacao"], categories=ordem, ordered=True
    )
    tabela = tabela.sort_values("classificacao")
    return tabela.to_dict(orient="records")


# ---------------------------------------------------------------------------
# 5. Funções de análise específicas do negócio
# ---------------------------------------------------------------------------
def resumo(df: pd.DataFrame) -> dict:
    """Cartões de resumo do dashboard."""
    return {
        "total_respostas": int(len(df)),
        "total_alunos": int(df["id_aluno"].nunique()),
        "total_turmas": int(df["id_turma"].nunique()),
        "total_atividades": int(df["id_atividade"].nunique()),
        "total_disciplinas": int(df["disciplina"].nunique()),
        "nota_media": round(float(df["nota_obtida"].mean()), 2),
        "nota_mediana": round(float(df["nota_obtida"].median()), 2),
        "tempo_medio_seg": round(float(df["tempo_gasto_seg"].mean()), 2),
        "periodo_inicio": df["data_hora_envio"].min().strftime("%Y-%m-%d"),
        "periodo_fim": df["data_hora_envio"].max().strftime("%Y-%m-%d"),
    }


def por_deficiencia(df: pd.DataFrame) -> list[dict]:
    """Média de notas por tipo de deficiência (agregação principal)."""
    tabela = (
        df.groupby("tipo_deficiencia", as_index=False)
        .agg(
            media_notas=("nota_obtida", "mean"),
            total_respostas=("id_resposta", "count"),
            media_tempo_seg=("tempo_gasto_seg", "mean"),
        )
        .round(2)
        .sort_values("media_notas", ascending=False)
    )
    return tabela.to_dict(orient="records")


def por_disciplina(df: pd.DataFrame) -> list[dict]:
    """Média de notas por disciplina."""
    tabela = (
        df.groupby("disciplina", as_index=False)
        .agg(
            media_notas=("nota_obtida", "mean"),
            total_respostas=("id_resposta", "count"),
        )
        .round(2)
        .sort_values("media_notas", ascending=False)
    )
    return tabela.to_dict(orient="records")


def por_data(df: pd.DataFrame) -> list[dict]:
    """Evolução diária: quantidade de respostas e média de notas."""
    df = df.copy()
    df["dia"] = df["data_hora_envio"].dt.strftime("%Y-%m-%d")
    tabela = (
        df.groupby("dia", as_index=False)
        .agg(
            total_respostas=("id_resposta", "count"),
            media_notas=("nota_obtida", "mean"),
        )
        .round(2)
        .sort_values("dia")
    )
    return tabela.to_dict(orient="records")


# ---------------------------------------------------------------------------
# 6. Execução direta (teste sem API)
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    dados = ler_dados()
    print("Primeiras linhas:")
    print(dados.head())
    print("\nResumo:")
    print(resumo(dados))
    print("\nPor deficiência:")
    print(por_deficiencia(dados))
    print("\nPor disciplina:")
    print(por_disciplina(dados))
    print("\nPor data:")
    print(por_data(dados))
    print("\nDistribuição de classificações:")
    print(distribuicao_classificacao(dados))