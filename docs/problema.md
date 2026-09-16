
## 1. Pergunta da Aula
> **Que dados nosso sistema precisa armazenar para resolver o problema escolhido?**

Para resolver a falta de adaptação pedagógica e acessibilidade no atendimento escolar, o sistema precisa armazenar quatro categorias de dados:

1. **Dados de Identificação e Estrutura Escolar (`aluno`, `responsavel`, `professor`, `turma`):** Registram estudantes, responsáveis, docentes e o vínculo de matrículas em cada disciplina.
2. **Dados de Acessibilidade e Suporte (`config_acessibilidade`, `tipo_deficiencia`, `nivel_suporte`, `recurso_acessibilidade`):** Mapeiam diagnósticos, níveis de apoio necessários, adaptações visuais/auditivas e recursos multimodais (áudios, arquivos legíveis).
3. **Dados Pedagógicos e Avaliativos (`tipo_atividade`, `atividade`, `resposta`):** Controlam tarefas, formatos de entregas, conteúdo submetido e pontuações obtidas.
4. **Dados de Diagnóstico da IA (`analise_ia`):** Armazenam os insights gerados pelos modelos de linguagem a partir do histórico de respostas dos alunos.

---

## 2. O Problema em Três Frases
Alunos neurodivergentes ou com deficiência enfrentam dificuldades de aprendizagem ao receberem conteúdos escolares genéricos sem adaptação visual e pedagógica.
Professores e a equipe escolar encontram desafios para centralizar históricos de notas, diagnósticos de suporte e recursos de acessibilidade em uma única base. Nosso assistente virtual resolve essa dispersão unindo um banco relacional normalizado e Inteligência Artificial para gerar diagnósticos individualizados e adaptações inclusivas.

---

## 3. Cadeia Integrada (Problema → Pessoa → Ação → Dado → Resultado)

* **PROBLEMA:** Dificuldade de acesso a explicações e avaliações escolares adaptadas a necessidades visuais, auditivas e pedagógicas.
* **PESSOA:** Aluno da Educação Básica com necessidade de acessibilidade (como Dislexia, Baixa Visão, TDAH ou Autismo).
* **AÇÃO:** Submeter a resolução de uma atividade adaptada na plataforma.
* **DADO:** Leitura de `aluno`, preferências em `config_acessibilidade`, recursos em `recurso_acessibilidade` e gravação do envio em `resposta`.
* **RESULTADO:** Processamento da submissão pela IA com registro em `analise_ia`, fornecendo diagnósticos e recomendações pedagógicas ao professor.

---

## 4. Teste do Dado Faltante (Atividade Desplugada)

* **Dado Removido:** `preferencia_simplificado` / `preferencia_visual` (na tabela `config_acessibilidade`).
* **Impacto no Sistema:** A IA continua gerando o diagnóstico pedagógico sobre a resposta. No entanto, sem os parâmetros de acessibilidade, a interface exibe o conteúdo no padrão comum. Para um estudante com dislexia ou baixa visão, o texto se torna inacessível, anulando a proposta de inclusão do sistema.

---

## 5. Participação das Funções da Equipe

| Função | Atribuição no Projeto |
| :--- | :--- |
| **Frontend** | Consome as preferências de `config_acessibilidade` para estilizar a interface e renderiza as sugestões geradas em `analise_ia`. |
| **Backend** | Conecta as ações do usuário ao banco e injeta o histórico da tabela `resposta` nos prompts consumidos pela Inteligência Artificial. |
| **Banco de Dados (DS)** | Garante a integridade e normalização em 3FN das 15 tabelas em formato *snake_case* no PostgreSQL/Supabase. |
| **Justificativa Unificada (Todos)** | A equipe inteira valida a necessidade de cada uma das 15 tabelas, eliminando redundâncias de dados e otimizando a integração. |




