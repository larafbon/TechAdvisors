-- 1. Tabela configuracoes_acessibilidade
CREATE TABLE configuracoes_acessibilidade (
    id_config SERIAL PRIMARY KEY,
    tamanho_fonte INT NOT NULL CHECK (tamanho_fonte >= 10 AND tamanho_fonte <= 36),
    sintese_voz BOOLEAN NOT NULL DEFAULT FALSE,
    contraste_cores VARCHAR(30) NOT NULL DEFAULT 'padrao',
    velocidade_audio DECIMAL(3,2) NOT NULL DEFAULT 1.00 CHECK (velocidade_audio >= 0.50 AND velocidade_audio <= 2.00),
    fonte_dislexia BOOLEAN NOT NULL DEFAULT FALSE,
    reducao_estimulo BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. Tabela secretaria_usuario
CREATE TABLE secretaria_usuario (
    email_usuario VARCHAR(150) PRIMARY KEY,
    senha VARCHAR(255) NOT NULL,
    nome_operador VARCHAR(150) NOT NULL,
    papel_permissao VARCHAR(50) NOT NULL
);

-- 3. Tabela professor
CREATE TABLE professor (
    email VARCHAR(150) PRIMARY KEY,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(150) NOT NULL,
    telefone VARCHAR(20),
    foto_perfil TEXT,
    tema_exibicao VARCHAR(30) DEFAULT 'claro'
);


-- 4. Tabela aluno
CREATE TABLE aluno (
    cpf_aluno VARCHAR(11) PRIMARY KEY,
    email_matricula VARCHAR(150) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome_completo VARCHAR(150) NOT NULL,
    data_nascimento DATE NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    foto_avatar_url TEXT,
    tipo_deficiencia VARCHAR(100),
    historico_pontos INT NOT NULL DEFAULT 0 CHECK (historico_pontos >= 0),
    id_config INT NOT NULL,
    CONSTRAINT fk_aluno_config FOREIGN KEY (id_config) 
        REFERENCES configuracoes_acessibilidade (id_config) 
        ON DELETE RESTRICT ON UPDATE CASCADE
);

-- 5. Tabela turma
CREATE TABLE turma (
    codigo_turma VARCHAR(20) PRIMARY KEY,
    nome_turma VARCHAR(100) NOT NULL,
    serie_ano VARCHAR(50) NOT NULL,
    disciplina VARCHAR(100) NOT NULL,
    turno VARCHAR(20) NOT NULL,
    ano_letivo INT NOT NULL CHECK (ano_letivo >= 2020),
    capacidade_maxima INT NOT NULL CHECK (capacidade_maxima > 0),
    status_turma VARCHAR(20) NOT NULL DEFAULT 'ativa',
    email_professor VARCHAR(150) NOT NULL,
    CONSTRAINT fk_turma_professor FOREIGN KEY (email_professor) 
        REFERENCES professor (email) 
        ON DELETE RESTRICT ON UPDATE CASCADE
);


-- 6. Tabela aluno_turma (Matrícula N:M)
CREATE TABLE aluno_turma (
    cpf_aluno VARCHAR(11) NOT NULL,
    codigo_turma VARCHAR(20) NOT NULL,
    PRIMARY KEY (cpf_aluno, codigo_turma),
    CONSTRAINT fk_alunoturma_aluno FOREIGN KEY (cpf_aluno) 
        REFERENCES aluno (cpf_aluno) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_alunoturma_turma FOREIGN KEY (codigo_turma) 
        REFERENCES turma (codigo_turma) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 7. Tabela pei_plano_individual
CREATE TABLE pei_plano_individual (
    id_pei SERIAL PRIMARY KEY,
    cpf_aluno VARCHAR(11) NOT NULL,
    objetivos_pedagogicos TEXT NOT NULL,
    atendimentos_especializados TEXT,
    data_criacao DATE NOT NULL DEFAULT CURRENT_DATE,
    data_revisao DATE,
    status_pei VARCHAR(30) NOT NULL DEFAULT 'em_andamento',
    CONSTRAINT fk_pei_aluno FOREIGN KEY (cpf_aluno) 
        REFERENCES aluno (cpf_aluno) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 8. Tabela atividade
CREATE TABLE atividade (
    id_atividade SERIAL PRIMARY KEY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    tipo_atividade VARCHAR(50) NOT NULL,
    data_hora_abertura TIMESTAMP NOT NULL,
    data_hora_entrega TIMESTAMP NOT NULL,
    nota_maxima DECIMAL(4,2) NOT NULL CHECK (nota_maxima > 0),
    recursos_acessibilidade TEXT,
    anexos TEXT,
    codigo_turma VARCHAR(20) NOT NULL,
    CONSTRAINT fk_atividade_turma FOREIGN KEY (codigo_turma) 
        REFERENCES turma (codigo_turma) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_prazo_atividade CHECK (data_hora_entrega > data_hora_abertura)
);

-- 9. Tabela mural_recados
CREATE TABLE mural_recados (
    id_mural SERIAL PRIMARY KEY,
    codigo_turma VARCHAR(20) NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    mensagem TEXT NOT NULL,
    data_postagem DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_mural_turma FOREIGN KEY (codigo_turma) 
        REFERENCES turma (codigo_turma) 
        ON DELETE CASCADE ON UPDATE CASCADE
);


-- 10. Tabela resposta_atividade
CREATE TABLE resposta_atividade (
    id_resposta SERIAL PRIMARY KEY,
    data_hora_inicio TIMESTAMP NOT NULL,
    data_hora_entrega TIMESTAMP NOT NULL,
    resposta_selecionada TEXT NOT NULL,
    nota_obtida DECIMAL(4,2) CHECK (nota_obtida >= 0),
    cpf_aluno VARCHAR(11) NOT NULL,
    id_atividade INT NOT NULL,
    CONSTRAINT fk_resposta_aluno FOREIGN KEY (cpf_aluno) 
        REFERENCES aluno (cpf_aluno) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_resposta_atividade FOREIGN KEY (id_atividade) 
        REFERENCES atividade (id_atividade) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT chk_duracao_resposta CHECK (data_hora_entrega >= data_hora_inicio)
);

-- 11. Tabela sugestao_ia_pedagogica
CREATE TABLE sugestao_ia_pedagogica (
    id_sugestao SERIAL PRIMARY KEY,
    cpf_aluno VARCHAR(11) NOT NULL,
    email_professor VARCHAR(150) NOT NULL,
    diagnostico_desempenho TEXT NOT NULL,
    sugestao_conduta TEXT NOT NULL,
    alerta_risco VARCHAR(100),
    data_geracao DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_sugestaoia_aluno FOREIGN KEY (cpf_aluno) 
        REFERENCES aluno (cpf_aluno) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_sugestaoia_professor FOREIGN KEY (email_professor) 
        REFERENCES professor (email) 
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- 12. Tabela observacao_pedagogica
CREATE TABLE observacao_pedagogica (
    id_observacao SERIAL PRIMARY KEY,
    cpf_aluno VARCHAR(11) NOT NULL,
    email_professor VARCHAR(150) NOT NULL,
    texto_observacao TEXT NOT NULL,
    data_registro DATE NOT NULL DEFAULT CURRENT_DATE,
    CONSTRAINT fk_obs_aluno FOREIGN KEY (cpf_aluno) 
        REFERENCES aluno (cpf_aluno) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_obs_professor FOREIGN KEY (email_professor) 
        REFERENCES professor (email) 
        ON DELETE CASCADE ON UPDATE CASCADE
);
