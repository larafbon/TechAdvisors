const API_URL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
  carregarDadosProfessor();
});

function carregarDadosProfessor() {
  const userString = localStorage.getItem('tech_user');
  if (!userString) return;

  try {
    const user = JSON.parse(userString);
    let nomeProf = user.nome || 'Ana Beatriz Nogueira';
    nomeProf = nomeProf.replace(/^Prof\.\s*/i, '');

    const navTeacherName = document.getElementById('nav-teacher-name');
    if (navTeacherName) navTeacherName.innerText = `Prof. ${nomeProf}`;

    const welcomeTitle = document.getElementById('welcome-title');
    if (welcomeTitle) welcomeTitle.innerText = `Bem-vindo(a), Prof. ${nomeProf}!`;
  } catch (e) {
    console.error('Erro ao ler dados do usuário:', e);
  }
}

window.abrirModalAtividade = function() {
  const modal = document.getElementById('modal-atividade');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.fecharModalAtividade = function() {
  const modal = document.getElementById('modal-atividade');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

function toggleUserMenu(event) {
  if (event) event.stopPropagation();
  const menu = document.getElementById('userMenu');
  if (menu) menu.classList.toggle('show');
}

document.addEventListener('click', (e) => {
  const menu = document.getElementById('userMenu');
  if (menu && menu.classList.contains('show')) {
    menu.classList.remove('show');
  }
});

function logout() {
  localStorage.clear();
  window.location.href = 'index.html';
}

async function enviarAtividadeDireta() {
  const tituloInput = document.getElementById('titulo_atividade');
  const descricaoInput = document.getElementById('descricao_atividade');
  const turmaInput = document.getElementById('id_turma_atividade');

  const tituloVal = tituloInput ? tituloInput.value.trim() : '';
  const descricaoVal = descricaoInput ? descricaoInput.value.trim() : '';
  const turmaVal = turmaInput ? parseInt(turmaInput.value) || 1 : 1;

  if (!tituloVal) {
    alert('Por favor, preencha o título da atividade!');
    return;
  }

  const payload = {
    titulo: tituloVal,
    descricao: descricaoVal,
    id_turma: turmaVal,
    id_tipo_atividade: 1
  };

  try {
    const response = await fetch(`${API_URL}/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert('✅ Atividade publicada com sucesso!');
      window.fecharModalAtividade();
      window.location.reload();
    } else {
      const data = await response.json();
      alert('❌ Erro no servidor: ' + JSON.stringify(data.detail || data));
    }
  } catch (error) {
    console.error('Erro de conexão:', error);
    alert('❌ Verifique se a API Uvicorn está a rodar no terminal.');
  }
}