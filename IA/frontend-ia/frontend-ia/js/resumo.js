// ==========================================
// 1. CONFIGURAÇÕES INICIAIS
// ==========================================
const API_URL = 'http://127.0.0.1:8000/analise';
const API_DASHBOARD = 'http://127.0.0.1:8000/dashboard';
let chartRespostas = null;
let chartTempo = null;

// ==========================================
// 2. LÓGICA DO RESUMO (resumo.html)
// ==========================================
async function carregarResumo() {
  const btnAtualizar = document.querySelector('#botao-atualizar');
  if (!btnAtualizar) return;

  btnAtualizar.disabled = true;
  btnAtualizar.textContent = 'Carregando...';
  const mensagem = document.querySelector('#mensagem');
  mensagem.hidden = true;

  try {
    const [respostaResumo, respostaDeficiencias, respostaRisco] = await Promise.all([
      fetch(API_URL + '/resumo'),
      fetch(API_URL + '/deficiencias'),
      fetch(API_URL + '/risco/alto')
    ]);

    const dadosResumo = await respostaResumo.json();
    const dadosDeficiencias = await respostaDeficiencias.json();
    const dadosRisco = await respostaRisco.json();

    document.querySelector('#total-alunos').textContent = dadosResumo.total_alunos;
    document.querySelector('#nota-media').textContent = dadosResumo.nota_media.toFixed(2).replace('.', ',');
    document.querySelector('#total-atividades').textContent = dadosResumo.total_atividades_realizadas;
    document.querySelector('#total-risco-alto').textContent = dadosRisco.length;
    document.querySelector('#periodo').textContent = `Período: ${dadosResumo.periodo_inicio} a ${dadosResumo.periodo_fim}`;

    const tbody = document.querySelector('#lista-deficiencias');
    tbody.innerHTML = '';
    dadosDeficiencias.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${item.tipo_deficiencia}</td>
        <td class="numero">${item.total_alunos}</td>
        <td class="numero">${item.nota_media.toFixed(2).replace('.', ',')}</td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelector('#atualizacao').textContent = 'Última consulta: ' + new Date().toLocaleString('pt-BR');
    mensagem.hidden = false;
    mensagem.textContent = 'Dados atualizados com sucesso!';
    mensagem.className = 'mensagem';
  } catch (erro) {
    console.error(erro);
    mensagem.hidden = false;
    mensagem.textContent = 'Erro ao carregar os dados da API. Confira se o servidor Python está rodando.';
    mensagem.className = 'mensagem erro';
  } finally {
    btnAtualizar.disabled = false;
    btnAtualizar.textContent = 'Atualizar dados';
  }
}

// ==========================================
// 3. LÓGICA DOS GRÁFICOS (dashboard.html)
// ==========================================
async function carregarGraficos() {
  const canvasRespostas = document.getElementById('graficoRespostas');
  if (!canvasRespostas) return;

  try {
    const [respostaRespostas, respostaTempo] = await Promise.all([
      fetch(API_DASHBOARD + '/respostas-por-dia'),
      fetch(API_DASHBOARD + '/tempo-total-por-dia')
    ]);

    const dadosRespostas = await respostaRespostas.json();
    const dadosTempo = await respostaTempo.json();

    const labels = dadosRespostas.map(item => item.data.split('-').reverse().slice(0, 2).join('/'));
    const valoresResp = dadosRespostas.map(item => item.total_respostas);
    const valoresTempo = dadosTempo.map(item => (item.tempo_total_segundos / 60).toFixed(1));

    if (chartRespostas) chartRespostas.destroy();
    chartRespostas = new Chart(canvasRespostas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{ label: 'Respostas', data: valoresResp, backgroundColor: '#8b5cf6', borderRadius: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    if (chartTempo) chartTempo.destroy();
    chartTempo = new Chart(document.getElementById('graficoTempo').getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Minutos', data: valoresTempo, borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)', borderWidth: 3, fill: true, tension: 0.3
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

  } catch (erro) {
    console.error("Erro nos gráficos:", erro);
  }
}

// ==========================================
// 4. INICIALIZAÇÃO (RODA EM TODAS AS PÁGINAS)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {

  // --- A. RESUMO (Só roda se estiver no resumo.html) ---
  if (document.getElementById('resumo')) {
    carregarResumo();
    document.getElementById('botao-atualizar')?.addEventListener('click', carregarResumo);
  }

  // --- B. DASHBOARD (Só roda se estiver no dashboard.html) ---
  if (document.getElementById('graficoRespostas')) {
    carregarGraficos();
  }

  // --- C. BOTÕES DE ACESSIBILIDADE (Presentes em todas as páginas) ---
  const calmBtn = document.getElementById('calmButton');
  if (calmBtn) {
    calmBtn.addEventListener('click', () => document.body.classList.toggle('calm-mode'));
  }

  const themeBtn = document.getElementById('themeButton');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('high-contrast');

      if (document.getElementById('graficoRespostas')) {
        if (document.body.classList.contains('high-contrast')) {
          Chart.defaults.color = '#e8e4fb';
          Chart.defaults.borderColor = '#241d47';
        } else {
          Chart.defaults.color = '#191333';
          Chart.defaults.borderColor = 'rgba(0,0,0,0.1)';
        }
        carregarGraficos();
      }
    });
  }
});