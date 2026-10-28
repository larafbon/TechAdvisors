// URL da SUA API. Se a API estiver em 8001, troque aqui.
const API_URL = 'http://127.0.0.1:8000/analise';

// --- Passo 2: selecionar elementos ---
const totalAlunos       = document.querySelector('#total-alunos');
const notaMedia         = document.querySelector('#nota-media');
const totalAtividades   = document.querySelector('#total-atividades');
const totalRiscoAlto    = document.querySelector('#total-risco-alto');
const listaDeficiencias = document.querySelector('#lista-deficiencias');
const botaoAtualizar    = document.querySelector('#botao-atualizar');
const mensagem          = document.querySelector('#mensagem');
const atualizacao       = document.querySelector('#atualizacao');
const periodo           = document.querySelector('#periodo');
const resumo            = document.querySelector('#resumo');

// Mapa opcional para deixar os rótulos mais legíveis.
// Se aparecer um tipo que não está aqui, o JS exibe o valor bruto.
const nomesDeficiencias = {
  'tea':       'TEA (Autismo)',
  'tdah':      'TDAH',
  'dislexia':  'Dislexia',
  'discalculia': 'Discalculia',
};

// --- Passo 3: formatação e estados ---
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

// --- Passo 4: consultar uma rota ---
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

// --- Passo 5: conferir a consistência dos totais ---
function conferirTotais(resumoDados, deficiencias, riscoAlto) {
  // 1) indicadores válidos
  if (!Number.isInteger(resumoDados.total_alunos) || resumoDados.total_alunos < 0) {
    throw new Error('A API retornou total_alunos inválido.');
  }
  if (typeof resumoDados.nota_media !== 'number' || resumoDados.nota_media < 0) {
    throw new Error('A API retornou nota_media inválida.');
  }
  if (!Number.isInteger(resumoDados.total_atividades_realizadas) ||
      resumoDados.total_atividades_realizadas < 0) {
    throw new Error('A API retornou total_atividades_realizadas inválido.');
  }

  // 2) tabela no formato esperado
  if (!Array.isArray(deficiencias)) {
    throw new Error('A tabela de deficiências não está no formato esperado.');
  }

  // 3) soma dos alunos por tipo == total geral
  let soma = 0;
  for (const item of deficiencias) {
    if (typeof item.tipo_deficiencia !== 'string' ||
        !Number.isInteger(item.total_alunos) || item.total_alunos < 0) {
      throw new Error('A API retornou uma contagem de deficiência inválida.');
    }
    soma += item.total_alunos;
  }
  if (soma !== resumoDados.total_alunos) {
    throw new Error(
      `Divergência: soma por deficiência (${soma}) ≠ total de alunos (${resumoDados.total_alunos}).`
    );
  }

  // 4) alunos em risco alto coincidem com o resumo
  if (!Array.isArray(riscoAlto)) {
    throw new Error('A lista de alunos em risco alto não está no formato esperado.');
  }
  const esperadoRisco = (resumoDados.alunos_por_alerta_risco?.alto) ?? 0;
  if (riscoAlto.length !== esperadoRisco) {
    throw new Error(
      `Divergência: risco alto na lista (${riscoAlto.length}) ≠ no resumo (${esperadoRisco}).`
    );
  }
}

// --- Passo 6: construir as linhas da tabela ---
function exibirDeficiencias(dados) {
  listaDeficiencias.replaceChildren();
  for (const item of dados) {
    const linha = listaDeficiencias.insertRow();

    const tipo = linha.insertCell();
    tipo.textContent = nomesDeficiencias[item.tipo_deficiencia] || item.tipo_deficiencia;

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

// --- Passo 7: orquestrar as consultas ---
async function carregarResumo() {
  botaoAtualizar.disabled = true;
  botaoAtualizar.textContent = 'Carregando...';
  resumo.setAttribute('aria-busy', 'true');
  mensagem.hidden = true;
  atualizacao.textContent = 'Consultando as rotas da API...';
  limparTotais();
  estadoTabela('Carregando os dados...');

  try {
    // Quatro consultas independentes. Promise.all resolve quando todas terminam.
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

// --- Passo 8: ligar o botão e iniciar ---
botaoAtualizar.addEventListener('click', carregarResumo);
carregarResumo();
