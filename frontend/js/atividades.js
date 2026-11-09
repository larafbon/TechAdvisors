const API_URL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
  carregarAtividadesDoAluno();
});

async function carregarAtividadesDoAluno() {
  const container = document.getElementById('lista-atividades-container');
  if (!container) return;

  try {
    let response = await fetch(`${API_URL}/atividades/turma/1`);
    let atividades = [];

    if (response.ok) {
      atividades = await response.json();
    }

    if (!Array.isArray(atividades) || atividades.length === 0) {
      const responseGeral = await fetch(`${API_URL}/atividades`);
      if (responseGeral.ok) {
        atividades = await responseGeral.json();
      }
    }

    if (Array.isArray(atividades) && atividades.length > 0) {
      renderizarLista(container, atividades);
    } else {
      container.innerHTML = `
        <div class="bg-white p-8 rounded-3xl text-center text-slate-500 border border-slate-100">
          <p class="text-sm font-semibold">Nenhuma atividade cadastrada no momento.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Erro de conexão:', error);
    container.innerHTML = `
      <div class="bg-white p-8 rounded-3xl text-center text-red-500 border border-slate-100">
        <p class="text-sm font-semibold">Não foi possível conectar ao servidor backend.</p>
      </div>
    `;
  }
}

function renderizarLista(container, lista) {
  container.innerHTML = lista.map(atv => {
    const titulo = atv.titulo || 'Atividade';
    const descricao = atv.descricao || 'Sem descrição cadastrada.';

    return `
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
        <div>
          <span class="text-[10px] font-bold uppercase bg-purple-100 text-purple-900 px-2.5 py-0.5 rounded-full">Atividade da Turma</span>
          <h3 class="text-base font-bold text-slate-800 mt-2">${titulo}</h3>
          <p class="text-xs text-slate-500 mt-1">${descricao}</p>
        </div>
        <button onclick="alert('Atividade pronta para resposta!')" class="bg-[#5b21b6] hover:bg-purple-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer self-start md:self-auto">
          Enviar Tarefa
        </button>
      </div>
    `;
  }).join('');
}

function voltarAoPainelCorrespondente() {
  const userString = localStorage.getItem('tech_user');
  if (userString) {
    try {
      const user = JSON.parse(userString);
      if (user.role === 'professor' || user.id_professor) {
        window.location.href = 'professor.html';
        return;
      }
    } catch (e) {
      console.error('Erro ao ler permissões:', e);
    }
  }
  window.location.href = 'alunos.html';
}