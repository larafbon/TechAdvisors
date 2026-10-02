#importações
from analise import (
    carregar_dados,
    calcular_estatisticas,
    agregar_dados,
    aplicar_classificacao,
)
import matplotlib.pyplot as plt


def main():
    # 1. Carregar
    dados = carregar_dados()

    # 2. Conhece a fonte
    print("Primeiras linhas:")
    print(dados.head())
    print("\nColunas:")
    print(dados.columns)
    print("\nQuantidade de registros:", len(dados))
    print("\nInformações:")
    dados.info()

    # 3. Estatística
    print("\n=== ESTATÍSTICA: nota_obtida ===")
    calcular_estatisticas(dados, "nota_obtida")

    # 4. Agregação
    print("\n=== NOTAS POR TIPO DE DEFICIÊNCIA ===")
    resultado = agregar_dados(
        dados,
        "tipo_deficiencia",
        "nota_obtida",
        "media"
    )
    print(resultado)

    # 5. Classificação
    print("\n=== CLASSIFICAÇÃO DE NOTAS ===")
    dados = aplicar_classificacao(dados, "nota_obtida")
    print(dados[["nota_obtida", "classificacao"]].head())

    # 6. Visualização
    resultado.plot(kind="bar")
    plt.title("Média de notas por tipo de deficiência")
    plt.xlabel("Tipo de deficiência")
    plt.ylabel("Média de notas")
    plt.tight_layout()
    plt.show()


if __name__ == "__main__":
    main()