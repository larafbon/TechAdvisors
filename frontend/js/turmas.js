const API_URL = 'http://127.0.0.1:8000';
let currentProfId = 1;
let currentProfName = 'Professor';

document.addEventListener('DOMContentLoaded', function() {
  const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('usuario'));
  if (!user) {
    alert('Acesso restrito. Por favor, faça login.');
    window.location.href = 'index.html';
    return;
  }

  currentProfId = user.id_professor || user.id || 1;
  currentProfName = user.nome || 'Professor';

  const profNav = document.getElementById('prof-name-nav');
  if (profNav && profNav.querySelector('span')) {
    profNav.querySelector('span').innerText = `👨‍🏫 ${currentProfName}`;
  }

  const anoLabel = document.getElementById('info-ano-letivo');
  if (anoLabel) anoLabel.innerText = new Date().getFullYear();

  const profIdLabel = document.getElementById('info-prof-id');
  if (profIdLabel) profIdLabel.innerText = `#${currentProfId} (${currentProfName})`;

  carregarDisciplinasDoProfessor();
  carregarTurmas();
});

async function carregarDisciplinasDoProfessor() {
  const selectDisciplina = document.getElementById('turma-disciplina');
  if (!selectDisciplina) return;

  const user = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('usuario')) || {};
  let listaDisciplinas = [];
  const idProf = user.id_professor || user.id;

  if (idProf) {
    try {
      const response = await fetch(`${API_URL}/professores`);
      if (response.ok) {
        const professores = await response.json();
        const profAtual = professores.find(p => (p.id_professor || p.id) === idProf);
        if (profAtual && profAtual.disciplinas) {
          listaDisciplinas = profAtual.disciplinas.split(',').map(d => d.trim()).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn('Erro ao consultar API:', e);
    }
  }

  if (listaDisciplinas.length === 0 && user.disciplinas) {
    listaDisciplinas = user.disciplinas.split(',').map(d => d.trim()).filter(Boolean);
  }

  selectDisciplina.innerHTML = '';
  if (listaDisciplinas.length > 0) {
    selectDisciplina.innerHTML = '<option value="" disabled selected>Escolha a disciplina...</option>';
    listaDisciplinas.forEach(disc => {
      const option = document.createElement('option');
      option.value = disc;
      option.textContent = disc;
      selectDisciplina.appendChild(option);
    });
  } else {
    selectDisciplina.innerHTML = '<option value="" disabled selected>Nenhuma disciplina encontrada</option>';
  }
}

function toggleUserMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('userMenu') || document.getElementById('user-dropdown');
  if (menu) menu.classList.toggle('show');
}

window.addEventListener('click', function(e) {
  const menu = document.getElementById('userMenu') || document.getElementById('user-dropdown');
  const navBtn = document.getElementById('prof-name-nav');
  if (menu && menu.classList.contains('show')) {
    if (!menu.contains(e.target) && navBtn && !navBtn.contains(e.target)) {
      menu.classList.remove('show');
    }
  }
});

function toggleModalTurma(show) {
  const modal = document.getElementById('modal-turma');
  if (!modal) return;
  if (show) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

async function carregarTurmas() {
  const tbody = document.getElementById('lista-turmas-body');
  if (!tbody) return;

  try {
    const response = await fetch(`${API_URL}/turmas?id_professor=${currentProfId}`);
    if (response.ok) {
      const turmas = await response.json();
      if (turmas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-500">Você ainda não possui turmas cadastradas.</td></tr>';
        return;
      }

      tbody.innerHTML = turmas.map(t => `
        <tr class="hover:bg-slate-50/80 transition-colors">
          <td class="p-4 font-mono text-xs font-bold text-indigo-600">${t.codigo_turma}</td>
          <td class="p-4 font-semibold text-slate-800">${t.nome_turma}</td>
          <td class="p-4">${t.serie_ano}</td>
          <td class="p-4">${t.disciplina}</td>
          <td class="p-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              ${t.turno}
            </span>
          </td>
          <td class="p-4">${t.ano_letivo}</td>
          <td class="p-4 font-mono text-xs">#${t.id_professor}</td>
          <td class="p-4">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              ${t.status_turma}
            </span>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-red-500">Erro ao carregar lista de turmas.</td></tr>';
    }
  } catch (error) {
    console.error('Erro na conexão:', error);
    tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-red-500">Servidor FastAPI indisponível.</td></tr>';
  }
}

async function handleSalvarTurma(event) {
  event.preventDefault();

  const serie = document.getElementById('turma-serie').value;
  const letra = document.getElementById('turma-letra').value;
  const disciplina = document.getElementById('turma-disciplina').value;
  const turno = document.getElementById('turma-turno').value;
  const anoLetivo = new Date().getFullYear();

  const nomeTurma = `${serie} - Turma ${letra}`;
  const serieFormatada = serie.replace(/[^a-zA-Z0-9]/g, '');
  const hashRandom = Math.random().toString(36).substring(2, 6).toUpperCase();
  const codigoTurma = `TURMA-${anoLetivo}-${serieFormatada}-${letra}-${hashRandom}`;

  const payload = {
    codigo_turma: codigoTurma,
    nome_turma: nomeTurma,
    serie_ano: `${serie} (${letra})`,
    disciplina: disciplina,
    turno: turno,
    ano_letivo: anoLetivo,
    id_professor: parseInt(currentProfId),
    status_turma: 'ativa'
  };

  try {
    const response = await fetch(`${API_URL}/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      toggleModalTurma(false);
      event.target.reset();
      carregarTurmas();
    } else {
      alert('Erro ao criar turma. Verifique os dados informados.');
    }
  } catch (error) {
    console.error('Erro de conexão ao salvar turma:', error);
    alert('Não foi possível conectar ao servidor.');
  }
}

function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('usuario');
  window.location.href = 'index.html';
}


 
 
 