const API_URL = 'http://127.0.0.1:8000';
let atividadeAtualId = null;
window.studentActivities = [];

document.addEventListener('DOMContentLoaded', () => {
  carregarAtividadesDoAluno();
});

// 1. Carrega as atividades da turma a partir do backend FastAPI
async function carregarAtividadesDoAluno() {
  const container = document.getElementById('lista-atividades-container');
  if (!container) return;

  try {
    const response = await fetch(`${API_URL}/atividades/turma/1`);
    if (response.ok) {
      const dadosBackend = await response.json();
      window.studentActivities = dadosBackend.map(a => {
        const rawDesc = a.descricao || 'Sem orientações.';
        const parts = rawDesc.split('|||QUIZ_DATA|||');
        return {
          id: String(a.id_atividade || a.id),
          title: a.titulo,
          description: parts[0],
          quizData: parts[1] ? JSON.parse(parts[1]) : null,
          grade: (a.titulo || '').includes('1º') ? '1º Ano EM' : ((a.titulo || '').includes('2º') ? '2º Ano EM' : '3º Ano EM'),
          type: a.id_tipo_atividade === 2 ? 'QUIZ' : 'MATERIAL',
          fileUrl: a.ficheiro_url || ''
        };
      });
    }
  } catch (err) {
    console.warn('API offline, buscando dados locais...', err);
    const local = localStorage.getItem('tech_activities');
    if (local) {
      window.studentActivities = JSON.parse(local);
    }
  }

  if (window.studentActivities.length > 0) {
    await renderizarListaAlunos(container, window.studentActivities);
  } else {
    container.innerHTML = `
      <div class="bg-white p-8 rounded-3xl text-center text-slate-500 border border-slate-100">
        <p class="text-sm font-semibold">Nenhuma atividade pendente no momento.</p>
      </div>
    `;
  }
}

// 2. Renderiza os cards e verifica na tabela 'resposta' se o aluno já entregou
async function renderizarListaAlunos(container, lista) {
  const respostasSalvas = JSON.parse(localStorage.getItem('tech_student_answers') || '{}');

  const promessas = lista.map(async (atv) => {
    const idStr = String(atv.id);
    let respondida = !!(respostasSalvas[idStr] && respostasSalvas[idStr].length > 0);

    try {
      const res = await fetch(`${API_URL}/atividades/${atv.id}/respostas`);
      if (res.ok) {
        const dadosRespostas = await res.json();
        if (Array.isArray(dadosRespostas) && dadosRespostas.some(r => r.id_aluno === 1)) {
          respondida = true;
        }
      }
    } catch (e) {}

    return `
      <div class="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col space-y-4 relative overflow-hidden">
        <div class="absolute top-0 left-0 w-2 h-full ${atv.type === 'QUIZ' ? 'bg-indigo-600' : 'bg-purple-600'}"></div>
        
        <div class="flex items-center justify-between flex-wrap gap-2 pl-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-900 rounded-xl">${atv.grade}</span>
            <span class="text-xs font-bold px-3 py-1 ${atv.type === 'QUIZ' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'} rounded-xl">${atv.type}</span>
          </div>
          <span class="text-xs font-bold ${respondida ? 'text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full' : 'text-amber-600 bg-amber-50 px-3 py-1 rounded-full'}">
            ${respondida ? '✓ Concluída' : '⏳ Pendente'}
          </span>
        </div>

        <div class="pl-2">
          <h3 class="text-base font-bold text-slate-800">${atv.title}</h3>
          <p class="text-xs text-slate-500 mt-1 leading-relaxed">${atv.description}</p>
        </div>

        ${atv.fileUrl ? `
          <div class="ml-2 p-3 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 overflow-hidden">
              <span class="text-lg">📎</span>
              <span class="text-xs font-bold text-purple-900 truncate">Material de Apoio Anexado</span>
            </div>
            <button type="button" onclick="abrirAnexoPorId('${idStr}')" class="shrink-0 bg-purple-700 hover:bg-purple-800 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition cursor-pointer">
              Abrir / Baixar Anexo
            </button>
          </div>
        ` : ''}

        <div class="pl-2 pt-3 border-t border-slate-100 flex justify-end items-center">
          <button type="button" onclick="iniciarResposta('${idStr}')" class="${respondida ? 'bg-slate-300 text-slate-700' : 'bg-[#5b21b6] hover:bg-purple-900 text-white'} font-bold px-5 py-2 rounded-xl text-xs transition-all shadow-md cursor-pointer">
            ${respondida ? 'Refazer / Reenviar' : (atv.type === 'QUIZ' ? '🎮 Jogar Quiz' : '📝 Enviar Tarefa')}
          </button>
        </div>
      </div>
    `;
  });

  const htmlCards = await Promise.all(promessas);
  container.innerHTML = htmlCards.join('');
}

// 3. Abre PDF ou Imagem do professor convertendo Base64 em Blob nativo
function abrirAnexoPorId(id) {
  const act = window.studentActivities.find(a => String(a.id) === String(id));
  if (!act || !act.fileUrl) return alert("Anexo não encontrado.");

  const url = act.fileUrl;

  if (url.startsWith('data:')) {
    try {
      const arr = url.split(',');
      const mime = arr[0].match(/:(.*?);/)[1];
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const blob = new Blob([u8arr], { type: mime });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (e) {
      alert("Erro ao processar o ficheiro anexo.");
    }
  } else {
    window.open(url, '_blank');
  }
}

// 4. Abre o modal de resposta (Tarefa ou Quiz)
function iniciarResposta(id) {
  atividadeAtualId = String(id);
  const atv = window.studentActivities.find(a => String(a.id) === atividadeAtualId);
  if (!atv) return;

  if (atv.type === 'QUIZ') {
    abrirQuizGame(atv);
  } else {
    const titleEl = document.getElementById('modal-task-title');
    const descEl = document.getElementById('modal-task-desc');
    const textInput = document.getElementById('task-answer-text');
    const fileInput = document.getElementById('task-answer-file');

    if (titleEl) titleEl.innerText = atv.title;
    if (descEl) descEl.innerText = atv.description;
    if (textInput) textInput.value = '';
    if (fileInput) fileInput.value = '';

    const modal = document.getElementById('modal-responder-tarefa');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  }
}

function fecharModalResposta() {
  const modal = document.getElementById('modal-responder-tarefa');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// 5. Processa e comprime ficheiros enviados pelo aluno
function processarArquivoAlunoParaBase64(file) {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 900;
          const scaleSize = MAX_WIDTH / img.width;
          canvas.width = img.width > MAX_WIDTH ? MAX_WIDTH : img.width;
          canvas.height = img.width > MAX_WIDTH ? img.height * scaleSize : img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
      };
      reader.onerror = err => reject(err);
    } else {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = err => reject(err);
    }
  });
}

// 6. Confirma o envio da tarefa (texto e/ou arquivo)
async function confirmarEnvioResposta() {
  const texto = document.getElementById('task-answer-text')?.value.trim() || '';
  const modal = document.getElementById('modal-responder-tarefa');
  const fileInput = document.getElementById('task-answer-file') || modal?.querySelector('input[type="file"]');
  let arquivoBase64 = '';

  if (fileInput && fileInput.files && fileInput.files.length > 0) {
    const file = fileInput.files[0];
    if (file.size > 3 * 1024 * 1024) {
      alert("⚠️ O arquivo é muito grande! Envie um PDF ou imagem de até 3MB.");
      return;
    }
    arquivoBase64 = await processarArquivoAlunoParaBase64(file);
  }

  if (!texto && !arquivoBase64) {
    alert('Por favor, escreva uma resposta ou anexe um arquivo antes de enviar.');
    return;
  }

  const textoFinal = texto || 'Arquivo enviado em anexo.';
  await salvarSubmissao(textoFinal, arquivoBase64);

  if (fileInput) fileInput.value = '';
  alert('🎉 Resposta enviada com sucesso para o professor!');
  fecharModalResposta();
  carregarAtividadesDoAluno();
}

// 7. Lógica do Quiz Interativo
function abrirQuizGame(atv) {
  const modal = document.getElementById('modal-quiz-game');
  const body = document.getElementById('quiz-game-body');
  if (!modal || !body) return;

  // Normaliza para sempre ser uma lista válida de perguntas com opções
  let listaPerguntas = [];
  if (Array.isArray(atv.quizData) && atv.quizData.length > 0) {
    listaPerguntas = atv.quizData;
  } else if (atv.quizData && Array.isArray(atv.quizData.options)) {
    listaPerguntas = [atv.quizData];
  } else {
    listaPerguntas = [{
      question: "Qual é a alternativa correta para este desafio?",
      options: ["Alternativa A (Correta)", "Alternativa B", "Alternativa C"],
      correctIndex: 0
    }];
  }

  window.currentQuizState = {
    atv: atv,
    perguntas: listaPerguntas,
    indiceAtual: 0,
    acertos: 0
  };

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  renderizarPerguntaAtualQuiz();
}

function renderizarPerguntaAtualQuiz() {
  const body = document.getElementById('quiz-game-body');
  const state = window.currentQuizState;
  if (!body || !state) return;

  const qData = state.perguntas[state.indiceAtual];
  const opcoes = Array.isArray(qData.options) ? qData.options : ["Opção A", "Opção B", "Opção C"];

  body.innerHTML = `
    <div class="space-y-4">
      <div class="bg-purple-700 text-white p-4 rounded-2xl flex justify-between items-center">
        <div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-yellow-300">
            Questão ${state.indiceAtual + 1} de ${state.perguntas.length}
          </span>
          <h3 class="text-base font-bold mt-0.5">${state.atv.title}</h3>
        </div>
        <span class="text-xs font-extrabold bg-purple-900 px-3 py-1 rounded-xl">⭐ ${state.acertos} acertos</span>
      </div>
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
        <p class="text-xs font-bold text-slate-800">${qData.question}</p>
        <div class="space-y-2">
          ${opcoes.map((opt, idx) => `
            <button type="button" onclick="responderPerguntaQuiz(${idx === (qData.correctIndex || 0)})" class="w-full text-left text-xs p-3 bg-white border border-slate-200 hover:bg-purple-600 hover:text-white font-bold text-slate-700 rounded-xl transition cursor-pointer">
              ${String.fromCharCode(65 + idx)}) ${opt}
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

async function responderPerguntaQuiz(acertou) {
  const state = window.currentQuizState;
  if (!state) return;

  if (acertou) state.acertos++;

  if (state.indiceAtual + 1 < state.perguntas.length) {
    state.indiceAtual++;
    renderizarPerguntaAtualQuiz();
  } else {
    const total = state.perguntas.length;
    const pontos = state.acertos * 100;
    const texto = `Quiz Concluído — Acertou ${state.acertos} de ${total} questões [+${pontos} PTS]`;

    await salvarSubmissao(texto, '');
    alert(`🎉 Quiz finalizado! Você acertou ${state.acertos} de ${total} perguntas!`);
    fecharQuizGame();
    carregarAtividadesDoAluno();
  }
}

// 8. Salva a resposta localmente e envia para a tabela 'resposta' do Supabase
async function salvarSubmissao(texto, arquivoUrl = '') {
  const idStr = String(atividadeAtualId);
  
  const conteudoParaBanco = arquivoUrl 
    ? `${texto}|||ANEXO_ALUNO|||${arquivoUrl}` 
    : texto;

  const respostasSalvas = JSON.parse(localStorage.getItem('tech_student_answers') || '{}');
  if (!respostasSalvas[idStr]) respostasSalvas[idStr] = [];
  
  respostasSalvas[idStr].push({
    aluno: 'Lucas Silva (Aluno)',
    data: new Date().toLocaleDateString('pt-BR'),
    respostaTexto: texto,
    arquivoUrl: arquivoUrl
  });
  localStorage.setItem('tech_student_answers', JSON.stringify(respostasSalvas));

  try {
    await fetch(`${API_URL}/atividades/resposta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_aluno: 1,
        id_atividade: Number(atividadeAtualId),
        conteudo_resposta: conteudoParaBanco
      })
    });
  } catch (e) {
    console.warn("API offline, resposta salva localmente.");
  }
}