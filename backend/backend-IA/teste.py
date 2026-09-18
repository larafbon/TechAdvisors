#importação
import csv
import pathlib from Path

#busca de csv

CAMINHO = "../TechAdivisors/database/dados.csv"
import pandas as pd

def carregar_dados():
    dados = pd.read_csv(CAMINHO, sep=";")
    print("dados carregado com sucesso")
    return dados






def main():
    
    
    
    if __name__ == __main__:
        main()
