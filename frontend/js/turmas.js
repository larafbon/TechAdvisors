const API_URL = 'http://127.0.0.1:8000';
let currentProfId = 1;
let currentProfName = 'Professor';

document.addEventListener('DOMContentLoaded', function() {
  const userString = localStorage.getItem('tech_user');
  if (!userString) {
    alert('Acesso restrito. Por favor, faça login.');
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(userString);
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

  carregarTurmas();
});

async function carregarTurmas() {
  const tbody = document.getElementById('lista-turmas-body');
  if (!tbody) return;

  try {
    const response = await fetch(`${API_URL}/turmas?id_professor=${currentProfId}`);
    if (response.ok) {
      const turmas = await response.json();
      if (turmas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="p-6 text-center text-slate-500">Você ainda não possui turmas vinculadas.</td></tr>';
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