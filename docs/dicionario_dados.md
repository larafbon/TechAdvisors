## 1. Estrutura Oficial das Entidades e Atributos

| Entidade | Campo / Atributo | Tipo de Dado | Restrições | Regra de Negócio / Tratamento | Ciclo de Vida |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `responsavel` | `id_responsavel` | Inteiro | PK, Auto | Identificador único do responsável legal. | Inserção |
| `responsavel` | `nome` | Texto (150) | Não Nulo | Nome completo do responsável legal. | Inserção |
| `responsavel` | `telefone` | Texto (20) | Nulo | Telefone/WhatsApp para contato. | Atualização |
| `responsavel` | `email` | Texto (150) | Nulo | E-mail do responsável. | Atualização |
| `responsavel` | `cpf` | Texto (11) | Único | CPF do responsável legal. | Inserção |
| `tipo_deficiencia` | `id_tipo_deficiencia` | Inteiro | PK, Auto | Identificador do tipo de deficiência. | Inserção |
| `tipo_deficiencia` | `codigo` | Texto (50) | Único, Não Nulo | Código identificador (ex: TDAH, AUTISMO, DISLEXIA). | Inserção |
| `tipo_deficiencia` | `descricao` | Texto | Não Nulo | Descrição detalhada da condição. | Inserção |
| `nivel_suporte` | `id_nivel_suporte` | Inteiro | PK, Auto | Identificador do nível de suporte pedagógico. | Inserção |
| `nivel_suporte` | `codigo` | Texto (50) | Único, Não Nulo | Graus de suporte (ex: LEVE, MODERADO, SEVERO). | Inserção |
| `nivel_suporte` | `descricao` | Texto | Não Nulo | Descrição das adaptações necessárias para o nível. | Inserção |
| `professor` | `id_professor` | Inteiro | PK, Auto | Identificador único do docente. | Inserção |
| `professor` | `nome` | Texto (150) | Não Nulo | Nome completo do professor. | Inserção |
| `professor` | `email` | Texto (150) | PK/Único, Não Nulo | E-mail institucional de acesso. | Inserção |
| `professor` | `status` | Texto (20) | Default 'ativo', CHECK | Situação do professor (ativo, inativo, afastado). | Atualização |
| `tipo_atividade` | `id_tipo_atividade` | Inteiro | PK, Auto | Identificador da categoria da atividade. | Inserção |
| `tipo_atividade` | `nome` | Texto (100) | Não Nulo | Categoria da tarefa (ex: Discursiva, Objetiva, Adaptada). | Inserção |
| `tipo_atividade` | `descricao` | Texto | Nulo | Detalhes sobre o formato de atividade. | Inserção |
| `recurso_acessibilidade` | `id_recurso` | Inteiro | PK, Auto | Identificador do recurso multimodal. | Inserção |
| `recurso_acessibilidade` | `nome` | Texto (150) | Não Nulo | Nome do recurso (ex: Leitura em Áudio, Formatação Especial). | Inserção |
| `recurso_acessibilidade` | `descricao` | Texto | Nulo | Função detalhada do recurso adaptativo. | Inserção |
| `recurso_acessibilidade` | `tipo` | Texto (50) | Nulo | Tipo de mídia (ex: audio, texto, imagem). | Inserção |
| `recurso_acessibilidade` | `formato` | Texto (20) | Nulo | Formato digital do recurso (ex: MP3, PDF, PNG). | Inserção |
| `turma` | `id_turma` | Inteiro | PK, Auto | Identificador único da turma. | Inserção |
| `turma` | `codigo_turma` | Texto (20) | Único, Não Nulo | Código da turma (ex: TURMA01). | Inserção |
| `turma` | `nome_turma` | Texto (100) | Não Nulo | Nome descritivo da turma. | Inserção |
| `turma` | `serie_ano` | Texto (50) | Não Nulo | Ano escolar/série correspondente. | Inserção |
| `turma` | `disciplina` | Texto (100) | Não Nulo | Nome da matéria ministrada. | Inserção |
| `turma` | `turno` | Texto (20) | Não Nulo, CHECK | Turno das aulas (Manhã, Tarde, Noite, Integral). | Inserção |
| `turma` | `ano_letivo` | Inteiro | Não Nulo, CHECK | Ano de exercício (>= 2020). | Inserção |
| `turma` | `status_turma` | Texto (20) | Default 'ativa', CHECK | Estado da turma (ativa, encerrada, cancelada). | Atualização |
| `turma` | `id_professor` | Inteiro | FK, Não Nulo | Vínculo com o professor regente em `professor`. | Inserção |
| `aluno` | `id_aluno` | Inteiro | PK, Auto | Identificador único do estudante. | Inserção |
| `aluno` | `nome` | Texto (150) | Não Nulo | Nome completo do aluno. | Inserção |
| `aluno` | `data_nascimento` | Data | Não Nulo | Data de nascimento do aluno. | Inserção |
| `aluno` | `email` | Texto (150) | Único | E-mail de acesso do aluno. | Inserção |
| `aluno` | `matricula` | Texto (50) | Único, Não Nulo | Código de matrícula escolar. | Inserção |
| `aluno` | `id_responsavel` | Inteiro | FK, Nulo | Vínculo com a tabela `responsavel`. | Atualização |
| `aluno` | `id_turma` | Inteiro | FK, Nulo | Turma atual em que o estudante está matriculado. | Atualização |
| `aluno` | `id_nivel_suporte` | Inteiro | FK, Nulo | Nível principal de suporte associado. | Atualização |
| `aluno` | `id_tipo_deficiencia`| Inteiro | FK, Nulo | Condição principal cadastrada. | Atualização |
| `atividade` | `id_atividade` | Inteiro | PK, Auto | Identificador único da atividade. | Inserção |
| `atividade` | `titulo` | Texto (150) | Não Nulo | Título descritivo da atividade. | Inserção |
| `atividade` | `descricao` | Texto | Nulo | Instruções de realização. | Inserção |
| `atividade` | `data_criacao` | Data | Default CURRENT_DATE | Data de postagem no sistema. | Inserção |
| `atividade` | `id_tipo_atividade` | Inteiro | FK, Não Nulo | Vínculo com a categoria em `tipo_atividade`. | Inserção |
| `config_acessibilidade`| `id_config` | Inteiro | PK, Auto | Identificador do perfil de acessibilidade. | Inserção |
| `config_acessibilidade`| `id_aluno` | Inteiro | FK, Único, Não Nulo | Vínculo 1:1 exclusivo com a tabela `aluno`. | Inserção |
| `config_acessibilidade`| `preferencia_audio` | Booleano | Default FALSE | Habilita recursos e síntese de áudio. | Atualização |
| `config_acessibilidade`| `preferencia_visual` | Booleano | Default FALSE | Habilita alto contraste e adaptações visuais. | Atualização |
| `config_acessibilidade`| `preferencia_simplificado`| Booleano| Default FALSE | Habilita linguagem simplificada. | Atualização |
| `config_acessibilidade`| `outras_configuracoes`| Texto | Nulo | Preferências adicionais de tela/fonte. | Atualização |
| `aluno_deficiencia` | `id_aluno_deficiencia`| Inteiro| PK, Auto | Identificador do registro de associação. | Inserção |
| `aluno_deficiencia` | `id_aluno` | Inteiro | FK, Não Nulo | Aluno associado. | Inserção |
| `aluno_deficiencia` | `id_tipo_deficiencia`| Inteiro| FK, Não Nulo | Tipo de deficiência do aluno. | Inserção |
| `aluno_deficiencia` | `id_nivel_suporte` | Inteiro | FK, Não Nulo | Grau de suporte necessário para esta deficiência. | Inserção |
| `atividade_recurso` | `id_atividade` | Inteiro | PK, FK, Não Nulo | Atividade adaptada. | Inserção |
| `atividade_recurso` | `id_recurso` | Inteiro | PK, FK, Não Nulo | Recurso disponibilizado para a atividade. | Inserção |
| `resposta` | `id_resposta` | Inteiro | PK, Auto | Identificador do envio de resposta. | Inserção |
| `resposta` | `id_aluno` | Inteiro | FK, Não Nulo | Aluno autor da submissão. | Inserção |
| `resposta` | `id_atividade` | Inteiro | FK, Não Nulo | Atividade respondida. | Inserção |
| `resposta` | `data_resposta` | Data/Hora | Default CURRENT_TIMESTAMP | Momento exato da submissão. | Inserção |
| `resposta` | `conteudo_resposta` | Texto | Não Nulo | Texto ou conteúdo enviado pelo estudante. | Inserção |
| `resposta` | `nota` | Decimal (4,2)| CHECK (nota >= 0) | Nota ou pontuação atribuída. | Atualização |
| `analise_ia` | `id_analise` | Inteiro | PK, Auto | Identificador da análise gerada pela IA. | Inserção |
| `analise_ia` | `id_resposta` | Inteiro | FK, Não Nulo | Resposta avaliada pelo modelo de IA. | Inserção |
| `analise_ia` | `data_analise` | Data/Hora | Default CURRENT_TIMESTAMP | Momento em que o insight foi gerado. | Inserção |
| `analise_ia` | `resultado` | Texto | Não Nulo | Diagnóstico sobre o desempenho do aluno. | Inserção |
| `analise_ia` | `sugestoes` | Texto | Nulo | Recomendações pedagógicas para o professor. | Inserção |
| `analise_ia` | `modelo_utilizado` | Texto (100) | Não Nulo | Modelo de IA empregado (ex: GPT-4, Llama-3). | Inserção |
| `resposta_recurso` | `id_resposta` | Inteiro | PK, FK, Não Nulo | Resposta do aluno. | Inserção |
| `resposta_recurso` | `id_recurso` | Inteiro | PK, FK, Não Nulo | Recurso de acessibilidade acionado no envio. | Inserção |

---

## 2. Histórico de Alterações e Evolução do Modelo

| Versão | Etapa / Aula | Alteração Realizada | Motivo / Impacto no Sistema |
| :--- | :--- | :--- | :--- |
| **v1.0** | Aulas 1 - 5 | Estrutura inicial com 12 tabelas. | Modelagem preliminar do sistema. |
| **v3.0** | Reestruturação IA | Refatoração completa para 15 tabelas em **3ª Forma Normal (3FN)**. | Separação de responsabilidades de deficiências, suporte, recursos de mídia e logs da Inteligência Artificial. |

