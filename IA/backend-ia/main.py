from analise import carregar_dados

dados = carregar_dados()

print("Primeiras linhas:")
print(dados.head())

print("\nColunas:")
print(dados.columns)

print("\nQuantidade de registros:")
print(len(dados))

print("\nInformações:")
dados.info()

from analise import carregar_dados, calcular_estatisticas

dados = carregar_dados()
calcular_estatisticas(dados, "dados.csv") 

from analise import carregar_dados, agregar_dados

dados = carregar_dados()
resultado = agregar_dados(
    dados,
    "NOME_DA_COLUNA_DE_GRUPO",
    "NOME_DA_COLUNA_NUMERICA",
    "soma"
)
print(resultado)

from analise import carregar_dados, aplicar_classificacao

dados = carregar_dados()
dados = aplicar_classificacao(dados, "NOME_DA_COLUNA")
print(dados[["NOME_DA_COLUNA", "classificacao"]].head())

import matplotlib.pyplot as plt

resultado.plot(kind="bar")
plt.title("Resultado por categoria")
plt.xlabel("Categoria")
plt.ylabel("Valor")
plt.tight_layout()
plt.show()

