import pandas as pd
from pathlib import Path

def carregar_dados():
    pasta_projeto = Path(__file__).resolve().parent.parent
    caminho_csv = pasta_projeto / "database" / "dados.csv"
    dados = pd.read_csv(caminho_csv)
    return dados

def calcular_estatisticas(dados, coluna):
    print("Média:", dados[coluna].mean())
    print("Mediana:", dados[coluna].median())
    print("Moda:", dados[coluna].mode().iloc[0])
    print("Mínimo:", dados[coluna].min())
    print("Máximo:", dados[coluna].max())
    print("Amplitude:", dados[coluna].max() - dados[coluna].min())
    print("Variância:", dados[coluna].var())
    print("Desvio padrão:", dados[coluna].std())

def agregar_dados(dados, coluna_grupo, coluna_valor, operacao="soma"):
    grupo = dados.groupby(coluna_grupo)[coluna_valor]

    if operacao == "soma":
        resultado = grupo.sum()
    elif operacao == "contagem":
        resultado = grupo.count()
    elif operacao == "media":
        resultado = grupo.mean()
    else:
        raise ValueError("Operação deve ser: soma, contagem ou media")

    return resultado

def classificar_valor(valor):
    if valor < 50:
        return "baixo"
    elif valor < 100:
        return "médio"
    else:
        return "alto"

def aplicar_classificacao(dados, coluna):
    dados["classificacao"] = dados[coluna].apply(classificar_valor)
    return dados

