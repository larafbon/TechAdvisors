
-- 1. Responsáveis
INSERT INTO responsavel (nome, telefone, email, cpf) VALUES
('Carlos Eduardo Silva', '(41) 98888-1111', 'carlos.silva@email.com', '12345678901'),
('Mariana Lima Santos', '(41) 98888-2222', 'mariana.santos@email.com', '98765432100'),
('Roberto Souza', '(41) 98888-3333', 'roberto.souza@email.com', '45678912304');

-- 2. Tipos de Deficiência
INSERT INTO tipo_deficiencia (codigo, descricao) VALUES
('TDAH', 'Transtorno do Deficit de Atencao com Hiperatividade'),
('DISLEXIA', 'Dificuldade especifica na aprendizagem da leitura e escrita'),
('AUTISMO', 'Transtorno do Espectro Autista (TEA)'),
('BAIXA_VISAO', 'Comprometimento parcial da visao');

-- 3. Níveis de Suporte
INSERT INTO nivel_suporte (codigo, descricao) VALUES
('LEVE', 'Necessita de suporte minimo em tarefas adaptadas'),
('MODERADO', 'Necessita de suporte frequente e recursos visuais/auditivos'),
('SUBSTANCIAL', 'Necessita de suporte continuo e acompanhamento dedicado');

-- 4. Professores
INSERT INTO professor (nome, email, status) VALUES
('Prof. Ana Beatriz Nogueira', 'ana.nogueira@escola.edu.br', 'ativo'),
('Prof. Ricardo Mendes', 'ricardo.mendes@escola.edu.br', 'ativo'),
('Prof. Carla Freitas', 'carla.freitas@escola.edu.br', 'afastado');

-- 5. Tipos de Atividade
INSERT INTO tipo_atividade (nome, descricao) VALUES
('Discursiva Adaptada', 'Questoes abertas com instrucoes em linguagem simplificada'),
('Objetiva Visual', 'Atividade de escolha multipla enriquecida com elementos visuais'),
('Atividade Auditiva', 'Tarefa com suporte de audio e sintese de voz');

-- 6. Recursos de Acessibilidade
INSERT INTO recurso_acessibilidade (nome, descricao, tipo, formato) VALUES
('Sintese de Voz (TTS)', 'Leitura em audio do texto da atividade', 'audio', 'MP3'),
('Fonte para Dislexia', 'Tipografia adaptada com maior espacamento entre letras', 'texto', 'TTF'),
('Alto Contraste', 'Esquema de cores adaptado para baixa visao', 'imagem', 'CSS'),
('Linguagem Simplificada', 'Texto reescrito em frases curtas e diretas', 'texto', 'TXT');

-- 7. Turmas
INSERT INTO turma (codigo_turma, nome_turma, serie_ano, disciplina, turno, ano_letivo, status_turma, id_professor) VALUES
('TURMA9A', '9º Ano A - Lingua Portuguesa', '9º Ano', 'Lingua Portuguesa', 'Manhã', 2026, 'ativa', 1),
('TURMA9B', '9º Ano B - Matematica', '9º Ano', 'Matematica', 'Manhã', 2026, 'ativa', 2);

-- 8. Alunos
INSERT INTO aluno (nome, data_nascimento, email, matricula, id_responsavel, id_turma, id_nivel_suporte, id_tipo_deficiencia) VALUES
('Lucas Silva', '2011-05-14', 'lucas.silva@aluno.escola.edu.br', 'MAT202601', 1, 1, 1, 1),
('Beatriz Santos', '2011-08-22', 'beatriz.santos@aluno.escola.edu.br', 'MAT202602', 2, 1, 2, 2),
('Gabriel Souza', '2010-11-03', 'gabriel.souza@aluno.escola.edu.br', 'MAT202603', 3, 2, 2, 3);

-- 9. Atividades
INSERT INTO atividade (titulo, descricao, data_criacao, id_tipo_atividade) VALUES
('Interpretacao de Texto Inclusiva', 'Leia o texto e responda as Questoes sobre a ideia principal.', CURRENT_DATE, 1),
('Raciocinio Logico e Geometria', 'Identifique as formas geometricas nas imagens apresentadas.', CURRENT_DATE, 2);


-- 10. Configurações de Acessibilidade (1:1 com Aluno)
INSERT INTO config_acessibilidade (id_aluno, preferencia_audio, preferencia_visual, preferencia_simplificado, outras_configuracoes) VALUES
(1, FALSE, FALSE, TRUE, 'Tamanho de fonte: 18px'),
(2, TRUE, TRUE, FALSE, 'Fonte para Dislexia ativa'),
(3, TRUE, FALSE, TRUE, 'Layout com reducao de estimulos');

-- 11. Aluno Deficiência (N:M)
INSERT INTO aluno_deficiencia (id_aluno, id_tipo_deficiencia, id_nivel_suporte) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 2);

-- 12. Atividade Recurso (N:M)
INSERT INTO atividade_recurso (id_atividade, id_recurso) VALUES
(1, 2),
(1, 4),
(2, 1),
(2, 3);

-- 13. Respostas
INSERT INTO resposta (id_aluno, id_atividade, conteudo_resposta, nota) VALUES
(1, 1, 'A ideia principal do texto e a preservacao das florestas tropicais.', 8.50),
(2, 1, 'O texto fala sobre cuidar das arvores e dos animais.', 9.00),
(3, 2, 'As formas sao o quadrado azul e o triangulo vermelho.', 10.00);

-- 14. Análise IA
INSERT INTO analise_ia (id_resposta, resultado, sugestoes, modelo_utilizado) VALUES
(1, 'Demonstrou boa compreensao global, com pequena dispersao nos detalhes.', 'Oferecer mapas mentais na proxima avaliacao.', 'GPT-4o-Mini'),
(2, 'Respondeu de forma direta, demonstrando excelente sintese do texto.', 'Manter o uso da Fonte para Dislexia e instrucoes curtas.', 'GPT-4o-Mini'),
(3, 'Identificou corretamente todos os elementos visuais pedidos.', 'Incentivar atividades com maior complexidade de formas.', 'Claude-3.5-Sonnet');

-- 15. Resposta Recurso (N:M)
INSERT INTO resposta_recurso (id_resposta, id_recurso) VALUES
(1, 4),
(2, 2),
(3, 1);

