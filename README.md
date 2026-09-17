# TechAdvisors
Projeto voltado para a personalização de estudos para pessoas com dificuldade na aprendizagem.

! [Diagrama do Banco de Dados](./dados/DER/Capturar.PNG)



---

### Processo de Reconstrução no Supabase

Todo o banco de dados foi construído e validado na plataforma **Supabase (PostgreSQL)**. Para reproduzir a estrutura e os testes a partir deste repositório, basta abrir o **SQL Editor** do Supabase e executar os arquivos da pasta `database/` seguindo rigorosamente esta ordem:

1. **`database/script_ddl.sql` (Estrutura):** Define as **15 tabelas** do sistema, as chaves primárias e estrangeiras e as restrições de integridade.
2. **`database/script_seed.sql` (Carga Inicial):** Popula o banco com os registros de teste, cobrindo alunos, turmas, preferências de acessibilidade e respostas processadas por IA.
3. **`database/script_dql.sql` (Consultas):** Executa os relatórios de validação para conferir os resultados e as métricas do sistema.

---

### Perguntas de Negócio Avaliadas (DQL)

As consultas criadas no script DQL atendem às seguintes análises do projeto:

* **Perfil de Acessibilidade:** Identifica as preferências ativas do estudante para ajuste automático do frontend (áudio, contraste, tamanho de fonte).
* **Gestão de Turma:** Agrupa os alunos por turma e disciplina, exibindo suas necessidades de suporte e diagnósticos cadastrados.
* **Avaliação Automatizada (IA):** Relaciona a resposta enviada pelo aluno com a nota cobrada, o diagnóstico da IA e a recomendação pedagógica enviada ao professor.
* **Métricas de Recursos:** Quantifica o uso dos recursos de acessibilidade ativados nas atividades (como leitores de tela e linguagem simplificada).
* **Desempenho Geral:** Consolida a quantidade de entregas e a média das notas obtidas por cada estudante.

> *As capturas de tela das execuções e os retornos em formato de tabela estão armazenados na pasta `Evidencias/consultas/`.*

---

### Auditoria de Reprodutibilidade

O projeto cumpre integralmente os requisitos de reprodutibilidade. Qualquer pessoa com acesso a este repositório consegue clonar os arquivos e subir a estrutura completa em um ambiente Supabase limpo apenas executando a sequência:

$$\text{DDL} \longrightarrow \text{SEED} \longrightarrow \text{DQL}$$

---

### Fluxo Integrado dos Dados

* **Entrada:** O aluno cadastra suas preferências no painel da aplicação, que grava nas tabelas `aluno` e `config_acessibilidade`.
* **Processamento:** A submissão da atividade gera um registro na tabela `resposta`, acionando a análise enviada para a tabela `analise_ia`.
* **Consulta:** Os relatórios DQL consolidam o uso das ferramentas inclusivas e o desempenho escolar para acompanhamento docente.
