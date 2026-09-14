# Dicionário de Dados Consolidado (Aula 3 - Checkpoint)

**Projeto Integrador (DS + IA):** Assistente Pedagógico Inclusivo  
**Caminho no Repositório:** `docs/dicionario_dados.md`

---

## 1. Estrutura Oficial das Entidades e Atributos

| Entidade / Tela | Campo / Atributo | Tipo de Dado | Restrições | Regra de Negócio / Tratamento | Ciclo de Vida do Dado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `configuracoes_acessibilidade` | `id_config` | Inteiro | Chave primária (PK), Não nulo | Identificador único do perfil de acessibilidade visual e auditiva. | Inserção (Create) |
| `configuracoes_acessibilidade` | `tamanho_fonte` | Inteiro | Não nulo | Tamanho base da fonte em pixels para adaptação de leitura. | Atualização (Update) |
| `configuracoes_acessibilidade` | `sintese_voz` | Booleano | Não nulo | Ativa leitura em áudio/TTS da interface. | Atualização (Update) |
| `configuracoes_acessibilidade` | `contraste_cores` | Texto | Não nulo | Tema visual (padrao, alto_contraste, escuro, amarelo_preto). | Atualização (Update) |
| `configuracoes_acessibilidade` | `velocidade_audio` | Decimal | Não nulo | Velocidade de reprodução do áudio (ex: 0.75, 1.00, 1.25). | Atualização (Update) |
| `configuracoes_acessibilidade` | `fonte_dislexia` | Booleano | Não nulo | Aplica tipografia OpenDyslexic/adaptada para facilitar leitura. | Atualização (Update) |
| `configuracoes_acessibilidade` | `reducao_estimulo` | Booleano | Não nulo | Oculta elementos visuais não essenciais para manter foco. | Atualização (Update) |
| `secretaria_usuario` | `email_usuario` | Texto | Chave primária (PK), Não nulo | E-mail de acesso e identificação da gestão/secretaria. | Consulta (Read) |
| `secretaria_usuario` | `senha` | Texto | Não nulo | Hash seguro da senha de acesso do operador administrativo. | Consulta (Read) |
| `secretaria_usuario` | `nome_operador` | Texto | Não nulo | Nome completo do funcionário da secretaria/coordenação. | Consulta (Read) |
| `secretaria_usuario` | `papel_permissao` | Texto | Não nulo | Nível de permissão (administrador, coordenador, secretaria). | Consulta (Read) |
| `professor` | `email` | Texto | Chave primária (PK), Não nulo | E-mail institucional de login do docente. | Consulta (Read) |
| `professor` | `senha` | Texto | Não nulo | Hash seguro da senha de acesso do professor. | Consulta (Read) |
| `professor` | `nome` | Texto | Não nulo | Nome completo do professor regente. | Consulta (Read) |
| `professor` | `telefone` | Texto | Nulo | Telefone/WhatsApp de contato institucional. | Consulta (Read) |
| `professor` | `foto_perfil` | Texto | Nulo | URL/Caminho do arquivo da imagem de perfil. | Consulta (Read) |
| `professor` | `tema_exibicao` | Texto | Nulo | Preferência visual do painel do professor (claro, escuro, azul). | Atualização (Update) |
| `aluno` | `cpf_aluno` | Texto | Chave primária (PK), Não nulo, Único | CPF do estudante (apenas dígitos). Chave de ligação central. | Consulta (Read) |
| `aluno` | `email_matricula` | Texto | Não nulo, Único | E-mail de login/matrícula do aluno no sistema. | Consulta (Read) |
| `aluno` | `senha` | Texto | Não nulo | Hash da senha de acesso do estudante. | Consulta (Read) |
| `aluno` | `nome_completo` | Texto | Não nulo | Nome completo do aluno. | Consulta (Read) |
| `aluno` | `data_nascimento` | Data | Não nulo | Data de nascimento do aluno para controle de faixa etária. | Consulta (Read) |
| `aluno` | `matricula` | Texto | Não nulo, Único | Código de matrícula escolar. | Consulta (Read) |
| `aluno` | `foto_avatar_url` | Texto | Nulo | URL da imagem/avatar personalizado do perfil. | Atualização (Update) |
| `aluno` | `tipo_deficiencia` | Texto | Nulo | Diagnóstico/Condição (Autismo, TDAH, Dislexia, Baixa Visão, etc.). | Consulta (Read) |
| `aluno` | `historico_pontos` | Inteiro | Não nulo | Pontuação gamificada por conquistas e entregas de atividades. | Atualização (Update) |
| `aluno` | `id_config` | Inteiro | Chave estrangeira (FK), Não nulo | Vínculo com as preferências visuais/auditivas de acessibilidade. | Consulta (Read) |
| `turma` | `codigo_turma` | Texto | Chave primária (PK), Não nulo | Código único identificador da turma (ex: TURMA001). | Consulta (Read) |
| `turma` | `nome_turma` | Texto | Não nulo | Nome descritivo da turma/matéria (ex: Matemática A). | Consulta (Read) |
| `turma` | `serie_ano` | Texto | Não nulo | Série escolar correspondente (ex: 9º Ano). | Consulta (Read) |
| `turma` | `disciplina` | Texto | Não nulo | Nome da disciplina ministrada na turma. | Consulta (Read) |
| `turma` | `turno` | Texto | Não nulo | Turno das aulas (Manhã, Tarde, Noite). | Consulta (Read) |
| `turma` | `ano_letivo` | Inteiro | Não nulo | Ano de vigência da turma (ex: 2026). | Consulta (Read) |
| `turma` | `capacidade_maxima` | Inteiro | Não nulo | Quantidade máxima de alunos permitidos na sala. | Consulta (Read) |
| `turma` | `status_turma` | Texto | Não nulo | Estado operacional da turma (ativa, encerrada, suspensa). | Consulta (Read) |
| `turma` | `email_professor` | Texto | Chave estrangeira (FK), Não nulo | E-mail do professor regente/responsável pela turma. | Consulta (Read) |
| `aluno_turma` | `cpf_aluno` | Texto | Chave primária (PK), Chave estrangeira (FK), Não nulo | Vínculo do aluno com a turma específica. | Consulta (Read) |
| `aluno_turma` | `codigo_turma` | Texto | Chave primária (PK), Chave estrangeira (FK), Não nulo | Vínculo da turma com os alunos matriculados. | Consulta (Read) |
| `pei_plano_individual` | `id_pei` | Inteiro | Chave primária (PK), Não nulo | Identificador único do Plano de Ensino Individualizado. | Inserção (Create) |
| `pei_plano_individual` | `cpf_aluno` | Texto | Chave estrangeira (FK), Não nulo | Aluno a quem o PEI pertence. | Consulta (Read) |
| `pei_plano_individual` | `objetivos_pedagogicos` | Texto | Não nulo | Metas educacionais e adaptações necessárias descritas. | Inserção (Create) |
| `pei_plano_individual` | `atendimentos_especializados` | Texto | Nulo | Descrição de acompanhamentos (ex: Fonoaudiologia, Psicopedagogia). | Inserção (Create) |
| `pei_plano_individual` | `data_criacao` | Data | Não nulo | Data de homologação e abertura do PEI. | Inserção (Create) |
| `pei_plano_individual` | `data_revisao` | Data | Nulo | Data prevista para reavaliação periódica do PEI. | Atualização (Update) |
| `pei_plano_individual` | `status_pei` | Texto | Não nulo | Situação atual do plano (em_andamento, revisao, concluido). | Atualização (Update) |
| `atividade` | `id_atividade` | Inteiro | Chave primária (PK), Não nulo | Identificador único da atividade/tarefa. | Inserção (Create) |
| `atividade` | `titulo` | Texto | Não nulo | Título descritivo da atividade escolar. | Inserção (Create) |
| `atividade` | `descricao` | Texto | Nulo | Instruções detalhadas para realização da tarefa. | Inserção (Create) |
| `atividade` | `tipo_atividade` | Texto | Não nulo | Tipo de avaliação (multipla_escolha, discursiva, adaptada). | Inserção (Create) |
| `atividade` | `data_hora_abertura` | Data/Hora | Não nulo | Data e horário em que a tarefa fica disponível. | Inserção (Create) |
| `atividade` | `data_hora_entrega` | Data/Hora | Não nulo | Data e horário limite para envio da solução. | Inserção (Create) |
| `atividade` | `nota_maxima` | Decimal | Não nulo | Pontuação total distribuída na atividade. | Inserção (Create) |
| `atividade` | `recursos_acessibilidade` | Texto | Nulo | Adaptações específicas incluídas nesta atividade. | Inserção (Create) |
| `atividade` | `anexos` | Texto | Nulo | URLs de arquivos/PDFs de apoio anexados. | Inserção (Create) |
| `atividade` | `codigo_turma` | Texto | Chave estrangeira (FK), Não nulo | Turma para a qual a atividade foi cadastrada. | Consulta (Read) |
| `resposta_atividade` | `id_resposta` | Inteiro | Chave primária (PK), Não nulo | Identificador único do envio da resposta. | Inserção (Create) |
| `resposta_atividade` | `data_hora_inicio` | Data/Hora | Não nulo | Momento em que o estudante iniciou a resolução. | Inserção (Create) |
| `resposta_atividade` | `data_hora_entrega` | Data/Hora | Não nulo | Momento exato do envio definitivo. | Inserção (Create) |
| `resposta_atividade` | `resposta_selecionada` | Texto | Não nulo | Opção assinalada ou texto da resposta enviada. | Inserção (Create) |
| `resposta_atividade` | `nota_obtida` | Decimal | Nulo | Nota atribuída pelo professor ou correção automática. | Atualização (Update) |
| `resposta_atividade` | `cpf_aluno` | Texto | Chave estrangeira (FK), Não nulo | Estudante autor da resposta. | Consulta (Read) |
| `resposta_atividade` | `id_atividade` | Inteiro | Chave estrangeira (FK), Não nulo | Atividade que está sendo respondida. | Consulta (Read) |
| `sugestao_ia_pedagogica` | `id_sugestao` | Inteiro | Chave primária (PK), Não nulo | Identificador único da análise gerada pela IA. | Inserção (Create) |
| `sugestao_ia_pedagogica` | `cpf_aluno` | Texto | Chave estrangeira (FK), Não nulo | Estudante analisado pelo algoritmo. | Consulta (Read) |
| `sugestao_ia_pedagogica` | `email_professor` | Texto | Chave estrangeira (FK), Não nulo | Docente destinatário da sugestão da IA. | Consulta (Read) |
| `sugestao_ia_pedagogica` | `diagnostico_desempenho` | Texto | Não nulo | Resumo do padrão de aprendizagem/dificuldades detectado. | Inserção (Create) |
| `sugestao_ia_pedagogica` | `sugestao_conduta` | Texto | Não nulo | Recomendação de intervenção pedagógica sugerida. | Inserção (Create) |
| `sugestao_ia_pedagogica` | `alerta_risco` | Texto | Nulo | Nível ou descrição do risco de defasagem/evasão. | Inserção (Create) |
| `sugestao_ia_pedagogica` | `data_geracao` | Data | Não nulo | Data de processamento do insight pela IA. | Inserção (Create) |
| `observacao_pedagogica` | `id_observacao` | Inteiro | Chave primária (PK), Não nulo | Identificador único do anotação de diário. | Inserção (Create) |
| `observacao_pedagogica` | `cpf_aluno` | Texto | Chave estrangeira (FK), Não nulo | Aluno a respeito de quem se opina. | Consulta (Read) |
| `observacao_pedagogica` | `email_professor` | Texto | Chave estrangeira (FK), Não nulo | Professor autor do registro qualitativo. | Consulta (Read) |
| `observacao_pedagogica` | `texto_observacao` | Texto | Não nulo | Descrição de comportamento, avanços ou necessidades. | Inserção (Create) |
| `observacao_pedagogica` | `data_registro` | Data | Não nulo | Data do registro da observação. | Inserção (Create) |
| `mural_recados` | `id_mural` | Inteiro | Chave primária (PK), Não nulo | Identificador único do comunicado no mural. | Inserção (Create) |
| `mural_recados` | `codigo_turma` | Texto | Chave estrangeira (FK), Não nulo | Turma de destino do aviso. | Consulta (Read) |
| `mural_recados` | `titulo` | Texto | Não nulo | Assunto ou título principal do comunicado. | Inserção (Create) |
| `mural_recados` | `mensagem` | Texto | Não nulo | Conteúdo textual completo do recado. | Inserção (Create) |
| `mural_recados` | `data_postagem` | Data | Não nulo | Data de publicação no mural. | Inserção (Create) |

---
# Histórico de Alterações do Dicionário de Dados e DER (Changelog)

**Projeto Integrador (DS + IA):** Assistente Pedagógico Inclusivo  
**Caminho no Repositório:** `docs/historico_alteracoes.md`

---

## Registro de Evolução e Revisões

| Versão | Etapa / Aula | Objeto / Tabela | Alteração Realizada | Motivo / Impacto no Sistema |
| :--- | :--- | :--- | :--- | :--- |
| **v1.0** | Aula 1 | Modelagem Inicial | Criação do DER v1 e mapeamento primário das entidades. | Levantamento inicial dos requisitos de negócio e funcionalidades. |
| **v1.1** | Aula 2 | Matriz de Rastreabilidade | Validação da presença dos dados de IA e acessibilidade. | Garantia de suporte para prompts do Backend e acessibilidade do Frontend. |
| **v2.0** | Aula 3 | `aluno_turma` | Remoção de duplicidades visuais e eliminação da FK `id_config`. | Correção do modelo relacional N:M mantendo apenas `cpf_aluno` e `codigo_turma`. |
| **v2.1** | Aula 3 | Múltiplas Tabelas | Normalização de 100% das tabelas e colunas para `snake_case` minúsculo. | Padronização exigida para compatibilidade com o PostgreSQL e scripts DDL. |
| **v2.2** | Aula 3 | `secretaria_usuario` | Alteração da restrição de `email_usuario` de FK para **PK (Chave Primária)**. | Correção de inconsistência: a secretaria é uma entidade base no sistema. |
| **v2.3** | Aula 3 | `observacao_pedagogica` | Alteração do tipo de dado de `data_registro` de *Texto* para **Data**. | Garantia de integridade temporal e padronização com os campos de data do banco. |
| **v2.4** | Aula 3 (Checkpoint) | DER & Dicionário | Consolidação final e geração dos arquivos `der_revisado.png` e `dicionario_dados.md`. | Conclusão oficial do Checkpoint da Aula 3 para envio do repositório. |

## 2. Relação de Integridade das Chaves

* **Total de Entidades:** 12 tabelas relacionais.
* **Padronização:** 100% dos nomes em `snake_case` minúsculo.
* **Alinhamento:** Total sincronia com a imagem `docs/der_revisado.png`.
