-- PERGUNTA 1 (Frontend / Interface Adaptativa):
-- "Quais são os dados cadastrais e as preferências ativas de acessibilidade do 
--  estudante para adaptar a interface de aprendizagem?"

SELECT 
    a.id_aluno,
    a.nome AS nome_aluno,
    a.matricula,
    td.codigo AS deficiencia_principal,
    ns.codigo AS nivel_suporte,
    ca.preferencia_audio,
    ca.preferencia_visual,
    ca.preferencia_simplificado,
    ca.outras_configuracoes
FROM aluno a
LEFT JOIN config_acessibilidade ca ON a.id_aluno = ca.id_aluno
LEFT JOIN tipo_deficiencia td ON a.id_tipo_deficiencia = td.id_tipo_deficiencia
LEFT JOIN nivel_suporte ns ON a.id_nivel_suporte = ns.id_nivel_suporte
WHERE a.id_aluno = 1;



-- PERGUNTA 2 (Coordenação / Gestão de Turma):
-- "Quais alunos estão matriculados em uma determinada turma e quais são suas 
--  deficiências e níveis de suporte requeridos?"

SELECT 
    t.codigo_turma,
    t.nome_turma,
    t.disciplina,
    p.nome AS professor_responsavel,
    a.nome AS nome_aluno,
    a.matricula,
    COALESCE(td.codigo, 'SEM DIAGNÓSTICO') AS deficiencia,
    COALESCE(ns.codigo, 'SUPORTE PADRÃO') AS nivel_suporte
FROM turma t
INNER JOIN professor p ON t.id_professor = p.id_professor
INNER JOIN aluno a ON a.id_turma = t.id_turma
LEFT JOIN tipo_deficiencia td ON a.id_tipo_deficiencia = td.id_tipo_deficiencia
LEFT JOIN nivel_suporte ns ON a.id_nivel_suporte = ns.id_nivel_suporte
WHERE t.codigo_turma = 'TURMA9A'
ORDER BY a.nome ASC;



-- PERGUNTA 3 (Módulo de IA / Backend / Avaliação):
-- "Qual foi o desempenho do aluno nas atividades e quais foram as análises e 
--  sugestões geradas pelos modelos de IA para cada resposta?"

SELECT 
    a.nome AS nome_aluno,
    atv.titulo AS atividade,
    ta.nome AS tipo_atividade,
    r.data_resposta,
    r.conteudo_resposta,
    r.nota,
    ai.resultado AS diagnostico_ia,
    ai.sugestoes AS recomendacao_docente,
    ai.modelo_utilizado
FROM resposta r
INNER JOIN aluno a ON r.id_aluno = a.id_aluno
INNER JOIN atividade atv ON r.id_atividade = atv.id_atividade
INNER JOIN tipo_atividade ta ON atv.id_tipo_atividade = ta.id_tipo_atividade
LEFT JOIN analise_ia ai ON r.id_resposta = ai.id_resposta
ORDER BY r.data_resposta DESC;



-- PERGUNTA 4 (Métricas / Uso de Recursos Pedagógicos):
-- "Quais recursos de acessibilidade (Ex: TTS, Fonte para Dislexia) foram mais 
--  acionados pelos estudantes nas respostas entregues?"

SELECT 
    ra.nome AS recurso_acessibilidade,
    ra.tipo AS tipo_midia,
    COUNT(rr.id_resposta) AS total_utilizacoes
FROM recurso_acessibilidade ra
LEFT JOIN resposta_recurso rr ON ra.id_recurso = rr.id_recurso
GROUP BY ra.id_recurso, ra.nome, ra.tipo
ORDER BY total_utilizacoes DESC;



-- PERGUNTA 5 (Acompanhamento Docente / Desempenho Média):
-- "Qual a média de notas obtida por aluno nas atividades adaptadas, 
--  considerando apenas submissões já avaliadas?"

SELECT 
    a.id_aluno,
    a.nome AS nome_aluno,
    COUNT(r.id_resposta) AS total_atividades_entregues,
    ROUND(AVG(r.nota), 2) AS media_notas
FROM aluno a
INNER JOIN resposta r ON a.id_aluno = r.id_aluno
WHERE r.nota IS NOT NULL
GROUP BY a.id_aluno, a.nome
HAVING COUNT(r.id_resposta) >= 1
ORDER BY media_notas DESC;

