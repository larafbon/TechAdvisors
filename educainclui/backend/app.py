from fastapi import FastAPI, Body, HTTPException
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
app = FastAPI(title="Educa Inclui")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# -------------------------------------------------------------------------
# SIMULAÇÃO DE BANCO DE DADOS (MOCK)
# Enquanto o banco de dados oficial não chega, usamos estas estruturas na memória.
# -------------------------------------------------------------------------

# Tabela Simulada de Quizzes
BANCO_QUIZZES = [
    {
        "id": 1, 
        "materia": "Matemática", 
        "assunto": "Frações e Proporções", 
        "perguntas": [
            {"id_pergunta": 1, "enunciado": "Quanto é 1/2 + 1/4?", "opcoes": ["1/6", "3/4", "2/4", "1/3"], "correta": "3/4"},
            {"id_pergunta": 2, "enunciado": "Se 2 doces custam R$4, quanto custam 4 doces?", "opcoes": ["R$6", "R$7", "R$8", "R$10"], "correta": "R$8"}
        ]
    },
    {
        "id": 2, 
        "materia": "Português", 
        "assunto": "Interpretação de Texto", 
        "perguntas": [
            {"id_pergunta": 1, "enunciado": "Qual o objetivo principal de um texto informativo?", "opcoes": ["Contar uma piada", "Informar um fato", "Vender um produto", "Expressar sentimentos"], "correta": "Informar um fato"}
        ]
    }
]

# Tabela Simulada para Salvar os Resultados obtidos (Histórico de Desempenho)
BANCO_RESULTADOS = []

# -------------------------------------------------------------------------
# CONFIGURAÇÃO DE DIRETÓRIOS (CODESPACES)
# -------------------------------------------------------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
FRONTEND_DIR = os.path.join(PROJECT_DIR, "frontend")
INDEX_FILE = os.path.join(FRONTEND_DIR, "index.html")

app.mount("/frontend", StaticFiles(directory=FRONTEND_DIR), name="frontend")

@app.get("/")
def home():
    return FileResponse(INDEX_FILE)

# -------------------------------------------------------------------------
# ROTAS DA API (Sua parte como desenvolvedora Backend!)
# -------------------------------------------------------------------------

# Rota 1: Listar todos os quizzes disponíveis para o front-end exibir
@app.get("/api/quizzes")
def listar_quizzes():
    return BANCO_QUIZZES


# Rota 2: Buscar um quiz específico pelo ID
@app.get("/api/quizzes/{quiz_id}")
def obter_quiz(quiz_id: int):
    for quiz in BANCO_QUIZZES:
        if quiz["id"] == quiz_id:
            return quiz
    raise HTTPException(status_code=404, detail="Quiz não encontrado")


# Rota 3: Receber as respostas do aluno, calcular a nota e gerar o feedback pedagógico
@app.post("/api/enviar-respostas")
def processar_respostas(dados: dict = Body(...)):
    """
    Espera receber no corpo da requisição:
    {
        "nome_aluno": "Maria Joana",
        "quiz_id": 1,
        "respostas_aluno": {
            "1": "3/4",
            "2": "R$6"
        }
    }
    """
    nome_aluno = dados.get("nome_aluno", "Estudante Anónimo")
    quiz_id = dados.get("quiz_id")
    respostas_aluno = dados.get("respostas_aluno", {})

    # Procurar o quiz correspondente no nosso "banco"
    quiz_atual = None
    for q in BANCO_QUIZZES:
        if q["id"] == quiz_id:
            quiz_atual = q
            break
            
    if not quiz_atual:
        raise HTTPException(status_code=404, detail="Quiz inválido")

    # Calcular pontuação
    total_perguntas = len(quiz_atual["perguntas"])
    acertos = 0

    for pergunta in quiz_atual["perguntas"]:
        id_p = str(pergunta["id_pergunta"])
        resposta_correta = pergunta["correta"]
        # Se o aluno respondeu e a resposta está certa
        if id_p in respostas_aluno and respostas_aluno[id_p] == resposta_correta:
            acertos += 1

    # Nota de 0 a 10
    nota = (acertos / total_perguntas) * 10

    # Lógica de Feedback Pedagógico (O coração do seu projeto!)
    if nota < 6.0:
        sugestao = f"Alerta Pedagógico para {nome_aluno}: O estudante apresentou dificuldades em '{quiz_atual['assunto']}'. Sugere-se intervenção com material de apoio visual e revisão dos conceitos fundamentais."
    elif 6.0 <= nota < 8.0:
        sugestao = f"Acompanhamento para {nome_aluno}: Boa compreensão em '{quiz_atual['assunto']}', mas necessita de exercícios de fixação complementares para consolidar a autonomia."
    else:
        sugestao = f"Excelente Desempenho de {nome_aluno}: Domínio completo de '{quiz_atual['assunto']}'. Recomendado avançar para tópicos de maior complexidade."

    # Guardar o resultado no nosso "banco de dados" temporário
    historico_item = {
        "id_resultado": len(BANCO_RESULTADOS) + 1,
        "aluno": nome_aluno,
        "materia": quiz_atual["materia"],
        "assunto": quiz_atual["assunto"],
        "nota": nota,
        "sugestao_pedagogica": sugestao
    }
    BANCO_RESULTADOS.append(historico_item)

    return historico_item


# Rota 4: Ver o histórico de notas e relatórios pedagógicos (para o painel do Professor)
@app.get("/api/professor/relatorios")
def ver_relatorios():
    return BANCO_RESULTADOS
