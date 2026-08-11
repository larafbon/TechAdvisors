from flask import (
    Flask,
    render_template,
    request,
    jsonify
)

from dados_estudo import (
    carregar_aluno,
    AnalisadorEstudos
)

from cliente_ollama import (
    perguntar_ao_modelo,
    servidor_disponivel,
    ErroOllama
)


app = Flask(__name__)


# ==========================================
# DADOS DO ALUNO
# ==========================================

aluno = carregar_aluno()

analisador = AnalisadorEstudos(aluno)


# ==========================================
# PROMPT DO CHATBOT
# ==========================================

PROMPT_SISTEMA = """

Você é o Estudo Adaptado, um chatbot educacional
para personalização de estudos.

Seu objetivo é ajudar estudantes a:

- organizar estudos;
- compreender matérias;
- revisar conteúdos;
- criar resumos;
- criar flashcards;
- dividir conteúdos grandes;
- organizar o tempo;
- acompanhar o progresso;
- entender suas dificuldades;
- adaptar a forma de estudar.

REGRAS:

1. Responda sempre em português do Brasil.

2. Seja claro, respeitoso e objetivo.

3. Utilize os dados fornecidos pelo sistema.

4. Nunca invente informações sobre o estudante.

5. Não faça diagnósticos médicos ou psicológicos.

6. Não presuma nenhuma condição do estudante.

7. Divida conteúdos complexos em etapas menores.

8. Use linguagem simples quando o estudante pedir.

9. Quando apropriado, ofereça:

- resumos;
- mapas mentais;
- flashcards;
- exemplos;
- exercícios;
- explicações passo a passo.

10. Se o estudante perder o foco, ofereça estratégias
simples para retomar a atividade.

11. Respeite o ritmo do estudante.

12. Não trate uma única técnica como obrigatória.

13. Incentive autonomia e flexibilidade.

14. Se uma informação não estiver nos dados,
diga que ela não está disponível.

"""


# ==========================================
# ROTEADOR
# ==========================================

def roteador_de_intencao(pergunta):

    p = pergunta.lower()


    # CADASTRO

    if "cadastro" in p:

        completo = analisador.cadastro_completo()

        if completo:

            return "O cadastro do aluno está completo."

        return "O cadastro do aluno está incompleto."


    # ADAPTAÇÕES

    if "adaptação" in p or "adaptações" in p:

        adaptacoes = analisador.adaptacoes_ativas()

        return (
            "ADAPTAÇÕES ATIVAS:\n"
            + "\n".join(
                "- " + item
                for item in adaptacoes
            )
        )


    # DIFICULDADES

    if "nível de dificuldade" in p:

        dificuldades = analisador.dificuldades()

        return (
            "NÍVEL DE DIFICULDADE:\n"
            + "\n".join(
                f"- {materia}: {nivel}/10"
                for materia, nivel
                in dificuldades.items()
            )
        )


    # PRÓXIMA ATIVIDADE

    if (
        "próxima atividade" in p
        or "proxima atividade" in p
    ):

        atividade = analisador.proxima_atividade()

        if atividade is None:

            return "Não existem atividades pendentes."

        return f"""
PRÓXIMA ATIVIDADE:

Matéria: {atividade["materia"]}

Atividade: {atividade["atividade"]}

Status: {atividade["status"]}
"""


    # O QUE ESTUDAR HOJE

    if (
        "o que devo estudar" in p
        or "estudar hoje" in p
    ):

        atividades = analisador.estudar_hoje()

        return (
            "PLANO DE ESTUDO DE HOJE:\n"
            + "\n".join(
                f'- {item["materia"]}: '
                f'{item["atividade"]} '
                f'({item["tempo"]} minutos)'
                for item in atividades
            )
        )


    # TEMPO

    if "quanto tempo devo estudar" in p:

        tempo = analisador.tempo_estudo()

        return (
            f"O tempo planejado para hoje "
            f"é de {tempo} minutos."
        )


    # MATÉRIAS ATRASADAS

    if (
        "matéria está atrasada" in p
        or "matérias estão atrasadas" in p
    ):

        materias = analisador.materias_atrasadas()

        if not materias:

            return "Nenhuma matéria está atrasada."

        return (
            "MATÉRIAS COM MENOR PROGRESSO:\n"
            + "\n".join(
                "- " + materia
                for materia in materias
            )
        )


    # CONTEÚDOS FALTANTES

    if "conteúdos ainda faltam" in p:

        faltantes = analisador.conteudos_faltantes()

        return (
            "CONTEÚDOS RESTANTES:\n"
            + "\n".join(
                f"- {materia}: "
                f"{porcentagem}% restante"
                for materia, porcentagem
                in faltantes.items()
            )
        )


    # PROGRESSO

    if "quanto já concluí" in p:

        progresso = analisador.progresso_total()

        return (
            f"O progresso médio atual é "
            f"de {progresso}%."
        )


    # MELHORES MATÉRIAS

    if "em quais matérias estou melhor" in p:

        materias = analisador.melhores_materias()

        return (
            "PROGRESSO NAS MATÉRIAS:\n"
            + "\n".join(
                f"- {materia}: {progresso}%"
                for materia, progresso
                in materias
            )
        )


    # MAIOR DIFICULDADE

    if "onde tenho mais dificuldade" in p:

        materias = analisador.maiores_dificuldades()

        return (
            "MAIORES DIFICULDADES:\n"
            + "\n".join(
                f"- {materia}: nível {nivel}/10"
                for materia, nivel
                in materias
            )
        )


    # EXPLICAÇÃO SIMPLES

    if (
        "forma simples" in p
        or "palavras mais fáceis" in p
        or "10 anos" in p
    ):

        return """

MODO DE EXPLICAÇÃO SIMPLIFICADA:

Use:

- frases curtas;
- palavras simples;
- exemplos do cotidiano;
- comparações;
- poucos conceitos por vez.

"""


    # RESUMO

    if "resuma" in p or "resumo" in p:

        return """

MODO RESUMO:

Organize a resposta em:

1. Ideia principal
2. Conceitos importantes
3. Exemplos
4. Conclusão

"""


    # FLASHCARDS

    if "flashcards" in p or "flashcard" in p:

        return """

MODO FLASHCARDS:

Crie cartões no formato:

PERGUNTA:
...

RESPOSTA:
...

Faça perguntas curtas e objetivas.

"""


    # PASSO A PASSO

    if (
        "cada etapa" in p
        or "passo a passo" in p
    ):

        return """

MODO PASSO A PASSO:

Explique uma etapa por vez.

Não pule etapas importantes.

"""


    # REVISÃO

    if (
        "como revisar" in p
        or "revisar melhor" in p
    ):

        return """

MODO REVISÃO:

Sugira estratégias como:

- flashcards;
- perguntas;
- exercícios;
- revisão ativa;
- pequenos blocos de estudo.

"""


    # FOCO

    if (
        "perco o foco" in p
        or "perdi o foco" in p
        or "não consigo focar" in p
    ):

        return """

MODO RETOMADA DE FOCO:

O estudante está relatando dificuldade
para manter a atenção.

Sugira:

- uma tarefa pequena;
- um bloco curto de estudo;
- uma pausa;
- redução de distrações;
- retomada gradual.

"""


    # ORGANIZAÇÃO

    if (
        "rotina de estudos" in p
        or "cronograma" in p
        or "reorganizar" in p
    ):

        return """

MODO ORGANIZAÇÃO:

Considere:

- progresso;
- dificuldades;
- tempo disponível;
- atividades pendentes;
- pausas;
- prioridades.

"""


    # MÉTODO

    if (
        "método de estudo" in p
        or "técnica" in p
    ):

        return """

MODO PERSONALIZAÇÃO:

Considere as preferências do aluno:

- explicações simples;
- exemplos;
- resumos;
- mapas mentais;
- flashcards.

Sugira estratégias flexíveis.

"""


    # CASO NÃO RECONHECIDO

    return ""


# ==========================================
# MONTAR MENSAGENS
# ==========================================

def montar_mensagens(
    pergunta,
    dados_calculados,
    historico
):

    dados_aluno = f"""

NOME:
{aluno.nome}

NÍVEL:
{aluno.nivel}

PREFERÊNCIAS:
{", ".join(aluno.preferencias)}

ADAPTAÇÕES:
{", ".join(aluno.adaptacoes)}

PROGRESSO:
{aluno.progresso}

DIFICULDADES:
{aluno.dificuldades}

"""


    if dados_calculados:

        dados = dados_calculados

    else:

        dados = (
            "Nenhuma intenção específica "
            "foi reconhecida."
        )


    mensagem_usuario = f"""

PERGUNTA DO ESTUDANTE:

{pergunta}


DADOS DO ALUNO:

{dados_aluno}


DADOS CALCULADOS:

{dados}

"""


    mensagens = [

        {
            "role": "system",
            "content": PROMPT_SISTEMA
        }

    ]


    mensagens.extend(
        historico[-6:]
    )


    mensagens.append({

        "role": "user",

        "content": mensagem_usuario

    })


    return mensagens


# ==========================================
# HISTÓRICO
# ==========================================

historico = []


# ==========================================
# PÁGINA PRINCIPAL
# ==========================================

@app.route("/")
def inicio():

    return render_template(
        "index.html",
        aluno=aluno
    )


# ==========================================
# CHAT
# ==========================================

@app.route(
    "/chat",
    methods=["POST"]
)
def chat():

    dados = request.get_json()

    pergunta = dados.get(
        "mensagem",
        ""
    ).strip()


    if not pergunta:

        return jsonify({

            "erro":
            "Digite uma pergunta."

        }), 400


    dados_calculados = \
        roteador_de_intencao(
            pergunta
        )


    mensagens = \
        montar_mensagens(
            pergunta,
            dados_calculados,
            historico
        )


    try:

        resposta = \
            perguntar_ao_modelo(
                mensagens
            )

    except ErroOllama as erro:

        return jsonify({

            "erro": str(erro)

        }), 500


    historico.append({

        "role": "user",

        "content": pergunta

    })


    historico.append({

        "role": "assistant",

        "content": resposta

    })


    return jsonify({

        "resposta": resposta

    })


# ==========================================
# STATUS
# ==========================================

@app.route("/status")
def status():

    return jsonify({

        "ollama":
            servidor_disponivel(),

        "cadastro":
            analisador.cadastro_completo(),

        "progresso":
            analisador.progresso_total()

    })


# ==========================================
# EXECUTAR
# ==========================================

if __name__ == "__main__":

    print()
    print("=" * 60)
    print(" ESTUDO ADAPTADO")
    print(" Chatbot de Personalização de Estudos")
    print("=" * 60)
    print()

    if not servidor_disponivel():

        print(
            "AVISO: Ollama não está rodando."
        )

        print(
            "Execute: ollama serve"
        )

    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )