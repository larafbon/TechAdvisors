Nesta etapa do projeto, o nosso objetivo principal foi conectar o backend da aplicação ao nosso banco de dados PostgreSQL na nuvem (Supabase). Antes, nós tínhamos o modelo de dados desenhado e o código rodando de forma isolada. Agora, conseguimos integrar tudo para que as informações enviadas pela API sejam salvas de verdade no banco.

Usamos o framework FastAPI em Python para construir as rotas e o Pydantic para validar os dados que entram e saem do sistema. Todo esse processo permitiu que a gente testasse o envio de dados via Postman e consultasse os resultados no painel do Supabase.

2. Desafios Enfrentados e Soluções

Durante o desenvolvimento, passamos por momentos de bastante teste e ajuste até entender exatamente como o banco de dados e a API conversam.

O Problema das Chaves Estrangeiras (Foreign Keys):

No início, estávamos tentando testar rotas usando tabelas como config_acessibilidade. O problema é que essa tabela exige uma Chave Estrangeira (FK) apontando para um aluno que já existe na tabela aluno. Como a tabela de alunos ainda não tinha dados inseridos no teste, a API não conseguia criar o vínculo e retornava o erro 500 Internal Server Error.

Como Resolvemos:

Analisamos o nosso Diagrama Entidade-Relacionamento (DER) e identificámos que precisávamos testar uma tabela do Bloco 1 (Tabelas Base), ou seja, uma tabela que não depende de nenhuma outra para existir. Escolhemos a tabela recurso_acessibilidade.

Reestruturação do Código:

Ajustamos os arquivos da nossa aplicação no backend:

models.py: Mapeamos a tabela recurso_acessibilidade com as colunas id_recurso, nome, descricao, tipo e formato.

schemas.py: Criamos os esquemas de validação RecursoAcessibilidadeCreate e RecursoAcessibilidadeResponse.

main.py: Criamos as rotas de cadastro (POST) e de listagem (GET).

3. Tudo o que Foi Feito

Configuração da Conexão: Conectamos a API FastAPI ao Supabase usando SQLAlchemy e variáveis de ambiente.

Criação dos Modelos e Schemas: Estruturamos como os dados devem ser organizados em Python e como devem ser validados ao receber uma requisição JSON.

Criação da Rota POST (/recursos_acessibilidade): Permite cadastrar novos recursos de acessibilidade (como leitores de tela ou fontes adaptadas) diretamente no banco.

Criação da Rota GET (/recursos_acessibilidade): Busca e retorna a lista de todos os recursos armazenados na base PostgreSQL.

Testes e Validação HTTP: Testamos os códigos de resposta e garantimos que o envio correto gera o status 201 Created e a leitura gera 200 OK.

 Conclusão

Superar os erros de chave estrangeira e entender a relação entre o DER e a API foi um passo fundamental no nosso aprendizado. Agora temos um backend funcional, integrado ao Supabase, testado no Postman e versionado no GitHub, pronto para servir de base para a criação do frontend e das telas da aplicação
