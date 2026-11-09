// ==========================================
// 1. URLS DA API E CAPTURA DE ELEMENTOS
// ==========================================
const API_URL = 'http://127.0.0.1:8000/analise';
const API_DASHBOARD = 'http://127.0.0.1:8000/dashboard';

// Elementos do Resumo
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

// Variáveis globais para os gráficos
let chartRespostas = null;
let chartTempo = null;

// ==========================================
// 2. FORMATAÇÃO E UTILITÁRIOS
// ==========================================
const nomesDeficiencias = {
  'tea':        'TEA (Autismo)',
  'tdah':       'TDAH',
  'dislexia':   'Dislexia',
  'discalculia':'Discalculia',
};

function numero(valor) { return valor.toLocaleString('pt-BR'); }
function numeroDecimal(valor) {
  return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

// ==========================================
// 3. FETCH E CONFERÊNCIA DO RESUMO
// ==========================================
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

function conferirTotais(resumoDados, deficiencias, riscoAlto) {
  if (!Number.isInteger(resumoDados.total_alunos) || resumoDados.total_alunos < 0) throw new Error('API: total_alunos inválido.');
  if (typeof resumoDados.nota_media !== 'number' || resumoDados.nota_media < 0) throw new Error('API: nota_media inválida.');
  if (!Number.isInteger(resumoDados.total_atividades_realizadas) || resumoDados.total_atividades_realizadas < 0) throw new Error('API: total_atividades_realizadas inválido.');
  if (!Array.isArray(deficiencias)) throw new Error('API: tabela de deficiências não é um array.');

  let soma = 0;
  for (const item of deficiencias) {
    if (typeof item.tipo_deficiencia !== 'string' || !Number.isInteger(item.total_alunos) || item.total_alunos < 0) {
      throw new Error('API: contagem de deficiência inválida.');
    }
    soma += item.total_alunos;
  }
  
  if (soma !== resumoDados.total_alunos) {
    throw new Error(`Divergência: soma por deficiência (${soma}) ≠ total de alunos (${resumoDados.total_alunos}).`);
  }

  if (!Array.isArray(riscoAlto)) throw new Error('API: lista de risco alto não é um array.');
  const esperadoRisco = (resumoDados.alunos_por_alerta_risco?.alto) ?? 0;
  if (riscoAlto.length !== esperadoRisco) {
    throw new Error(`Divergência: risco alto na lista (${riscoAlto.length}) ≠ no resumo (${esperadoRisco}).`);
  }
}

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
  if (dados.length === 0) estadoTabela('Nenhum tipo de deficiência no período.');
}

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
    console.error("Erro no resumo:", erro); // Ajuda a debugar no F12
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

// ==========================================
// 4. LÓGICA DOS GRÁFICOS
// ==========================================
async function carregarGraficos() {
  try {
    const [respostaRespostas, respostaTempo] = await Promise.all([
      fetch(API_DASHBOARD + '/respostas-por-dia'),
      fetch(API_DASHBOARD + '/tempo-total-por-dia')
    ]);

    if (!respostaRespostas.ok || !respostaTempo.ok) throw new Error('Erro ao buscar dados do dashboard.');

    const dadosRespostas = await respostaRespostas.json();
    const dadosTempo = await respostaTempo.json();

    const labelsDatas = dadosRespostas.map(item => {
      const [ano, mes, dia] = item.data.split('-');
      return `${dia}/${mes}`;
    });

    const valoresRespostas = dadosRespostas.map(item => item.total_respostas);
    const valoresTempo = dadosTempo.map(item => (item.tempo_total_segundos / 60).toFixed(1));

    renderizarGraficoRespostas(labelsDatas, valoresRespostas);
    renderizarGraficoTempo(labelsDatas, valoresTempo);

  } catch (erro) {
    console.error("Erro ao carregar gráficos:", erro);
  }
}

function renderizarGraficoRespostas(labels, dados) {
  const canvas = document.getElementById('graficoRespostas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (chartRespostas) chartRespostas.destroy();

  chartRespostas = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{ label: 'Respostas', data: dados, backgroundColor: '#8b5cf6', borderRadius: 6 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
    }
  });
}

function renderizarGraficoTempo(labels, dados) {
  const canvas = document.getElementById('graficoTempo');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (chartTempo) chartTempo.destroy();

  chartTempo = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Minutos', data: dados, borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)',
        borderWidth: 3, tension: 0.3, fill: true, pointBackgroundColor: '#5c1fd6'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => `Tempo: ${ctx.raw} min` } } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

// ==========================================
// 5. INICIAR E EVENTOS
// ==========================================
botaoAtualizar.addEventListener('click', () => {
  carregarResumo();
  carregarGraficos();
});

// Inicia os dois quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  carregarResumo();
  carregarGraficos();
});