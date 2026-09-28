# Resultados das Consultas SQL (DQL) - Aula 11

## Pergunta 1: Preferências de Acessibilidade do Aluno
> **Contexto:** Identificação das configurações de interface adaptativa para o estudante selecionado.

| id_aluno | nome_aluno | matricula | deficiencia_principal | nivel_suporte | preferencia_audio | preferencia_visual | preferencia_simplificado | outras_configuracoes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | Lucas Silva | MAT202601 | TDAH | LEVE | false | false | true | Tamanho de fonte: 18px |

---

## Pergunta 2: Alunos Matriculados na Turma
> **Contexto:** Listagem de estudantes matriculados em uma turma específica com seus respectivos suportes pedagógicos.

| codigo_turma | nome_turma | disciplina | professor_responsavel | nome_aluno | matricula | deficiencia | nivel_suporte |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TURMA9A | 9º Ano A - Lingua Portuguesa | Lingua Portuguesa | Prof. Ana Beatriz Nogueira | Beatriz Santos | MAT202602 | DISLEXIA | MODERADO |
| TURMA9A | 9º Ano A - Lingua Portuguesa | Lingua Portuguesa | Prof. Ana Beatriz Nogueira | Lucas Silva | MAT202601 | TDAH | LEVE |

---

## Pergunta 3: Desempenho e Recomendações dos Modelos de IA
> **Contexto:** Histórico de submissões dos alunos acompanhado do diagnóstico automático e recomendações docentes gerados pela IA.

| nome_aluno | atividade | tipo_atividade | data_resposta | conteudo_resposta | nota | diagnostico_ia | recomendacao_docente | modelo_utilizado |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Lucas Silva | Interpretacao de Texto Inclusiva | Discursiva Adaptada | 2026-09-17 12:22:35.595846 | A ideia principal do texto e a preservacao das florestas tropicais. | 8.50 | Demonstrou boa compreensao global, com pequena dispersao nos detalhes. | Oferecer mapas mentais na proxima avaliacao. | GPT-4o-Mini |
| Beatriz Santos | Interpretacao de Texto Inclusiva | Discursiva Adaptada | 2026-09-17 12:22:35.595846 | O texto fala sobre cuidar das arvores e dos animais. | 9.00 | Respondeu de forma direta, demonstrando excelente sintese do texto. | Manter o uso da Fonte para Dislexia e instrucoes curtas. | GPT-4o-Mini |
| Gabriel Souza | Raciocinio Logico e Geometria | Objetiva Visual | 2026-09-17 12:22:35.595846 | As formas sao o quadrado azul e o triangulo vermelho. | 10.00 | Identificou corretamente todos os elementos visuais pedidos. | Incentivar atividades com maior complexidade de formas. | Claude-3.5-Sonnet |

---

## Pergunta 4: Utilização dos Recursos de Acessibilidade
> **Contexto:** Métricas de engajamento das ferramentas de suporte de acessibilidade acionadas nas respostas.

| recurso_acessibilidade | tipo_midia | total_utilizacoes |
| :--- | :--- | :--- |
| Linguagem Simplificada | texto | 1 |
| Fonte para Dislexia | texto | 1 |
| Sintese de Voz (TTS) | audio | 1 |
| Alto Contraste | imagem | 0 |

---

## Pergunta 5: Desempenho Média por Aluno
> **Contexto:** Média consolidada de notas obtidas nas atividades avaliadas por estudante.

| id_aluno | nome_aluno | total_atividades_entregues | media_notas |
| :--- | :--- | :--- | :--- |
| 3 | Gabriel Souza | 1 | 10.00 |
| 2 | Beatriz Santos | 1 | 9.00 |
| 1 | Lucas Silva | 1 | 8.50 |
