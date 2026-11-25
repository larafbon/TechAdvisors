// ==========================================
// 1. CONFIGURAÇÕES INICIAIS (Porta 8001)
// ==========================================
const API_URL = 'http://127.0.0.1:8001/analise';
const API_DASHBOARD = 'http://127.0.0.1:8001/dashboard';
let chartRespostas = null;
let chartMediaNotas = null;

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
    const [respostaResumo, respostaDeficiencias] = await Promise.all([
      fetch(API_URL + '/resumo'),
      fetch(API_URL + '/deficiencias')
    ]);

    if (!respostaResumo.ok || !respostaDeficiencias.ok) {
      throw new Error('Erro HTTP na API');
    }

    const dadosResumo = await respostaResumo.json();
    const dadosDeficiencias = await respostaDeficiencias.json();

    document.querySelector('#total-alunos').textContent = dadosResumo.total_alunos;
    document.querySelector('#nota-media').textContent = Number(dadosResumo.nota_media).toFixed(2).replace('.', ',');
    document.querySelector('#total-atividades').textContent = dadosResumo.total_atividades_realizadas;
    document.querySelector('#total-respostas').textContent = dadosResumo.total_respostas;

    if (dadosResumo.periodo_inicio && dadosResumo.periodo_fim) {
      document.querySelector('#periodo').textContent = `Período: ${dadosResumo.periodo_inicio} a ${dadosResumo.periodo_fim}`;
    } else {
      document.querySelector('#periodo').textContent = 'Período: sem registros até o momento';
    }

    const tbody = document.querySelector('#lista-deficiencias');
    tbody.innerHTML = '';

    if (dadosDeficiencias.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" class="vazio">Nenhuma resposta registrada no banco de dados.</td></tr>';
    } else {
      dadosDeficiencias.forEach(item => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${item.tipo_deficiencia}</td>
          <td class="numero">${item.total_alunos}</td>
          <td class="numero">${Number(item.nota_media).toFixed(2).replace('.', ',')}</td>
        `;
        tbody.appendChild(tr);
      });
    }

    document.querySelector('#atualizacao').textContent = 'Última consulta: ' + new Date().toLocaleString('pt-BR');
    mensagem.hidden = false;
    mensagem.textContent = 'Dados atualizados diretamente do PostgreSQL com sucesso!';
    mensagem.className = 'mensagem';
  } catch (erro) {
    console.error(erro);
    mensagem.hidden = false;
    mensagem.textContent = 'Erro ao carregar os dados da API. Confira se o servidor Python (porta 8001) e o banco estão ativos.';
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
    const [respostaRespostas, respostaNotas] = await Promise.all([
      fetch(API_DASHBOARD + '/respostas-por-dia'),
      fetch(API_DASHBOARD + '/media-notas-por-dia')
    ]);

    const dadosRespostas = await respostaRespostas.json();
    const dadosNotas = await respostaNotas.json();

    const labels = dadosRespostas.map(item => item.data.split('-').reverse().slice(0, 2).join('/'));
    const valoresResp = dadosRespostas.map(item => item.total_respostas);
    const valoresNotas = dadosNotas.map(item => Number(item.nota_media).toFixed(2));

    if (chartRespostas) chartRespostas.destroy();
    chartRespostas = new Chart(canvasRespostas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{ label: 'Respostas', data: valoresResp, backgroundColor: '#8b5cf6', borderRadius: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    if (chartMediaNotas) chartMediaNotas.destroy();
    chartMediaNotas = new Chart(document.getElementById('graficoMediaNotas').getContext('2d'), {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Nota Média', data: valoresNotas, borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)', borderWidth: 3, fill: true, tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { min: 0, max: 10 } }
      }
    });

  } catch (erro) {
    console.error("Erro nos gráficos:", erro);
  }
}

// ==========================================
// 4. INICIALIZAÇÃO (RODA EM TODAS AS PÁGINAS)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('resumo')) {
    carregarResumo();
    document.getElementById('botao-atualizar')?.addEventListener('click', carregarResumo);
  }

  if (document.getElementById('graficoRespostas')) {
    carregarGraficos();
  }

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