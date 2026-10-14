## 1. Pergunta da Aula
> **O que alguém envolvido no problema precisa conseguir descobrir consultando os dados?**

Professores, coordenadores e a própria aplicação (via API/IA) precisam extrair respostas estratégicas da base de dados: quais preferências de acessibilidade um aluno possui, qual o nível de suporte exigido por turma, o histórico de respostas enviadas com os diagnósticos gerados pelos LLMs e o nível de engajamento com os recursos adaptativos.

---

## 2. Formulando Perguntas Reais do Negócio Antes do SQL

Antes da escrita das consultas em DQL, a equipe mapeou 5 perguntas fundamentais do sistema:

1. **[Interface/Aluno]:** *"Quais são os dados cadastrais e as preferências ativas de acessibilidade do estudante para adaptar a interface de aprendizagem?"*
2. **[Coordenação/Docente]:** *"Quais alunos estão matriculados em uma determinada turma e quais são suas deficiências e níveis de suporte requeridos?"*
3. **[Módulo de IA/Backend]:** *"Qual foi o desempenho do aluno nas atividades e quais foram as análises e sugestões geradas pelos modelos de IA para cada resposta?"*
4. **[Métricas/Pedagógico]:** *"Quais recursos de acessibilidade (Ex: TTS, Fonte para Dislexia) foram mais acionados pelos estudantes nas respostas entregues?"*
5. **[Acompanhamento Docente]:** *"Qual a média de notas obtida por aluno nas atividades adaptadas, considerando apenas submissões já avaliadas?"*

