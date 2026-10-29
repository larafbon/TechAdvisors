// 1. URL da API e captura dos elementos do HTML (Dashboard)
const API_URL = 'http://127.0.0.1:8000/analise';
const totalAlunos = document.querySelector('#total-alunos');
const notaMedia = document.querySelector('#nota-media');
const totalAtividades = document.querySelector('#total-atividades');
const totalRiscoAlto = document.querySelector('#total-risco-alto');
const listaDeficiencias = document.querySelector('#lista-deficiencias');
const botaoAtualizar = document.querySelector('#botao-atualizar');
const mensagem = document.querySelector('#mensagem');
const atualizacao = document.querySelector('#atualizacao');
const periodo = document.querySelector('#periodo');
const resumo = document.querySelector('#resumo');

// 2. Especificação (Nomes amigáveis)
const nomesDeficiencias = {
  'tea':        'TEA (Autismo)',
  'tdah':       'TDAH',
  'dislexia':   'Dislexia',
  'discalculia':'Discalculia',
};

// 3. Formatação
function numero(valor) {
  return valor.toLocaleString('pt-BR');
}

function numeroDecimal(valor) {
  return valor.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function mostrarMensagem(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'mensagem erro' : 'mensagem';
  mensagem.hidden = false;
}

function estadoTabela(texto) {
  listaDeficiencias.replaceChildren();
  const linha = listaDeficiencias.insertRow();
  const celula = linha.insertCell();
  celula.colSpan = 3;
  celula.className = 'vazio';
  celula.textContent = texto;
}

function limparTotais() {
  totalAlunos.textContent     = '—';
  notaMedia.textContent       = '—';
  totalAtividades.textContent = '—';
  totalRiscoAlto.textContent  = '—';
  periodo.textContent         = '';
}

// 4. Rota (Fetch)
async function consultar(caminho) {
  let resposta;
  try {
    resposta = await fetch(API_URL + caminho);
  } catch {
    throw new Error('Não foi possível acessar a API. Confira o servidor, a URL e o CORS.');
  }
  const dados = await resposta.json();
  if (!resposta.ok) {
    const detalhe = typeof dados.detail === 'string' ? dados.detail : 'Falha na consulta.';
    throw new Error(detalhe);
  }
  return dados;
}

// 5. Contrato de dados
function conferirTotais(resumoDados, deficiencias, riscoAlto) {
  if (!Number.isInteger(resumoDados.total_alunos) || resumoDados.total_alunos < 0) {
    throw new Error('A API retornou total_alunos inválido.');
  }
  if (typeof resumoDados.nota_media !== 'number' || resumoDados.nota_media < 0) {
    throw new Error('A API retornou nota_media inválida.');
  }
  if (!Number.isInteger(resumoDados.total_atividades_realizadas) || resumoDados.total_atividades_realizadas < 0) {
    throw new Error('A API retornou total_atividades_realizadas inválido.');
  }

  if (!Array.isArray(deficiencias)) {
    throw new Error('A tabela de deficiências não está no formato esperado.');
  }

  let soma = 0;
  for (const item of deficiencias) {
    if (typeof item.tipo_deficiencia !== 'string' || !Number.isInteger(item.total_alunos) || item.total_alunos < 0) {
      throw new Error('A API retornou uma contagem de deficiência inválida.');
    }
    soma += item.total_alunos;
  }
  
  if (soma !== resumoDados.total_alunos) {
    throw new Error(`Divergência: soma por deficiência (${soma}) ≠ total de alunos (${resumoDados.total_alunos}).`);
  }

  if (!Array.isArray(riscoAlto)) {
    throw new Error('A lista de alunos em risco alto não está no formato esperado.');
  }
  const esperadoRisco = (resumoDados.alunos_por_alerta_risco?.alto) ?? 0;
  if (riscoAlto.length !== esperadoRisco) {
    throw new Error(`Divergência: risco alto na lista (${riscoAlto.length}) ≠ no resumo (${esperadoRisco}).`);
  }
}

// 6. Linhas da tabela
function exibirDeficiencias(dados) {
  listaDeficiencias.replaceChildren();
  for (const item of dados) {
    const linha = listaDeficiencias.insertRow();

    const tipo = linha.insertCell();
    tipo.textContent = nomesDeficiencias[item.tipo_deficiencia.toLowerCase()] || item.tipo_deficiencia;

    const alunos = linha.insertCell();
    alunos.textContent = numero(item.total_alunos);
    alunos.className = 'numero';

    const media = linha.insertCell();
    media.textContent = numeroDecimal(item.nota_media);
    media.className = 'numero';
  }
  if (dados.length === 0) {
    estadoTabela('Nenhum tipo de deficiência no período.');
  }
}

// 7. Consulta Principal
async function carregarResumo() {
  botaoAtualizar.disabled = true;
  botaoAtualizar.textContent = 'Carregando...';
  resumo.setAttribute('aria-busy', 'true');
  mensagem.hidden = true;
  atualizacao.textContent = 'Consultando as rotas da API...';
  limparTotais();
  estadoTabela('Carregando os dados...');

  try {
    const [resumoDados, deficiencias, riscoAlto] = await Promise.all([
      consultar('/resumo'),
      consultar('/deficiencias'),
      consultar('/risco/alto'),
    ]);

    conferirTotais(resumoDados, deficiencias, riscoAlto);

    totalAlunos.textContent     = numero(resumoDados.total_alunos);
    notaMedia.textContent       = numeroDecimal(resumoDados.nota_media);
    totalAtividades.textContent = numero(resumoDados.total_atividades_realizadas);
    totalRiscoAlto.textContent  = numero(riscoAlto.length);
    periodo.textContent         = `Período: ${resumoDados.periodo_inicio} a ${resumoDados.periodo_fim}`;

    exibirDeficiencias(deficiencias);

    atualizacao.textContent = 'Última consulta: ' + new Date().toLocaleString('pt-BR');
    mostrarMensagem('Dados atualizados. A soma por tipo de deficiência confere com o total de alunos.');
  } catch (erro) {
    limparTotais();
    estadoTabela('Dados indisponíveis. Consulte a mensagem acima e tente novamente.');
    atualizacao.textContent = 'A consulta não foi concluída.';
    mostrarMensagem(erro.message, true);
  } finally {
    botaoAtualizar.disabled = false;
    botaoAtualizar.textContent = 'Atualizar dados';
    resumo.setAttribute('aria-busy', 'false');
  }
}

// 8. Iniciar
botaoAtualizar.addEventListener('click', carregarResumo);
carregarResumo();