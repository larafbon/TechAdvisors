# Conjunto de dados de exemplo

dataset = [
    {
        "pergunta": "O que é neurodivergência?",
        "resposta": "Neurodivergência refere-se às diferentes formas de funcionamento do cérebro, como autismo, TDAH e dislexia."
    },
    {
        "pergunta": "Como organizar um plano de estudos?",
        "resposta": "Divida o conteúdo em pequenas etapas, estabeleça horários e faça pausas regulares."
    },
    {
        "pergunta": "Qual a importância das pausas durante o estudo?",
        "resposta": "As pausas ajudam a reduzir a sobrecarga cognitiva e melhoram a concentração."
    },
    {
        "pergunta": "Como adaptar o conteúdo para um estudante com TDAH?",
        "resposta": "Utilize linguagem simples, atividades curtas, exemplos práticos e recursos visuais."
    },
    {
        "pergunta": "O que são flashcards?",
        "resposta": "Flashcards são cartões de perguntas e respostas usados para revisar e memorizar conteúdos."
    }
]

# Exibe o conjunto de dados
for item in dataset:
    print("Pergunta:", item["pergunta"])
    print("Resposta:", item["resposta"])
    print("-" * 50)