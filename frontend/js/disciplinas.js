const API_URL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
  carregarDisciplinasDoAluno();
});

async function carregarDisciplinasDoAluno() {
  const container = document.getElementById('lista-disciplinas-container');
  if (!container) return;

  const userString = localStorage.getItem('tech_user');
  if (!userString) {
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(userString);
  const idTurma = user.id_turma || 1;

  try {
    const response = await fetch(`${API_URL}/turmas`);
    if (response.ok) {
      const turmas = await response.json();
      const turmaAluno = turmas.find(t => t.id_turma === idTurma || t.id === idTurma) || {
        nome_turma: user.serie || 'Turma Principal',
        disciplina: 'Língua Portuguesa, Matemática, História'
      };

      const listaMaterias = turmaAluno.disciplina ? turmaAluno.disciplina.split(',') : ['Língua Portuguesa', 'Matemática'];

      container.innerHTML = listaMaterias.map(materia => `
        <div class="bg-white p-6 rounded-3xl shadow-md border border-slate-100">
          <span class="text-xs font-bold uppercase text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">${turmaAluno.nome_turma || 'Sua Turma'}</span>
          <h3 class="text-lg font-bold text-slate-800 mt-3">${materia.trim()}</h3>
          <p class="text-xs text-slate-500 mt-1">Status: Ativa</p>
          <div class="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-600">
            <span>Aulas Semanais</span>
            <button onclick="window.location.href='atividades.html'" class="text-purple-700 font-bold hover:underline cursor-pointer">Ver Tarefas</button>
          </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('Erro ao buscar disciplinas:', error);
    container.innerHTML = `
      <div class="bg-white p-6 rounded-3xl text-center text-slate-500 md:col-span-3">
        Exibindo disciplinas da turma #${idTurma}.
      </div>`;
  }
}