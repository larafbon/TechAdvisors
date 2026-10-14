## 1. Pergunta da Aula
> **Quais regras o sistema precisa garantir sobre os dados?**

Para que a plataforma funcione de forma segura e justa, o sistema precisa impedir que dados incompletos, duplicados ou incoerentes entrem no banco. As regras garantem desde a identificação única dos estudantes até o controle correto dos prazos de tarefas e das pontuações obtidas.

---

## 2. Regras de Negócio em Linguagem Simples (Cartões SE... ENTÃO)

* **RN01 - Unicidade do Estudante:**  
  * **SE** um novo aluno for cadastrado, **ENTÃO** o CPF e a Matrícula devem ser únicos no sistema todo. Não pode haver dois alunos com o mesmo documento.
* **RN02 - Personalização de Acessibilidade Obrigatória:**  
  * **SE** um perfil de aluno for criado, **ENTÃO** ele precisa estar vinculado a uma configuração de acessibilidade (como tamanho de fonte e leitura de voz) para garantir a inclusão desde o primeiro acesso.
* **RN03 - Responsabilidade da Turma:**  
  * **SE** uma turma for aberta, **ENTÃO** ela deve obrigatoriamente ter um professor regente associado.
* **RN04 - Trava de Entrega de Atividade:**  
  * **SE** um aluno tentar enviar uma resposta para uma atividade, **ENTÃO** o sistema deve verificar se ele está matriculado naquela turma específica.
* **RN05 - Coerência nos Prazos:**  
  * **SE** um professor cadastrar uma atividade, **ENTÃO** a data e hora do prazo final de entrega deve ser posterior ao momento de abertura da tarefa.
* **RN06 - Teto de Pontuação:**  
  * **SE** uma nota for dada a um aluno, **ENTÃO** ela não pode ser negativa e nem ultrapassar o valor máximo definido para aquela avaliação.
* **RN07 - Rastreabilidade de Apoio Pedagógico e IA:**  
  * **SE** a IA gerar um diagnóstico ou o professor registrar um Plano Individualizado (PEI), **ENTÃO** esses registros devem estar obrigatoriamente conectados a um aluno e a um professor válidos.

---

## 3. Matriz de Rastreabilidade (Regra -> Dados -> Validação)

| ID | Regra de Negócio | Tabelas / Campos Envolvidos | Classificação da Regra | Como o Banco Garante (DDL) | Como o Backend Valida | Como o Frontend Reage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **RN01** | Unicidade de CPF e Matrícula do aluno. | `aluno` (`cpf_aluno`, `matricula`) | Unicidade e Obrigatoriedade | `PRIMARY KEY` no CPF e `UNIQUE NOT NULL` na matrícula. | Valida o algoritmo do CPF antes de tentar salvar no banco. | Exibe aviso de erro em tempo real caso o CPF ou matrícula já existam. |
| **RN02** | Perfil de acessibilidade obrigatório. | `aluno` (`id_config`), `configuracoes_acessibilidade` | Relacionamento e Obrigatoriedade | `FOREIGN KEY ... NOT NULL` apontando para a tabela de configurações. | Cria automaticamente uma configuração padrão caso o usuário não escolha uma. | Aplica o tema, fonte para dislexia e alto contraste logo após o login. |
| **RN03** | Turma com professor responsável. | `turma` (`email_professor`), `professor` | Relacionamento e Obrigatoriedade | `FOREIGN KEY ... NOT NULL` associada ao e-mail do professor. | Recusa a criação da turma se o e-mail informado não for de um docente ativo. | Apresenta uma lista suspensa (dropdown) com os professores disponíveis. |
| **RN04** | Envio de tarefas restrito a alunos da turma. | `aluno_turma`, `atividade`, `resposta_atividade` | Relacionamento e Regra de Fluxo | Chaves estrangeiras que ligam a resposta à atividade e ao aluno. | Checa se existe a relação na tabela `aluno_turma` antes de aceitar o envio. | Esconde ou bloqueia o botão de envio para alunos não matriculados na sala. |
| **RN05** | Prazo final de entrega maior que a abertura. | `atividade` (`data_hora_abertura`, `data_hora_entrega`) | Validação Temporal e Intervalo | Restrição `CHECK (data_hora_entrega > data_hora_abertura)`. | Compara os dois campos de data/hora e bloqueia a requisição se a entrega for anterior. | Impede a seleção de datas passadas no calendário da tela. |
| **RN06** | Nota obtida dentro do limite. | `atividade` (`nota_maxima`), `resposta_atividade` (`nota_obtida`) | Intervalo e Limite de Valor | Restrição `CHECK (nota_obtida >= 0)`. | Confere se `nota_obtida <= nota_maxima` antes de gravar a avaliação. | Limita o campo numérico para não permitir digitação acima da nota máxima. |
| **RN07** | Rastreabilidade do PEI e das análises da IA. | `pei_plano_individual`, `sugestao_ia_pedagogica`, `aluno`, `professor` | Rastreabilidade e Integridade | `FOREIGN KEY` ligando o aluno e o professor com `ON DELETE CASCADE`. | Garante autorização do professor e vincula o ID do aluno ao acionar o modelo de IA. | Exibe cartões visuais com status de risco ou conduta recomendada para o professor. |

---

