from pathlib import Path
import pandas as pd

CAMINHO_CSV = Path(__file__).resolve().parent.parent / 'database' / 'dados.csv'


def ler_dados():
    # dados dos alunos
    df = pd.read_csv(CAMINHO_CSV)
    df = pd.read_csv(CAMINHO_CSV, encoding='utf-8')

    colunas = [
        'id_resposta', 'id_aluno', 'nome_completo', 'data_nascimento', 'matricula',
        'tipo_deficiencia', 'nivel_suporte', 'tamanho_fonte', 'sintese_voz',
        'velocidade_audio', 'contraste_cores', 'fonte_dislexia', 'reducao_estimulo',
        'tema_exibicao', 'status_aluno', 'id_turma', 'codigo_turma', 'nome_turma',
        'serie_ano', 'disciplina', 'turno', 'ano_letivo', 'nome_professor',
        'email_professor', 'status_turma', 'id_atividade', 'titulo', 'descricao',
        'tipo_atividade', 'data_hora_abertura', 'data_hora_entrega', 'nota_maxima',
        'recursos_acessibilidade', 'status_atividade', 'data_hora_envio',
        'tempo_gasto_seg', 'tentativa', 'resposta_selecionada', 'nota_obtida',
        'acertos', 'erros', 'recursos_usados', 'status_resposta', 'id_analise',
        'periodo_inicio', 'periodo_fim', 'diagnostico_desempenho',
        'sugestao_conduta', 'alerta_risco', 'media_notas', 'taxa_conclusao',
        'tempo_medio_atividade', 'data_geracao',
    ]
    if not set(colunas).issubset(df.columns):
        raise ValueError('Confira as colunas do CSV.')
    df = df[colunas].copy()
    if df.empty or df.isna().any().any():
        raise ValueError('O CSV está vazio ou contém campos ausentes.')

    # Datas
    colunas_data = ['data_nascimento', 'data_hora_abertura', 'data_hora_entrega',
                    'data_hora_envio', 'periodo_inicio', 'periodo_fim', 'data_geracao']
    for coluna in colunas_data:
        df[coluna] = pd.to_datetime(df[coluna], errors='raise')

    # Booleanos de perfil
    for coluna in ['sintese_voz', 'fonte_dislexia', 'reducao_estimulo']:
        if not df[coluna].isin([True, False]).all():
            df[coluna] = df[coluna].map({True: True, False: False, 'True': True, 'False': False})
        df[coluna] = df[coluna].astype(bool)

    # Numéricos
    colunas_num = ['matricula', 'nivel_suporte', 'tamanho_fonte', 'velocidade_audio',
                   'ano_letivo', 'nota_maxima', 'tempo_gasto_seg', 'tentativa',
                   'nota_obtida', 'acertos', 'erros', 'media_notas',
                   'taxa_conclusao', 'tempo_medio_atividade']
    for coluna in colunas_num:
        df[coluna] = pd.to_numeric(df[coluna], errors='raise')

    if df[colunas_num].isin([float('inf'), -float('inf')]).any().any():
        raise ValueError('O CSV contém valores infinitos.')

    # Validações de negócio
    if df['id_resposta'].duplicated().any():
        raise ValueError('Existem respostas com o mesmo id_resposta.')
    if (df['nota_obtida'] < 0).any() or (df['nota_obtida'] > df['nota_maxima']).any():
        raise ValueError('Nota obtida deve estar entre 0 e nota_maxima.')
    if (df['tempo_gasto_seg'] < 0).any():
        raise ValueError('tempo_gasto_seg não pode ser negativo.')
    if (df['tentativa'] < 1).any():
        raise ValueError('tentativa deve ser >= 1.')
    if (df['acertos'] < 0).any() or (df['erros'] < 0).any():
        raise ValueError('Acertos e erros não podem ser negativos.')
    if not df['taxa_conclusao'].between(0, 1).all():
        raise ValueError('taxa_conclusao deve estar entre 0 e 1.')
    if not df['alerta_risco'].isin(['baixo', 'medio', 'alto']).all():
        raise ValueError('alerta_risco deve ser baixo, medio ou alto.')

    # Análise de um aluno; período e nível de risco
    for coluna in ['id_aluno', 'alerta_risco']:
        if (df.groupby('id_analise')[coluna].nunique() > 1).any():
            raise ValueError('Uma análise tem alunos ou riscos conflitantes.')

    df['aproveitamento'] = (df['nota_obtida'] / df['nota_maxima']).round(4)
    return df
def resumo(df):
    medias_por_aluno = df.groupby('id_aluno')['nota_obtida'].mean()
    alunos_unicos = df.drop_duplicates('id_aluno')
    return {
        'linhas_respostas': int(len(df)),
        'total_respostas_distintas': int(df['id_resposta'].nunique()),
        'total_alunos': int(df['id_aluno'].nunique()),
        'total_atividades_cadastradas': int(df['id_atividade'].nunique()),
        'total_atividades_realizadas': int(
            df[['id_aluno', 'id_atividade']].drop_duplicates().shape[0]
        ),
        'total_turmas': int(df['id_turma'].nunique()),
        'total_professores': int(df['nome_professor'].nunique()),
        'total_tentativas': int(len(df)),
        'nota_media': round(float(df['nota_obtida'].mean()), 2),
        'nota_mediana': round(float(df['nota_obtida'].median()), 2),
        'aproveitamento_medio': round(float(df['aproveitamento'].mean()), 2),
        'media_nota_por_aluno': round(float(medias_por_aluno.mean()), 2),
        'mediana_nota_por_aluno': round(float(medias_por_aluno.median()), 2),
        'total_acertos': int(df['acertos'].sum()),
        'total_erros': int(df['erros'].sum()),
        'tempo_total_seg': int(df['tempo_gasto_seg'].sum()),
        'tempo_medio_seg': round(float(df['tempo_gasto_seg'].mean()), 2),
        'alunos_por_tipo_deficiencia':
            alunos_unicos['tipo_deficiencia'].value_counts().to_dict(),
        'alunos_por_alerta_risco':
            alunos_unicos['alerta_risco'].value_counts().to_dict(),
        'periodo_inicio': df['periodo_inicio'].min().strftime('%Y-%m-%d'),
        'periodo_fim': df['periodo_fim'].max().strftime('%Y-%m-%d'),
    }


def por_aluno(df):
    tabela = df.groupby('id_aluno', as_index=False).agg(
        nome_completo=('nome_completo', 'first'),
        tipo_deficiencia=('tipo_deficiencia', 'first'),
        nivel_suporte=('nivel_suporte', 'first'),
        codigo_turma=('codigo_turma', 'first'),
        disciplina=('disciplina', 'first'),
        total_tentativas=('id_resposta', 'count'),
        nota_media=('nota_obtida', 'mean'),
        aproveitamento_medio=('aproveitamento', 'mean'),
        total_acertos=('acertos', 'sum'),
        total_erros=('erros', 'sum'),
        tempo_medio_seg=('tempo_gasto_seg', 'mean'),
        alerta_risco=('alerta_risco', 'first'),
        diagnostico=('diagnostico_desempenho', 'first'),
        sugestao=('sugestao_conduta', 'first'),
    )
    for col in ['nota_media', 'aproveitamento_medio', 'tempo_medio_seg']:
        tabela[col] = tabela[col].round(2)
    tabela['taxa_acerto'] = (
        tabela['total_acertos'] / (tabela['total_acertos'] + tabela['total_erros'])
    ).round(2)
    tabela = tabela.sort_values('nota_media', ascending=True)
    return tabela.to_dict(orient='records')


def por_tipo_deficiencia(df):
    tabela = df.groupby('tipo_deficiencia', as_index=False).agg(
        total_alunos=('id_aluno', 'nunique'),
        total_respostas=('id_resposta', 'count'),
        nota_media=('nota_obtida', 'mean'),
        aproveitamento_medio=('aproveitamento', 'mean'),
        tempo_medio_seg=('tempo_gasto_seg', 'mean'),
        total_acertos=('acertos', 'sum'),
        total_erros=('erros', 'sum'),
    )
    for col in ['nota_media', 'aproveitamento_medio', 'tempo_medio_seg']:
        tabela[col] = tabela[col].round(2)
    tabela['taxa_acerto'] = (
        tabela['total_acertos'] / (tabela['total_acertos'] + tabela['total_erros'])
    ).round(2)
    tabela = tabela.sort_values('nota_media', ascending=False)
    return tabela.to_dict(orient='records')


def por_atividade(df):
    tabela = df.groupby(
        ['id_atividade', 'titulo', 'tipo_atividade'], as_index=False
    ).agg(
        total_respostas=('id_resposta', 'count'),
        nota_media=('nota_obtida', 'mean'),
        aproveitamento_medio=('aproveitamento', 'mean'),
        tempo_medio_seg=('tempo_gasto_seg', 'mean'),
    )
    for col in ['nota_media', 'aproveitamento_medio', 'tempo_medio_seg']:
        tabela[col] = tabela[col].round(2)
    tabela = tabela.sort_values('nota_media', ascending=False)
    return tabela.to_dict(orient='records')


def por_recursos_usados(df):
    aux = df[['id_resposta', 'nota_obtida', 'aproveitamento',
              'tempo_gasto_seg', 'recursos_usados']].copy()
    aux['recursos_usados'] = aux['recursos_usados'].str.split('|')
    aux = aux.explode('recursos_usados')
    tabela = aux.groupby('recursos_usados', as_index=False).agg(
        total_respostas=('id_resposta', 'count'),
        nota_media=('nota_obtida', 'mean'),
        aproveitamento_medio=('aproveitamento', 'mean'),
        tempo_medio_seg=('tempo_gasto_seg', 'mean'),
    )
    for col in ['nota_media', 'aproveitamento_medio', 'tempo_medio_seg']:
        tabela[col] = tabela[col].round(2)
    tabela = tabela.sort_values('nota_media', ascending=False)
    return tabela.to_dict(orient='records')


def por_data(df):
    aux = df.copy()
    aux['data_envio'] = aux['data_hora_envio'].dt.strftime('%Y-%m-%d')
    tabela = aux.groupby('data_envio', as_index=False).agg(
        total_respostas=('id_resposta', 'count'),
        total_alunos=('id_aluno', 'nunique'),
        nota_media=('nota_obtida', 'mean'),
        tempo_medio_seg=('tempo_gasto_seg', 'mean'),
    )
    for col in ['nota_media', 'tempo_medio_seg']:
        tabela[col] = tabela[col].round(2)
    return tabela.to_dict(orient='records')


def alunos_em_risco(df, nivel='alto'):
    alunos = df.drop_duplicates('id_aluno').copy()
    filtro = alunos[alunos['alerta_risco'] == nivel]
    colunas = ['id_aluno', 'nome_completo', 'tipo_deficiencia', 'nivel_suporte',
               'codigo_turma', 'nome_turma', 'diagnostico_desempenho',
               'sugestao_conduta', 'media_notas', 'taxa_conclusao', 'alerta_risco']
    return filtro[colunas].to_dict(orient='records')


if __name__ == '__main__':
    dados = ler_dados()
    print('Primeiras respostas:')
    print(dados.head())
    print('\nResumo:')
    print(resumo(dados))
