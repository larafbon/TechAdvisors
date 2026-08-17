--
-- PostgreSQL database dump
--

\restrict ZoJL7E2zHn8Mfj6PLEK9VeR0f7MRNpwKMszl27ybfRhuCzQJyH7MjBs6o91q9He

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alternativas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alternativas (
    id integer NOT NULL,
    questao_id integer NOT NULL,
    texto_alternativa text NOT NULL,
    is_correta boolean DEFAULT false
);


ALTER TABLE public.alternativas OWNER TO postgres;

--
-- Name: alternativas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.alternativas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.alternativas_id_seq OWNER TO postgres;

--
-- Name: alternativas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.alternativas_id_seq OWNED BY public.alternativas.id;


--
-- Name: cards_memorizacao_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.cards_memorizacao_usuario (
    id integer NOT NULL,
    deck_id integer NOT NULL,
    frente text NOT NULL,
    verso text NOT NULL,
    proxima_revisao date DEFAULT CURRENT_DATE
);


ALTER TABLE public.cards_memorizacao_usuario OWNER TO postgres;

--
-- Name: cards_memorizacao_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.cards_memorizacao_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.cards_memorizacao_usuario_id_seq OWNER TO postgres;

--
-- Name: cards_memorizacao_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.cards_memorizacao_usuario_id_seq OWNED BY public.cards_memorizacao_usuario.id;


--
-- Name: conquistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conquistas (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    descricao text NOT NULL,
    icone_url character varying(255),
    pontos integer DEFAULT 10
);


ALTER TABLE public.conquistas OWNER TO postgres;

--
-- Name: conquistas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conquistas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conquistas_id_seq OWNER TO postgres;

--
-- Name: conquistas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conquistas_id_seq OWNED BY public.conquistas.id;


--
-- Name: conquistas_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conquistas_usuario (
    usuario_id integer NOT NULL,
    conquista_id integer NOT NULL,
    desbloqueado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.conquistas_usuario OWNER TO postgres;

--
-- Name: conteudos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conteudos (
    id integer NOT NULL,
    titulo character varying(150) NOT NULL,
    tipo character varying(50) NOT NULL,
    corpo_texto text,
    url_midia character varying(255),
    transcricao_audio text
);


ALTER TABLE public.conteudos OWNER TO postgres;

--
-- Name: conteudos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.conteudos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.conteudos_id_seq OWNER TO postgres;

--
-- Name: conteudos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.conteudos_id_seq OWNED BY public.conteudos.id;


--
-- Name: conteudos_licao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.conteudos_licao (
    licao_id integer NOT NULL,
    conteudo_id integer NOT NULL,
    ordem integer DEFAULT 1
);


ALTER TABLE public.conteudos_licao OWNER TO postgres;

--
-- Name: decks_flashcards_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.decks_flashcards_usuario (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    titulo character varying(150) NOT NULL,
    descricao text,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.decks_flashcards_usuario OWNER TO postgres;

--
-- Name: decks_flashcards_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.decks_flashcards_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.decks_flashcards_usuario_id_seq OWNER TO postgres;

--
-- Name: decks_flashcards_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.decks_flashcards_usuario_id_seq OWNED BY public.decks_flashcards_usuario.id;


--
-- Name: feedback_acessibilidade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.feedback_acessibilidade (
    id integer NOT NULL,
    usuario_id integer,
    pagina_url character varying(255) NOT NULL,
    comentario text NOT NULL,
    nota integer,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT feedback_acessibilidade_nota_check CHECK (((nota >= 1) AND (nota <= 5)))
);


ALTER TABLE public.feedback_acessibilidade OWNER TO postgres;

--
-- Name: feedback_acessibilidade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.feedback_acessibilidade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.feedback_acessibilidade_id_seq OWNER TO postgres;

--
-- Name: feedback_acessibilidade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.feedback_acessibilidade_id_seq OWNED BY public.feedback_acessibilidade.id;


--
-- Name: forum_respostas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forum_respostas (
    id integer NOT NULL,
    topico_id integer NOT NULL,
    autor_id integer NOT NULL,
    resposta text NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.forum_respostas OWNER TO postgres;

--
-- Name: forum_respostas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.forum_respostas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_respostas_id_seq OWNER TO postgres;

--
-- Name: forum_respostas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.forum_respostas_id_seq OWNED BY public.forum_respostas.id;


--
-- Name: forum_topicos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.forum_topicos (
    id integer NOT NULL,
    autor_id integer NOT NULL,
    titulo character varying(200) NOT NULL,
    conteudo text NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.forum_topicos OWNER TO postgres;

--
-- Name: forum_topicos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.forum_topicos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.forum_topicos_id_seq OWNER TO postgres;

--
-- Name: forum_topicos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.forum_topicos_id_seq OWNED BY public.forum_topicos.id;


--
-- Name: licoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.licoes (
    id integer NOT NULL,
    modulo_id integer NOT NULL,
    titulo character varying(150) NOT NULL,
    ordem integer DEFAULT 1,
    duracao_estimada_minutos integer DEFAULT 15
);


ALTER TABLE public.licoes OWNER TO postgres;

--
-- Name: licoes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.licoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.licoes_id_seq OWNER TO postgres;

--
-- Name: licoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.licoes_id_seq OWNED BY public.licoes.id;


--
-- Name: logs_acessibilidade_ia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs_acessibilidade_ia (
    id bigint NOT NULL,
    usuario_id integer NOT NULL,
    recurso_acessibilidade_utilizado character varying(100) NOT NULL,
    acao_usuario character varying(50) NOT NULL,
    tempo_uso_segundos integer,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.logs_acessibilidade_ia OWNER TO postgres;

--
-- Name: logs_acessibilidade_ia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_acessibilidade_ia_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_acessibilidade_ia_id_seq OWNER TO postgres;

--
-- Name: logs_acessibilidade_ia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_acessibilidade_ia_id_seq OWNED BY public.logs_acessibilidade_ia.id;


--
-- Name: logs_aprendizado_ia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.logs_aprendizado_ia (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    acao_recomendada character varying(150) NOT NULL,
    justificativa_ia text,
    gerado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.logs_aprendizado_ia OWNER TO postgres;

--
-- Name: logs_aprendizado_ia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.logs_aprendizado_ia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.logs_aprendizado_ia_id_seq OWNER TO postgres;

--
-- Name: logs_aprendizado_ia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.logs_aprendizado_ia_id_seq OWNED BY public.logs_aprendizado_ia.id;


--
-- Name: mapeamento_revisao_ia; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mapeamento_revisao_ia (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    licao_id integer NOT NULL,
    prioridade integer DEFAULT 1,
    data_sugerida_revisao date NOT NULL
);


ALTER TABLE public.mapeamento_revisao_ia OWNER TO postgres;

--
-- Name: mapeamento_revisao_ia_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mapeamento_revisao_ia_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mapeamento_revisao_ia_id_seq OWNER TO postgres;

--
-- Name: mapeamento_revisao_ia_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mapeamento_revisao_ia_id_seq OWNED BY public.mapeamento_revisao_ia.id;


--
-- Name: materias; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.materias (
    id integer NOT NULL,
    nome character varying(150) NOT NULL,
    descricao text,
    ordem integer DEFAULT 1
);


ALTER TABLE public.materias OWNER TO postgres;

--
-- Name: materias_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.materias_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.materias_id_seq OWNER TO postgres;

--
-- Name: materias_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.materias_id_seq OWNED BY public.materias.id;


--
-- Name: matriculas_turma; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.matriculas_turma (
    aluno_id integer NOT NULL,
    turma_id integer NOT NULL,
    data_matricula timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status character varying(50) DEFAULT 'ativo'::character varying
);


ALTER TABLE public.matriculas_turma OWNER TO postgres;

--
-- Name: modulos; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.modulos (
    id integer NOT NULL,
    materia_id integer NOT NULL,
    titulo character varying(150) NOT NULL,
    descricao text,
    ordem integer DEFAULT 1
);


ALTER TABLE public.modulos OWNER TO postgres;

--
-- Name: modulos_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.modulos_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.modulos_id_seq OWNER TO postgres;

--
-- Name: modulos_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.modulos_id_seq OWNED BY public.modulos.id;


--
-- Name: necessidades_especiais; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.necessidades_especiais (
    id_necessidade integer NOT NULL,
    nome character varying(100) NOT NULL,
    descricao text,
    codigo_cid character varying(20)
);


ALTER TABLE public.necessidades_especiais OWNER TO postgres;

--
-- Name: necessidades_especiais_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.necessidades_especiais_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.necessidades_especiais_id_seq OWNER TO postgres;

--
-- Name: necessidades_especiais_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.necessidades_especiais_id_seq OWNED BY public.necessidades_especiais.id_necessidade;


--
-- Name: notificacoes_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notificacoes_usuario (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    titulo character varying(150) NOT NULL,
    mensagem text NOT NULL,
    lida boolean DEFAULT false,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notificacoes_usuario OWNER TO postgres;

--
-- Name: notificacoes_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notificacoes_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notificacoes_usuario_id_seq OWNER TO postgres;

--
-- Name: notificacoes_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notificacoes_usuario_id_seq OWNED BY public.notificacoes_usuario.id;


--
-- Name: perfis_acessibilidade; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.perfis_acessibilidade (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    alto_contraste boolean DEFAULT false,
    tamanho_fonte character varying(20) DEFAULT 'padrao'::character varying,
    ativar_vlibras boolean DEFAULT false,
    leitor_tela_nativo boolean DEFAULT false,
    reduzir_animacoes boolean DEFAULT false,
    fonte_dislexia boolean DEFAULT false,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.perfis_acessibilidade OWNER TO postgres;

--
-- Name: perfis_acessibilidade_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.perfis_acessibilidade_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.perfis_acessibilidade_id_seq OWNER TO postgres;

--
-- Name: perfis_acessibilidade_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.perfis_acessibilidade_id_seq OWNED BY public.perfis_acessibilidade.id;


--
-- Name: progresso_gamificacao; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progresso_gamificacao (
    usuario_id integer NOT NULL,
    pontos_xp integer DEFAULT 0,
    nivel integer DEFAULT 1,
    dias_ofensiva integer DEFAULT 0,
    ultima_atividade date DEFAULT CURRENT_DATE
);


ALTER TABLE public.progresso_gamificacao OWNER TO postgres;

--
-- Name: progresso_licoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.progresso_licoes (
    usuario_id integer NOT NULL,
    licao_id integer NOT NULL,
    concluido boolean DEFAULT false,
    data_conclusao timestamp without time zone
);


ALTER TABLE public.progresso_licoes OWNER TO postgres;

--
-- Name: questoes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.questoes (
    id integer NOT NULL,
    quiz_id integer NOT NULL,
    enunciado text NOT NULL,
    dica_acessivel text
);


ALTER TABLE public.questoes OWNER TO postgres;

--
-- Name: questoes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.questoes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.questoes_id_seq OWNER TO postgres;

--
-- Name: questoes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.questoes_id_seq OWNED BY public.questoes.id;


--
-- Name: quizzes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quizzes (
    id integer NOT NULL,
    licao_id integer NOT NULL,
    titulo character varying(150) NOT NULL,
    descricao text
);


ALTER TABLE public.quizzes OWNER TO postgres;

--
-- Name: quizzes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quizzes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quizzes_id_seq OWNER TO postgres;

--
-- Name: quizzes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quizzes_id_seq OWNED BY public.quizzes.id;


--
-- Name: recompensas_conquistas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.recompensas_conquistas (
    id integer NOT NULL,
    conquista_id integer NOT NULL,
    tipo_recompensa character varying(50) NOT NULL,
    valor_recompensa character varying(255) NOT NULL
);


ALTER TABLE public.recompensas_conquistas OWNER TO postgres;

--
-- Name: recompensas_conquistas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.recompensas_conquistas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.recompensas_conquistas_id_seq OWNER TO postgres;

--
-- Name: recompensas_conquistas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.recompensas_conquistas_id_seq OWNED BY public.recompensas_conquistas.id;


--
-- Name: respostas_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.respostas_usuario (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    questao_id integer NOT NULL,
    alternativa_id integer,
    resposta_dissertativa text,
    acertou boolean,
    respondido_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.respostas_usuario OWNER TO postgres;

--
-- Name: respostas_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.respostas_usuario_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.respostas_usuario_id_seq OWNER TO postgres;

--
-- Name: respostas_usuario_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.respostas_usuario_id_seq OWNED BY public.respostas_usuario.id;


--
-- Name: sessoes_estudo; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessoes_estudo (
    id integer NOT NULL,
    usuario_id integer NOT NULL,
    inicio timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    fim timestamp without time zone,
    duracao_segundos integer
);


ALTER TABLE public.sessoes_estudo OWNER TO postgres;

--
-- Name: sessoes_estudo_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sessoes_estudo_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sessoes_estudo_id_seq OWNER TO postgres;

--
-- Name: sessoes_estudo_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessoes_estudo_id_seq OWNED BY public.sessoes_estudo.id;


--
-- Name: turmas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.turmas (
    id integer NOT NULL,
    nome character varying(100) NOT NULL,
    ano_letivo integer NOT NULL,
    descricao text,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.turmas OWNER TO postgres;

--
-- Name: turmas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.turmas_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.turmas_id_seq OWNER TO postgres;

--
-- Name: turmas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.turmas_id_seq OWNED BY public.turmas.id;


--
-- Name: usuario_necessidades_especiais; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuario_necessidades_especiais (
    usuario_id integer NOT NULL,
    necessidade_id integer NOT NULL,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuario_necessidades_especiais OWNER TO postgres;

--
-- Name: usuarios; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usuarios (
    id integer NOT NULL,
    nome character varying(150) NOT NULL,
    email character varying(150) NOT NULL,
    senha_hash character varying(255) NOT NULL,
    tipo character varying(50) NOT NULL,
    data_nascimento date,
    ativo boolean DEFAULT true,
    criado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    atualizado_em timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.usuarios OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usuarios_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.usuarios_id_seq OWNER TO postgres;

--
-- Name: usuarios_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usuarios_id_seq OWNED BY public.usuarios.id;


--
-- Name: alternativas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alternativas ALTER COLUMN id SET DEFAULT nextval('public.alternativas_id_seq'::regclass);


--
-- Name: cards_memorizacao_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cards_memorizacao_usuario ALTER COLUMN id SET DEFAULT nextval('public.cards_memorizacao_usuario_id_seq'::regclass);


--
-- Name: conquistas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conquistas ALTER COLUMN id SET DEFAULT nextval('public.conquistas_id_seq'::regclass);


--
-- Name: conteudos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteudos ALTER COLUMN id SET DEFAULT nextval('public.conteudos_id_seq'::regclass);


--
-- Name: decks_flashcards_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decks_flashcards_usuario ALTER COLUMN id SET DEFAULT nextval('public.decks_flashcards_usuario_id_seq'::regclass);


--
-- Name: feedback_acessibilidade id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback_acessibilidade ALTER COLUMN id SET DEFAULT nextval('public.feedback_acessibilidade_id_seq'::regclass);


--
-- Name: forum_respostas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_respostas ALTER COLUMN id SET DEFAULT nextval('public.forum_respostas_id_seq'::regclass);


--
-- Name: forum_topicos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_topicos ALTER COLUMN id SET DEFAULT nextval('public.forum_topicos_id_seq'::regclass);


--
-- Name: licoes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licoes ALTER COLUMN id SET DEFAULT nextval('public.licoes_id_seq'::regclass);


--
-- Name: logs_acessibilidade_ia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_acessibilidade_ia ALTER COLUMN id SET DEFAULT nextval('public.logs_acessibilidade_ia_id_seq'::regclass);


--
-- Name: logs_aprendizado_ia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_aprendizado_ia ALTER COLUMN id SET DEFAULT nextval('public.logs_aprendizado_ia_id_seq'::regclass);


--
-- Name: mapeamento_revisao_ia id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapeamento_revisao_ia ALTER COLUMN id SET DEFAULT nextval('public.mapeamento_revisao_ia_id_seq'::regclass);


--
-- Name: materias id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias ALTER COLUMN id SET DEFAULT nextval('public.materias_id_seq'::regclass);


--
-- Name: modulos id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulos ALTER COLUMN id SET DEFAULT nextval('public.modulos_id_seq'::regclass);


--
-- Name: necessidades_especiais id_necessidade; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.necessidades_especiais ALTER COLUMN id_necessidade SET DEFAULT nextval('public.necessidades_especiais_id_seq'::regclass);


--
-- Name: notificacoes_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes_usuario ALTER COLUMN id SET DEFAULT nextval('public.notificacoes_usuario_id_seq'::regclass);


--
-- Name: perfis_acessibilidade id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis_acessibilidade ALTER COLUMN id SET DEFAULT nextval('public.perfis_acessibilidade_id_seq'::regclass);


--
-- Name: questoes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questoes ALTER COLUMN id SET DEFAULT nextval('public.questoes_id_seq'::regclass);


--
-- Name: quizzes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes ALTER COLUMN id SET DEFAULT nextval('public.quizzes_id_seq'::regclass);


--
-- Name: recompensas_conquistas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recompensas_conquistas ALTER COLUMN id SET DEFAULT nextval('public.recompensas_conquistas_id_seq'::regclass);


--
-- Name: respostas_usuario id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respostas_usuario ALTER COLUMN id SET DEFAULT nextval('public.respostas_usuario_id_seq'::regclass);


--
-- Name: sessoes_estudo id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessoes_estudo ALTER COLUMN id SET DEFAULT nextval('public.sessoes_estudo_id_seq'::regclass);


--
-- Name: turmas id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turmas ALTER COLUMN id SET DEFAULT nextval('public.turmas_id_seq'::regclass);


--
-- Name: usuarios id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios ALTER COLUMN id SET DEFAULT nextval('public.usuarios_id_seq'::regclass);


--
-- Data for Name: alternativas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alternativas (id, questao_id, texto_alternativa, is_correta) FROM stdin;
\.


--
-- Data for Name: cards_memorizacao_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.cards_memorizacao_usuario (id, deck_id, frente, verso, proxima_revisao) FROM stdin;
\.


--
-- Data for Name: conquistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conquistas (id, nome, descricao, icone_url, pontos) FROM stdin;
\.


--
-- Data for Name: conquistas_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conquistas_usuario (usuario_id, conquista_id, desbloqueado_em) FROM stdin;
\.


--
-- Data for Name: conteudos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conteudos (id, titulo, tipo, corpo_texto, url_midia, transcricao_audio) FROM stdin;
\.


--
-- Data for Name: conteudos_licao; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.conteudos_licao (licao_id, conteudo_id, ordem) FROM stdin;
\.


--
-- Data for Name: decks_flashcards_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.decks_flashcards_usuario (id, usuario_id, titulo, descricao, criado_em) FROM stdin;
\.


--
-- Data for Name: feedback_acessibilidade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.feedback_acessibilidade (id, usuario_id, pagina_url, comentario, nota, criado_em) FROM stdin;
\.


--
-- Data for Name: forum_respostas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forum_respostas (id, topico_id, autor_id, resposta, criado_em) FROM stdin;
\.


--
-- Data for Name: forum_topicos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.forum_topicos (id, autor_id, titulo, conteudo, criado_em) FROM stdin;
\.


--
-- Data for Name: licoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.licoes (id, modulo_id, titulo, ordem, duracao_estimada_minutos) FROM stdin;
\.


--
-- Data for Name: logs_acessibilidade_ia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs_acessibilidade_ia (id, usuario_id, recurso_acessibilidade_utilizado, acao_usuario, tempo_uso_segundos, criado_em) FROM stdin;
\.


--
-- Data for Name: logs_aprendizado_ia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.logs_aprendizado_ia (id, usuario_id, acao_recomendada, justificativa_ia, gerado_em) FROM stdin;
\.


--
-- Data for Name: mapeamento_revisao_ia; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mapeamento_revisao_ia (id, usuario_id, licao_id, prioridade, data_sugerida_revisao) FROM stdin;
\.


--
-- Data for Name: materias; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.materias (id, nome, descricao, ordem) FROM stdin;
\.


--
-- Data for Name: matriculas_turma; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.matriculas_turma (aluno_id, turma_id, data_matricula, status) FROM stdin;
\.


--
-- Data for Name: modulos; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.modulos (id, materia_id, titulo, descricao, ordem) FROM stdin;
\.


--
-- Data for Name: necessidades_especiais; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.necessidades_especiais (id_necessidade, nome, descricao, codigo_cid) FROM stdin;
\.


--
-- Data for Name: notificacoes_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notificacoes_usuario (id, usuario_id, titulo, mensagem, lida, criado_em) FROM stdin;
\.


--
-- Data for Name: perfis_acessibilidade; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.perfis_acessibilidade (id, usuario_id, alto_contraste, tamanho_fonte, ativar_vlibras, leitor_tela_nativo, reduzir_animacoes, fonte_dislexia, criado_em) FROM stdin;
\.


--
-- Data for Name: progresso_gamificacao; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progresso_gamificacao (usuario_id, pontos_xp, nivel, dias_ofensiva, ultima_atividade) FROM stdin;
\.


--
-- Data for Name: progresso_licoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.progresso_licoes (usuario_id, licao_id, concluido, data_conclusao) FROM stdin;
\.


--
-- Data for Name: questoes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.questoes (id, quiz_id, enunciado, dica_acessivel) FROM stdin;
\.


--
-- Data for Name: quizzes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quizzes (id, licao_id, titulo, descricao) FROM stdin;
\.


--
-- Data for Name: recompensas_conquistas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.recompensas_conquistas (id, conquista_id, tipo_recompensa, valor_recompensa) FROM stdin;
\.


--
-- Data for Name: respostas_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.respostas_usuario (id, usuario_id, questao_id, alternativa_id, resposta_dissertativa, acertou, respondido_em) FROM stdin;
\.


--
-- Data for Name: sessoes_estudo; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sessoes_estudo (id, usuario_id, inicio, fim, duracao_segundos) FROM stdin;
\.


--
-- Data for Name: turmas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.turmas (id, nome, ano_letivo, descricao, criado_em) FROM stdin;
\.


--
-- Data for Name: usuario_necessidades_especiais; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuario_necessidades_especiais (usuario_id, necessidade_id, criado_em) FROM stdin;
\.


--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.usuarios (id, nome, email, senha_hash, tipo, data_nascimento, ativo, criado_em, atualizado_em) FROM stdin;
\.


--
-- Name: alternativas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.alternativas_id_seq', 1, false);


--
-- Name: cards_memorizacao_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.cards_memorizacao_usuario_id_seq', 1, false);


--
-- Name: conquistas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conquistas_id_seq', 1, false);


--
-- Name: conteudos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.conteudos_id_seq', 1, false);


--
-- Name: decks_flashcards_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.decks_flashcards_usuario_id_seq', 1, false);


--
-- Name: feedback_acessibilidade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.feedback_acessibilidade_id_seq', 1, false);


--
-- Name: forum_respostas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.forum_respostas_id_seq', 1, false);


--
-- Name: forum_topicos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.forum_topicos_id_seq', 1, false);


--
-- Name: licoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.licoes_id_seq', 1, false);


--
-- Name: logs_acessibilidade_ia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_acessibilidade_ia_id_seq', 1, false);


--
-- Name: logs_aprendizado_ia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.logs_aprendizado_ia_id_seq', 1, false);


--
-- Name: mapeamento_revisao_ia_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mapeamento_revisao_ia_id_seq', 1, false);


--
-- Name: materias_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.materias_id_seq', 1, false);


--
-- Name: modulos_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.modulos_id_seq', 1, false);


--
-- Name: necessidades_especiais_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.necessidades_especiais_id_seq', 1, false);


--
-- Name: notificacoes_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notificacoes_usuario_id_seq', 1, false);


--
-- Name: perfis_acessibilidade_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.perfis_acessibilidade_id_seq', 1, false);


--
-- Name: questoes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.questoes_id_seq', 1, false);


--
-- Name: quizzes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quizzes_id_seq', 1, false);


--
-- Name: recompensas_conquistas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.recompensas_conquistas_id_seq', 1, false);


--
-- Name: respostas_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.respostas_usuario_id_seq', 1, false);


--
-- Name: sessoes_estudo_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sessoes_estudo_id_seq', 1, false);


--
-- Name: turmas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.turmas_id_seq', 1, false);


--
-- Name: usuarios_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usuarios_id_seq', 1, false);


--
-- Name: alternativas alternativas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alternativas
    ADD CONSTRAINT alternativas_pkey PRIMARY KEY (id);


--
-- Name: cards_memorizacao_usuario cards_memorizacao_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cards_memorizacao_usuario
    ADD CONSTRAINT cards_memorizacao_usuario_pkey PRIMARY KEY (id);


--
-- Name: conquistas conquistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conquistas
    ADD CONSTRAINT conquistas_pkey PRIMARY KEY (id);


--
-- Name: conquistas_usuario conquistas_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conquistas_usuario
    ADD CONSTRAINT conquistas_usuario_pkey PRIMARY KEY (usuario_id, conquista_id);


--
-- Name: conteudos_licao conteudos_licao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteudos_licao
    ADD CONSTRAINT conteudos_licao_pkey PRIMARY KEY (licao_id, conteudo_id);


--
-- Name: conteudos conteudos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteudos
    ADD CONSTRAINT conteudos_pkey PRIMARY KEY (id);


--
-- Name: decks_flashcards_usuario decks_flashcards_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decks_flashcards_usuario
    ADD CONSTRAINT decks_flashcards_usuario_pkey PRIMARY KEY (id);


--
-- Name: feedback_acessibilidade feedback_acessibilidade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback_acessibilidade
    ADD CONSTRAINT feedback_acessibilidade_pkey PRIMARY KEY (id);


--
-- Name: forum_respostas forum_respostas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_respostas
    ADD CONSTRAINT forum_respostas_pkey PRIMARY KEY (id);


--
-- Name: forum_topicos forum_topicos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_topicos
    ADD CONSTRAINT forum_topicos_pkey PRIMARY KEY (id);


--
-- Name: licoes licoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licoes
    ADD CONSTRAINT licoes_pkey PRIMARY KEY (id);


--
-- Name: logs_acessibilidade_ia logs_acessibilidade_ia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_acessibilidade_ia
    ADD CONSTRAINT logs_acessibilidade_ia_pkey PRIMARY KEY (id);


--
-- Name: logs_aprendizado_ia logs_aprendizado_ia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_aprendizado_ia
    ADD CONSTRAINT logs_aprendizado_ia_pkey PRIMARY KEY (id);


--
-- Name: mapeamento_revisao_ia mapeamento_revisao_ia_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapeamento_revisao_ia
    ADD CONSTRAINT mapeamento_revisao_ia_pkey PRIMARY KEY (id);


--
-- Name: materias materias_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.materias
    ADD CONSTRAINT materias_pkey PRIMARY KEY (id);


--
-- Name: matriculas_turma matriculas_turma_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matriculas_turma
    ADD CONSTRAINT matriculas_turma_pkey PRIMARY KEY (aluno_id, turma_id);


--
-- Name: modulos modulos_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_pkey PRIMARY KEY (id);


--
-- Name: necessidades_especiais necessidades_especiais_nome_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.necessidades_especiais
    ADD CONSTRAINT necessidades_especiais_nome_key UNIQUE (nome);


--
-- Name: necessidades_especiais necessidades_especiais_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.necessidades_especiais
    ADD CONSTRAINT necessidades_especiais_pkey PRIMARY KEY (id_necessidade);


--
-- Name: notificacoes_usuario notificacoes_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes_usuario
    ADD CONSTRAINT notificacoes_usuario_pkey PRIMARY KEY (id);


--
-- Name: perfis_acessibilidade perfis_acessibilidade_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis_acessibilidade
    ADD CONSTRAINT perfis_acessibilidade_pkey PRIMARY KEY (id);


--
-- Name: perfis_acessibilidade perfis_acessibilidade_usuario_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis_acessibilidade
    ADD CONSTRAINT perfis_acessibilidade_usuario_id_key UNIQUE (usuario_id);


--
-- Name: progresso_gamificacao progresso_gamificacao_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresso_gamificacao
    ADD CONSTRAINT progresso_gamificacao_pkey PRIMARY KEY (usuario_id);


--
-- Name: progresso_licoes progresso_licoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresso_licoes
    ADD CONSTRAINT progresso_licoes_pkey PRIMARY KEY (usuario_id, licao_id);


--
-- Name: questoes questoes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questoes
    ADD CONSTRAINT questoes_pkey PRIMARY KEY (id);


--
-- Name: quizzes quizzes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_pkey PRIMARY KEY (id);


--
-- Name: recompensas_conquistas recompensas_conquistas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recompensas_conquistas
    ADD CONSTRAINT recompensas_conquistas_pkey PRIMARY KEY (id);


--
-- Name: respostas_usuario respostas_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respostas_usuario
    ADD CONSTRAINT respostas_usuario_pkey PRIMARY KEY (id);


--
-- Name: sessoes_estudo sessoes_estudo_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessoes_estudo
    ADD CONSTRAINT sessoes_estudo_pkey PRIMARY KEY (id);


--
-- Name: turmas turmas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.turmas
    ADD CONSTRAINT turmas_pkey PRIMARY KEY (id);


--
-- Name: usuario_necessidades_especiais usuario_necessidades_especiais_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_necessidades_especiais
    ADD CONSTRAINT usuario_necessidades_especiais_pkey PRIMARY KEY (usuario_id, necessidade_id);


--
-- Name: usuarios usuarios_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_email_key UNIQUE (email);


--
-- Name: usuarios usuarios_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuarios
    ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);


--
-- Name: alternativas alternativas_questao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alternativas
    ADD CONSTRAINT alternativas_questao_id_fkey FOREIGN KEY (questao_id) REFERENCES public.questoes(id) ON DELETE CASCADE;


--
-- Name: cards_memorizacao_usuario cards_memorizacao_usuario_deck_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.cards_memorizacao_usuario
    ADD CONSTRAINT cards_memorizacao_usuario_deck_id_fkey FOREIGN KEY (deck_id) REFERENCES public.decks_flashcards_usuario(id) ON DELETE CASCADE;


--
-- Name: conquistas_usuario conquistas_usuario_conquista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conquistas_usuario
    ADD CONSTRAINT conquistas_usuario_conquista_id_fkey FOREIGN KEY (conquista_id) REFERENCES public.conquistas(id) ON DELETE CASCADE;


--
-- Name: conquistas_usuario conquistas_usuario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conquistas_usuario
    ADD CONSTRAINT conquistas_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: conteudos_licao conteudos_licao_conteudo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteudos_licao
    ADD CONSTRAINT conteudos_licao_conteudo_id_fkey FOREIGN KEY (conteudo_id) REFERENCES public.conteudos(id) ON DELETE CASCADE;


--
-- Name: conteudos_licao conteudos_licao_licao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.conteudos_licao
    ADD CONSTRAINT conteudos_licao_licao_id_fkey FOREIGN KEY (licao_id) REFERENCES public.licoes(id) ON DELETE CASCADE;


--
-- Name: decks_flashcards_usuario decks_flashcards_usuario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.decks_flashcards_usuario
    ADD CONSTRAINT decks_flashcards_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: feedback_acessibilidade feedback_acessibilidade_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.feedback_acessibilidade
    ADD CONSTRAINT feedback_acessibilidade_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE SET NULL;


--
-- Name: forum_respostas forum_respostas_autor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_respostas
    ADD CONSTRAINT forum_respostas_autor_id_fkey FOREIGN KEY (autor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: forum_respostas forum_respostas_topico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_respostas
    ADD CONSTRAINT forum_respostas_topico_id_fkey FOREIGN KEY (topico_id) REFERENCES public.forum_topicos(id) ON DELETE CASCADE;


--
-- Name: forum_topicos forum_topicos_autor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.forum_topicos
    ADD CONSTRAINT forum_topicos_autor_id_fkey FOREIGN KEY (autor_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: licoes licoes_modulo_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.licoes
    ADD CONSTRAINT licoes_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES public.modulos(id) ON DELETE CASCADE;


--
-- Name: logs_acessibilidade_ia logs_acessibilidade_ia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_acessibilidade_ia
    ADD CONSTRAINT logs_acessibilidade_ia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: logs_aprendizado_ia logs_aprendizado_ia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.logs_aprendizado_ia
    ADD CONSTRAINT logs_aprendizado_ia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: mapeamento_revisao_ia mapeamento_revisao_ia_licao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapeamento_revisao_ia
    ADD CONSTRAINT mapeamento_revisao_ia_licao_id_fkey FOREIGN KEY (licao_id) REFERENCES public.licoes(id) ON DELETE CASCADE;


--
-- Name: mapeamento_revisao_ia mapeamento_revisao_ia_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mapeamento_revisao_ia
    ADD CONSTRAINT mapeamento_revisao_ia_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: matriculas_turma matriculas_turma_aluno_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matriculas_turma
    ADD CONSTRAINT matriculas_turma_aluno_id_fkey FOREIGN KEY (aluno_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: matriculas_turma matriculas_turma_turma_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.matriculas_turma
    ADD CONSTRAINT matriculas_turma_turma_id_fkey FOREIGN KEY (turma_id) REFERENCES public.turmas(id) ON DELETE CASCADE;


--
-- Name: modulos modulos_materia_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.modulos
    ADD CONSTRAINT modulos_materia_id_fkey FOREIGN KEY (materia_id) REFERENCES public.materias(id) ON DELETE CASCADE;


--
-- Name: notificacoes_usuario notificacoes_usuario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notificacoes_usuario
    ADD CONSTRAINT notificacoes_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: perfis_acessibilidade perfis_acessibilidade_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.perfis_acessibilidade
    ADD CONSTRAINT perfis_acessibilidade_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: progresso_gamificacao progresso_gamificacao_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresso_gamificacao
    ADD CONSTRAINT progresso_gamificacao_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: progresso_licoes progresso_licoes_licao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresso_licoes
    ADD CONSTRAINT progresso_licoes_licao_id_fkey FOREIGN KEY (licao_id) REFERENCES public.licoes(id) ON DELETE CASCADE;


--
-- Name: progresso_licoes progresso_licoes_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.progresso_licoes
    ADD CONSTRAINT progresso_licoes_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: questoes questoes_quiz_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.questoes
    ADD CONSTRAINT questoes_quiz_id_fkey FOREIGN KEY (quiz_id) REFERENCES public.quizzes(id) ON DELETE CASCADE;


--
-- Name: quizzes quizzes_licao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quizzes
    ADD CONSTRAINT quizzes_licao_id_fkey FOREIGN KEY (licao_id) REFERENCES public.licoes(id) ON DELETE CASCADE;


--
-- Name: recompensas_conquistas recompensas_conquistas_conquista_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.recompensas_conquistas
    ADD CONSTRAINT recompensas_conquistas_conquista_id_fkey FOREIGN KEY (conquista_id) REFERENCES public.conquistas(id) ON DELETE CASCADE;


--
-- Name: respostas_usuario respostas_usuario_alternativa_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respostas_usuario
    ADD CONSTRAINT respostas_usuario_alternativa_id_fkey FOREIGN KEY (alternativa_id) REFERENCES public.alternativas(id);


--
-- Name: respostas_usuario respostas_usuario_questao_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respostas_usuario
    ADD CONSTRAINT respostas_usuario_questao_id_fkey FOREIGN KEY (questao_id) REFERENCES public.questoes(id) ON DELETE CASCADE;


--
-- Name: respostas_usuario respostas_usuario_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.respostas_usuario
    ADD CONSTRAINT respostas_usuario_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: sessoes_estudo sessoes_estudo_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessoes_estudo
    ADD CONSTRAINT sessoes_estudo_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- Name: usuario_necessidades_especiais usuario_necessidades_especiais_necessidade_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_necessidades_especiais
    ADD CONSTRAINT usuario_necessidades_especiais_necessidade_id_fkey FOREIGN KEY (necessidade_id) REFERENCES public.necessidades_especiais(id_necessidade) ON DELETE CASCADE;


--
-- Name: usuario_necessidades_especiais usuario_necessidades_especiais_usuario_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usuario_necessidades_especiais
    ADD CONSTRAINT usuario_necessidades_especiais_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.usuarios(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict ZoJL7E2zHn8Mfj6PLEK9VeR0f7MRNpwKMszl27ybfRhuCzQJyH7MjBs6o91q9He

