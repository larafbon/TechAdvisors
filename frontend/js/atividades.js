const API_URL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
  carregarAtividadesDoAluno();
});

async function carregarAtividadesDoAluno() {
  const container = document.getElementById('lista-atividades-container');
  if (!container) return;

  // Pega o usuário logado no localStorage
  const savedUser = JSON.parse(localStorage.getItem('user')) || JSON.parse(localStorage.getItem('usuario')) || {};
  const idTurma = savedUser.id_turma || 1; // Padrão turma 1 para testes

  try {
    const response = await fetch(`${API_URL}/atividades/turma/${idTurma}`);
    
    if (response.ok) {
      const atividades = await response.json();

      if (atividades.length === 0) {
        container.innerHTML = `
          <div class="bg-white p-6 rounded-3xl text-center text-slate-500">
            Nenhuma atividade pendente para a sua turma no momento! 🎉
          </div>`;
        return;
      }

      // Renderiza as atividades vindas do banco de dados
      container.innerHTML = atividades.map(atv => `
        <div class="bg-white p-6 rounded-3xl shadow-md border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span class="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">Pendente</span>
            <h3 class="text-base font-bold text-slate-800 mt-2">${atv.titulo}</h3>
            <p class="text-xs text-slate-500 mt-1">${atv.descricao || 'Sem descrição.'}</p>
            <span class="text-[11px] text-purple-700 font-semibold mt-2 block">Tipo: ${atv.tipo_nome || 'Atividade'}</span>
          </div>
          <button onclick="enviarResposta(${atv.id_atividade})" class="bg-[#5b21b6] hover:bg-purple-900 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer self-start md:self-auto">
            Enviar Tarefa
          </button>
        </div>
      `).join('');
    } else {
      console.warn('Erro ao carregar do backend, usando modo demonstrativo.');
    }
  } catch (error) {
    console.error('Erro de conexão com FastAPI:', error);
  }
}

function enviarResposta(idAtividade) {
  alert(`Abrindo formulário de envio para a atividade #${idAtividade}`);
}