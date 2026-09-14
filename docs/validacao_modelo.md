## 1. Pergunta da Aula
> **O modelo que já construímos representa aquilo que o problema precisa?**

**Sim.** Fizemos o cruzamento direto entre as necessidades identificadas no problema do nosso sistema e a estrutura física do nosso banco de dados relacional. O Diagrama Entidade-Relacionamento (Fonte: `docs/der_revisado.png`) e o Dicionário de Dados (Fonte: `docs/dicionario_dados.md`) contêm todas as colunas necessárias para identificar o aluno, resgatar suas preferências visuais na tela e alimentar a inteligência artificial com o contexto pedagógico correto.

## 2. Teste de Rastreabilidade (Necessidade → Entidade → Atributo)

Para garantir que nenhum dado exista por acaso e que nada esteja faltando, conectamos as dores do usuário aos elementos do banco de dados:

* **Necessidade:** Identificar o estudante e sua turma no sistema.
  * **Entidade:** `aluno` (Fonte: `docs/der_revisado.png`)
  * **Atributos:** `cpf_aluno`, `nome_completo`, `email_matricula` (Fonte: `docs/dicionario_dados.md`)

* **Necessidade:** Adaptar a interface para estudantes com Dislexia, Baixa Visão ou TDAH.
  * **Entidade:** `configuracoes_acessibilidade` (Fonte: `docs/der_revisado.png`)
  * **Atributos:** `tamanho_fonte`, `fonte_dislexia`, `reducao_estimulo`, `contraste_cores` (Fonte: `docs/dicionario_dados.md`)

* **Necessidade:** Dar contexto pedagógico individualizado para a resposta da IA.
  * **Entidade:** `pei_plano_individual` (Fonte: `docs/der_revisado.png`)
  * **Atributos:** `objetivos_pedagogicos`, `atendimentos_especializados` (Fonte: `docs/dicionario_dados.md`)

* **Necessidade:** Analisar o histórico de notas e o desempenho prático.
  * **Entidade:** `resposta_atividade` (Fonte: `docs/der_revisado.png`)
  * **Atributos:** `nota_obtida`, `data_hora_entrega` (Fonte: `docs/dicionario_dados.md`)

* **Necessidade:** Registrar diagnósticos e alertas automáticos gerados pela IA.
  * **Entidade:** `sugestao_ia_pedagogica` (Fonte: `docs/der_revisado.png`)
  * **Atributos:** `diagnostico_desempenho`, `sugestao_conduta`, `alerta_risco` (Fonte: `docs/dicionario_dados.md`)
 
  
  ## 3. Ficha de Validação do Modelo

* **MANTER:**
  * Entidade `aluno` (Fonte: `docs/der_revisado.png`) com a chave primária `cpf_aluno`.
  * Estruturas de acessibilidade (`configuracoes_acessibilidade`) e de histórico pedagógico (`pei_plano_individual`, `sugestao_ia_pedagogica`) (Fonte: `docs/dicionario_dados.md`).
* **REVISAR:**
  * Indexação do campo `cpf_aluno` (Fonte: `docs/der_revisado.png`) nas tabelas associadas para manter as buscas da IA em alto desempenho.
* **INCLUIR:**
  * Nenhuma tabela adicional necessária no momento; a estrutura atual cobre 100% dos requisitos do MVP.
* **REMOVER:**
  * Nenhum atributo desnecessário encontrado no DER (Fonte: `docs/der_revisado.png`); todos cumprem papel ativo na interface, no backend ou na IA.
