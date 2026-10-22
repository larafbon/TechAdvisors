const API_URL = 'http://127.0.0.1:8000';
let currentProfId = 1;
let currentProfName = 'Professor';


window.onload = function() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) {
    alert('Acesso restrito. Por favor, faça login.');
    window.location.href = 'index.html';
  } else {
    currentProfId = user.id_professor || user.id || 1;
    currentProfName = user.nome || 'Professor';


    // Atualiza nome no menu
    document.getElementById('prof-name-nav').querySelector('span').innerText = `👨‍🏫 ${currentProfName}`;


    // Preenche informações no modal de criação
    const anoAtual = new Date().getFullYear();
    document.getElementById('info-ano-letivo').innerText = anoAtual;
    document.getElementById('info-prof-id').innerText = `#${currentProfId} (${currentProfName})`;


    // Carrega disciplinas associadas ao professor logado
    carregarDisciplinasDoProfessor();


    carregarTurmas();
  }
};


// PREENCHE APENAS AS DISCIPLINAS QUE O PROFESSOR MINISTRA
async function carregarDisciplinasDoProfessor() {
  const selectDisciplina = document.getElementById('turma-disciplina');
  if (!selectDisciplina) return;


  const user = JSON.parse(localStorage.getItem('user')) || {};
  let listaDisciplinas = [];
  const idProf = user.id_professor || user.id;


  // 1. Procura as disciplinas diretamente no backend via fetch
  if (idProf) {
    try {
      const response = await fetch(`${API_URL}/professores`);
      if (response.ok) {
        const professores = await response.json();
        const profAtual = professores.find(p => (p.id_professor || p.id) === idProf);


        if (profAtual && profAtual.disciplinas) {
          listaDisciplinas = profAtual.disciplinas
            .split(',')
            .map(d => d.trim())
            .filter(Boolean);
        }
      }
    } catch (e) {
      console.warn('Erro ao consultar API:', e);
    }
  }


  // 2. Fallback para o localStorage se a requisição falhar
  if (listaDisciplinas.length === 0 && user.disciplinas) {
    listaDisciplinas = user.disciplinas
      .split(',')
      .map(d => d.trim())
      .filter(Boolean);
  }


  // 3. Preenche as opções do select
  selectDisciplina.innerHTML = '';


  if (listaDisciplinas.length > 0) {
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = 'Escolha a disciplina...';
    selectDisciplina.appendChild(defaultOption);


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


// ALTERNAR DROPDOWN DO PROFESSOR
function toggleUserMenu(event) {
  event.stopPropagation();
  const menu = document.getElementById('userMenu');
  menu.classList.toggle('show');
}


window.addEventListener('click', function(e) {
  const menu = document.getElementById('userMenu');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});


function minhaConta() {
  alert('Acessando: Minha Conta');
}


function configuracoes() {
  alert('Acessando: Configurações');
}


// ABRIR E FECHAR MODAL DE TURMAS
function toggleModalTurma(show) {
  const modal = document.getElementById('modal-turma');
  if (show) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}


// BUSCAR APENAS AS TURMAS DO PROFESSOR LOGADO
async function carregarTurmas() {
  const tbody = document.getElementById('lista-turmas-body');
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


// SALVAR TURMA (CORRIGIDO)
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
      const erro = await response.json();
      console.error('Erro ao criar turma:', erro);
      alert('Erro ao criar turma. Verifique os dados informados.');
    }
  } catch (error) {
    console.error('Erro de conexão ao salvar turma:', error);
    alert('Não foi possível conectar ao servidor.');
  }
}


// LOGOUT
function logout() {
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}



