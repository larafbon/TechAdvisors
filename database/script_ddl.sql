
-- 1. Responsável
CREATE TABLE responsavel (
    id_responsavel SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(150),
    cpf VARCHAR(11) UNIQUE
);

-- 2. Tipo de Deficiência
CREATE TABLE tipo_deficiencia (
    id_tipo_deficiencia SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT NOT NULL
);

-- 3. Nível de Suporte
CREATE TABLE nivel_suporte (
    id_nivel_suporte SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT NOT NULL
);

-- 4. Professor
CREATE TABLE professor (
    id_professor SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'afastado'))
);

-- 5. Tipo de Atividade
CREATE TABLE tipo_atividade (
    id_tipo_atividade SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- 6. Recurso de Acessibilidade
CREATE TABLE recurso_acessibilidade (
    id_recurso SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50), -- Ex: audio, texto, imagem
    formato VARCHAR(20) -- Ex: PDF, MP3, etc.
);



-- 7. Turma (Depende de Professor)
CREATE TABLE turma (
    id_turma SERIAL PRIMARY KEY,
    codigo_turma VARCHAR(20) UNIQUE NOT NULL,
    nome_turma VARCHAR(100) NOT NULL,
    serie_ano VARCHAR(50) NOT NULL,
    disciplina VARCHAR(100) NOT NULL,
    turno VARCHAR(20) NOT NULL CHECK (turno IN ('Manhã', 'Tarde', 'Noite', 'Integral')),
    ano_letivo INT NOT NULL CHECK (ano_letivo >= 2020),
    status_turma VARCHAR(20) DEFAULT 'ativa' CHECK (status_turma IN ('ativa', 'encerrada', 'cancelada')),
    id_professor INT NOT NULL,
    CONSTRAINT fk_turma_professor FOREIGN KEY (id_professor)
        REFERENCES professor (id_professor)
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 8. Aluno (Depende de Responsável, Turma, Nível de Suporte e Tipo de Deficiência)
CREATE TABLE aluno (
    id_aluno SERIAL PRIMARY KEY,
    nome VARCHAR(150) NOT NULL,
    data_nascimento DATE NOT NULL,
    email VARCHAR(150) UNIQUE,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    id_responsavel INT,
    id_turma INT,
    id_nivel_suporte INT,
    id_tipo_deficiencia INT,
    CONSTRAINT fk_aluno_responsavel FOREIGN KEY (id_responsavel)
        REFERENCES responsavel (id_responsavel)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_aluno_turma FOREIGN KEY (id_turma)
        REFERENCES turma (id_turma)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_aluno_nivelsuporte FOREIGN KEY (id_nivel_suporte)
        REFERENCES nivel_suporte (id_nivel_suporte)
        ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_aluno_tipodeficiencia FOREIGN KEY (id_tipo_deficiencia)
        REFERENCES tipo_deficiencia (id_tipo_deficiencia)
        ON DELETE SET NULL ON UPDATE CASCADE
);

-- 9. Atividade (Depende de Tipo de Atividade)
CREATE TABLE atividade (
    id_atividade SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
    id_tipo_atividade INT NOT NULL,
    CONSTRAINT fk_atividade_tipo FOREIGN KEY (id_tipo_atividade)
        REFERENCES tipo_atividade (id_tipo_atividade)
        ON DELETE RESTRICT ON UPDATE CASCADE
);


-- 10. Configuração de Acessibilidade (Relacionamento 1:1 com Aluno)
CREATE TABLE config_acessibilidade (
    id_config SERIAL PRIMARY KEY,
    id_aluno INT UNIQUE NOT NULL,
    preferencia_audio BOOLEAN DEFAULT FALSE,
    preferencia_visual BOOLEAN DEFAULT FALSE,
    preferencia_simplificado BOOLEAN DEFAULT FALSE,
    outras_configuracoes TEXT,
    CONSTRAINT fk_config_aluno FOREIGN KEY (id_aluno)
        REFERENCES aluno (id_aluno)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 11. Aluno Deficiência (Entidade de Associação / N:M)
CREATE TABLE aluno_deficiencia (
    id_aluno_deficiencia SERIAL PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_tipo_deficiencia INT NOT NULL,
    id_nivel_suporte INT NOT NULL,
    CONSTRAINT fk_aludef_aluno FOREIGN KEY (id_aluno)
        REFERENCES aluno (id_aluno)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_aludef_tipo FOREIGN KEY (id_tipo_deficiencia)
        REFERENCES tipo_deficiencia (id_tipo_deficiencia)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_aludef_nivel FOREIGN KEY (id_nivel_suporte)
        REFERENCES nivel_suporte (id_nivel_suporte)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 12. Atividade Recurso (Tabela de Junção N:M)
CREATE TABLE atividade_recurso (
    id_atividade INT NOT NULL,
    id_recurso INT NOT NULL,
    PRIMARY KEY (id_atividade, id_recurso),
    CONSTRAINT fk_atvrecurso_atividade FOREIGN KEY (id_atividade)
        REFERENCES atividade (id_atividade)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_atvrecurso_recurso FOREIGN KEY (id_recurso)
        REFERENCES recurso_acessibilidade (id_recurso)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 13. Resposta (Depende de Aluno e Atividade)
CREATE TABLE resposta (
    id_resposta SERIAL PRIMARY KEY,
    id_aluno INT NOT NULL,
    id_atividade INT NOT NULL,
    data_resposta TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    conteudo_resposta TEXT NOT NULL,
    nota DECIMAL(4,2) CHECK (nota >= 0),
    CONSTRAINT fk_resposta_aluno FOREIGN KEY (id_aluno)
        REFERENCES aluno (id_aluno)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_resposta_atividade FOREIGN KEY (id_atividade)
        REFERENCES atividade (id_atividade)
        ON DELETE CASCADE ON UPDATE CASCADE
);


-- 14. Análise IA (Depende de Resposta)
CREATE TABLE analise_ia (
    id_analise SERIAL PRIMARY KEY,
    id_resposta INT NOT NULL,
    data_analise TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resultado TEXT NOT NULL,
    sugestoes TEXT,
    modelo_utilizado VARCHAR(100) NOT NULL,
    CONSTRAINT fk_analiseia_resposta FOREIGN KEY (id_resposta)
        REFERENCES resposta (id_resposta)
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 15. Resposta Recurso (Tabela de Junção N:M)
CREATE TABLE resposta_recurso (
    id_resposta INT NOT NULL,
    id_recurso INT NOT NULL,
    PRIMARY KEY (id_resposta, id_recurso),
    CONSTRAINT fk_resprecurso_resposta FOREIGN KEY (id_resposta)
        REFERENCES resposta (id_resposta)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_resprecurso_recurso FOREIGN KEY (id_recurso)
        REFERENCES recurso_acessibilidade (id_recurso)
        ON DELETE CASCADE ON UPDATE CASCADE
);
