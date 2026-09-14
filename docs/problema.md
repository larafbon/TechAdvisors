## 1. Pergunta da Aula
> **Que dados nosso sistema precisa armazenar para resolver o problema escolhido?**

Para resolver a falta de adaptação pedagógica e acessibilidade visual no atendimento escolar, o sistema precisa armazenar três categorias de dados:

1. **Dados de Identificação (`aluno`):** `aluno_cpf`, `aluno_nome`, `aluno_email` e `turma_codigo`. Garantem o reconhecimento do estudante e o vínculo com seu histórico.
2. **Dados de Acessibilidade (`configuracoes_acessibilidade`):** `config_tamanho_fonte`, `config_fonte_dislexia` e `config_reducao_estimulo`. Definem as preferências de leitura e exibição na interface.
3. **Dados Pedagógicos (`pei_plano_individual` e `resposta_atividade`):** `pei_objetivos` e `resposta_nota`. Fornecem o contexto educacional para a Inteligência Artificial ajustar o tom e o nível das explicações.

   ## 2. O Problema em Três Frases
Alunos neurodivergentes ou com deficiência enfrentam dificuldades de aprendizagem ao receberem conteúdos escolares genéricos sem adaptação visual e pedagógica. Professores e a equipe escolar encontram desafios para centralizar históricos de notas e necessidades de acessibilidade em uma única base. Nosso assistente virtual resolve essa dispersão unindo dados estruturados e Inteligência Artificial para gerar respostas personalizadas e inclusivas.

## 3. Cadeia Integrada (Problema → Pessoa → Ação → Dado → Resultado)

* **PROBLEMA:** Dificuldade de acesso a explicações escolares adaptadas a necessidades visuais e pedagógicas.
* **PESSOA:** Aluno do Ensino Médio com necessidade de acessibilidade (como dislexia, baixa visão ou TDAH).
* **AÇÃO:** Enviar uma dúvida ou pergunta sobre uma matéria para o assistente virtual.
* **DADO:** Recuperação de `aluno_cpf`, parâmetros de acessibilidade em `config_` e diretrizes pedagógicas em `pei_`.
* **RESULTADO:** Resposta gerada por IA com linguagem acessível e formatação visual ajustada ao perfil do estudante.

  ## 4. Teste do Dado Faltante (Atividade Desplugada)

* **Dado Removido:** `config_fonte_dislexia` / `config_tamanho_fonte`.
* **Impacto no Sistema:** A IA continua gerando a resposta pedagógica correta sobre a matéria. No entanto, sem os dados de acessibilidade, o texto é exibido no padrão comum. Para um estudante com dislexia ou baixa visão, a leitura se torna inacessível, desfazendo o objetivo principal da plataforma.

## 5. Participação das Funções da Equipe


| **Frontend**  Mapeia os dados de entrada (a dúvida enviada no campo de texto) e os dados de saída (a resposta da IA exibida com o tamanho de fonte e estilo de texto adequados). 
| **Backend** Conecta as ações do usuário às regras do sistema, pegando os parâmetros de perfil no banco para injetar no contexto da IA. 
| **Banco de Dados (DS)**  Identifica e garante a persistência física das tabelas (`aluno`, `configuracoes_acessibilidade`, `pei_plano_individual`) em formato *snake_case*. 
| **Justificativa Unificada (Todos)** A equipe inteira valida a necessidade real de cada campo armazenado, descartando dados ociosos que não alimentam o Frontend, o Backend ou a IA. 
