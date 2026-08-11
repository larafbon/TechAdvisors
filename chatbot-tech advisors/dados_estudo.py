from dataclasses import dataclass, field


@dataclass
class PerfilAluno:
    nome: str
    nivel: str

    preferencias: list[str] = field(default_factory=list)

    adaptacoes: list[str] = field(default_factory=list)

    dificuldades: dict[str, int] = field(default_factory=dict)

    progresso: dict[str, int] = field(default_factory=dict)

    atividades: list[dict] = field(default_factory=list)

    cronograma: list[dict] = field(default_factory=list)


def carregar_aluno():

    return PerfilAluno(

        nome="Aluno",

        nivel="Ensino Fundamental II",

        preferencias=[
            "explicações simples",
            "exemplos práticos",
            "resumos",
            "mapas mentais",
            "flashcards"
        ],

        adaptacoes=[
            "explicações em linguagem simples",
            "divisão de tarefas grandes em etapas",
            "pausas entre blocos de estudo",
            "redução de informações visuais desnecessárias"
        ],

        dificuldades={
            "Matemática": 8,
            "Inglês": 7,
            "Ciências": 6,
            "Português": 5,
            "História": 4
        },

        progresso={
            "Matemática": 65,
            "Inglês": 40,
            "Ciências": 55,
            "Português": 82,
            "História": 90
        },

        atividades=[
            {
                "materia": "Matemática",
                "atividade": "Equações do 2º grau",
                "status": "pendente"
            },

            {
                "materia": "Ciências",
                "atividade": "Revisão de células",
                "status": "pendente"
            },

            {
                "materia": "História",
                "atividade": "Revolução Russa",
                "status": "concluída"
            }
        ],

        cronograma=[
            {
                "dia": "Hoje",
                "materia": "Matemática",
                "tempo": 25,
                "atividade": "Equações do 2º grau"
            },

            {
                "dia": "Hoje",
                "materia": "Ciências",
                "tempo": 20,
                "atividade": "Revisão de células"
            }
        ]
    )


class AnalisadorEstudos:

    def __init__(self, aluno):

        self.aluno = aluno


    def cadastro_completo(self):

        campos = [
            self.aluno.nome,
            self.aluno.nivel,
            self.aluno.preferencias,
            self.aluno.adaptacoes
        ]

        return all(campos)


    def adaptacoes_ativas(self):

        return self.aluno.adaptacoes


    def dificuldades(self):

        return self.aluno.dificuldades


    def proxima_atividade(self):

        for atividade in self.aluno.atividades:

            if atividade["status"] == "pendente":

                return atividade

        return None


    def estudar_hoje(self):

        return self.aluno.cronograma


    def tempo_estudo(self):

        return sum(
            item["tempo"]
            for item in self.aluno.cronograma
        )


    def materias_atrasadas(self):

        return [
            materia
            for materia, progresso
            in self.aluno.progresso.items()
            if progresso < 60
        ]


    def conteudos_faltantes(self):

        return {
            materia: 100 - progresso
            for materia, progresso
            in self.aluno.progresso.items()
            if progresso < 100
        }


    def progresso_total(self):

        valores = list(
            self.aluno.progresso.values()
        )

        if not valores:

            return 0

        return round(
            sum(valores) / len(valores)
        )


    def melhores_materias(self):

        return sorted(
            self.aluno.progresso.items(),
            key=lambda x: x[1],
            reverse=True
        )


    def maiores_dificuldades(self):

        return sorted(
            self.aluno.dificuldades.items(),
            key=lambda x: x[1],
            reverse=True
        )