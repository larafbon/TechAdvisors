const API_URL = 'http://127.0.0.1:8000';
let atividadeAtualId = null;
window.studentActivities = [];
window.studentSubmissionsMap = {};

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

// 2. Renderiza os cards e garante TENTATIVA ÚNICA por aluno
async function renderizarListaAlunos(container, lista) {
  const respostasSalvas = JSON.parse(localStorage.getItem('tech_student_answers') || '{}');
  window.studentSubmissionsMap = {};

  const promessas = lista.map(async (atv) => {
    const idStr = String(atv.id);
    let entregaAluno = (respostasSalvas[idStr] && respostasSalvas[idStr][0]) || null;

    try {
      const res = await fetch(`${API_URL}/atividades/${atv.id}/respostas`);
      if (res.ok) {
        const dadosRespostas = await res.json();
        if (Array.isArray(dadosRespostas)) {
          const doAluno = dadosRespostas.find(r => r.id_aluno === 1);
          if (doAluno) {
            const raw = doAluno.conteudo_resposta || '';
            entregaAluno = {
              respostaTexto: raw.split('|||ANEXO_ALUNO|||')[0],
              data: doAluno.data_resposta ? new Date(doAluno.data_resposta).toLocaleDateString('pt-BR') : 'Concluída'
            };
          }
        }
      }
    } catch (e) {}

    const respondida = !!entregaAluno;
    if (respondida) {
      window.studentSubmissionsMap[idStr] = entregaAluno;
    }

    let qtdQuestoes = 0;
    let totalPontosMax = 0;
    if (atv.type === 'QUIZ' && atv.quizData) {
      const arrQ = Array.isArray(atv.quizData) ? atv.quizData : [atv.quizData];
      qtdQuestoes = arrQ.length;
      totalPontosMax = arrQ.reduce((acc, q) => acc + (Number(q.points) || 100), 0);
    }

    return `
      <div class="bg-white rounded-3xl p-6 border ${respondida ? 'border-emerald-200/80 bg-emerald-50/10' : 'border-slate-100'} shadow-sm flex flex-col space-y-4 relative overflow-hidden mb-5 transition-all">
        <div class="absolute top-0 left-0 w-2 h-full ${respondida ? 'bg-emerald-500' : (atv.type === 'QUIZ' ? 'bg-indigo-600' : 'bg-purple-600')}"></div>
        
        <div class="flex items-center justify-between flex-wrap gap-2 pl-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-900 rounded-xl">${atv.grade}</span>
            <span class="text-xs font-bold px-3 py-1 ${atv.type === 'QUIZ' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'} rounded-xl">${atv.type}</span>
            ${qtdQuestoes > 0 ? `<span class="text-[11px] font-bold px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl">🎯 ${qtdQuestoes} questão${qtdQuestoes > 1 ? 'ões' : ''} • ⭐ ${totalPontosMax} pts</span>` : ''}
          </div>
          <span class="text-xs font-bold ${respondida ? 'text-emerald-700 bg-emerald-100 px-3.5 py-1 rounded-full' : 'text-amber-600 bg-amber-50 px-3 py-1 rounded-full'}">
            ${respondida ? '✓ Concluída (Tentativa Única)' : '⏳ Pendente'}
          </span>
        </div>

        <div class="pl-2">
          <h3 class="text-base sm:text-lg font-bold text-slate-800">${atv.title}</h3>
          <p class="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">${atv.description}</p>
        </div>

        ${atv.fileUrl ? `
          <div class="ml-2 p-3 bg-purple-50/60 border border-purple-100 rounded-2xl flex items-center justify-between gap-3">
            <div class="flex items-center gap-2 overflow-hidden">
              <span class="text-lg">📎</span>
              <span class="text-xs font-bold text-purple-900 truncate">Material de Apoio Anexado</span>
            </div>
            <button type="button" onclick="abrirAnexoPorId('${idStr}')" class="shrink-0 bg-purple-700 hover:bg-purple-800 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition cursor-pointer">
              Abrir / Baixar Anexo
            </button>
          </div>
        ` : ''}

        ${respondida ? `
          <div class="ml-2 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div class="text-xs text-emerald-900">
              <span class="font-extrabold block">🔒 Resposta Registrada (${entregaAluno.data || 'Enviada'})</span>
              <span class="text-[11px] text-emerald-700 font-medium">${entregaAluno.respostaTexto}</span>
            </div>
            <span class="text-[11px] font-extrabold text-emerald-700 bg-white px-3 py-1 rounded-xl border border-emerald-200 shrink-0 self-start sm:self-center">
              ✓ Entregue
            </span>
          </div>
        ` : `
          <div class="pl-2 pt-3 border-t border-slate-100 flex justify-end items-center">
            <button type="button" onclick="iniciarResposta('${idStr}')" class="bg-[#5b21b6] hover:bg-purple-900 text-white font-bold px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-all shadow-md cursor-pointer">
              ${atv.type === 'QUIZ' ? '🎮 Iniciar Quiz (1 Tentativa)' : '📝 Enviar Tarefa'}
            </button>
          </div>
        `}
      </div>
    `;
  });

  const htmlCards = await Promise.all(promessas);
  container.innerHTML = htmlCards.join('');
}

// 3. Abre PDF ou Imagem do professor convertendo Base64 em Blob nativo (INTACTO)
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

// 4. Abre o modal de resposta (Bloqueia se já foi respondido)
function iniciarResposta(id) {
  atividadeAtualId = String(id);
  if (window.studentSubmissionsMap[atividadeAtualId]) {
    alert("⚠️ Você já concluiu esta atividade. Apenas uma resposta por aluno é permitida.");
    return;
  }

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

// 5. Processa e comprime ficheiros enviados pelo aluno (INTACTO)
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

// 6. Confirma o envio da tarefa (texto e/ou arquivo) (INTACTO)
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

// 7. Lógica da Arena Quizizz Gamificada (Ampliada, com Cronômetro e Explicação)
function abrirQuizGame(atv) {
  const modal = document.getElementById('modal-quiz-game');
  const body = document.getElementById('quiz-game-body');
  if (!modal || !body) return;

  let listaPerguntas = [];
  if (Array.isArray(atv.quizData) && atv.quizData.length > 0) {
    listaPerguntas = atv.quizData;
  } else if (atv.quizData && Array.isArray(atv.quizData.options)) {
    listaPerguntas = [atv.quizData];
  } else {
    listaPerguntas = [{
      type: 'MULTIPLA',
      question: "Qual é a alternativa correta para este desafio?",
      options: ["Alternativa A (Correta)", "Alternativa B", "Alternativa C"],
      correctIndex: 0,
      timeLimit: 30,
      points: 100,
      explanation: ''
    }];
  }

  window.currentQuizState = {
    atv: atv,
    perguntas: listaPerguntas,
    indiceAtual: 0,
    acertos: 0,
    pontosTotais: 0,
    streak: 0,
    bloqueado: false,
    timerInterval: null
  };

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  renderizarPerguntaAtualQuiz();
}

function limparCronometroQuiz() {
  if (window.currentQuizState && window.currentQuizState.timerInterval) {
    clearInterval(window.currentQuizState.timerInterval);
    window.currentQuizState.timerInterval = null;
  }
}

function fecharQuizGame() {
  limparCronometroQuiz();
  const modal = document.getElementById('modal-quiz-game');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  window.currentQuizState = null;
}

function renderizarPerguntaAtualQuiz() {
  limparCronometroQuiz();
  const body = document.getElementById('quiz-game-body');
  const state = window.currentQuizState;
  if (!body || !state) return;

  const qData = state.perguntas[state.indiceAtual];
  const total = state.perguntas.length;
  const progressoPct = Math.round(((state.indiceAtual) / total) * 100);
  const opcoes = Array.isArray(qData.options) ? qData.options : ["Opção A", "Opção B"];
  const isVF = qData.type === 'VF' || (opcoes.length === 2 && opcoes[0] === 'Verdadeiro');
  const isEnquete = qData.type === 'ENQUETE';
  const tempoLimite = Number(qData.timeLimit || 0);
  const valorPontos = Number(qData.points || 100);

  const tipoBadge = isEnquete ? '📊 Enquete / Opinião' : (isVF ? '⚖️ Verdadeiro ou Falso' : '🎯 Múltipla Escolha');
  const simbolos = ['▲', '◆', '●', '■'];

  const estilosOpcoes = [
    { bg: 'bg-emerald-600 hover:bg-emerald-700 border-emerald-800', badge: 'bg-emerald-800' },
    { bg: 'bg-blue-600 hover:bg-blue-700 border-blue-800', badge: 'bg-blue-800' },
    { bg: 'bg-amber-500 hover:bg-amber-600 border-amber-700', badge: 'bg-amber-700' },
    { bg: 'bg-rose-600 hover:bg-rose-700 border-rose-800', badge: 'bg-rose-800' }
  ];

  body.innerHTML = `
    <div class="space-y-5">
      <!-- Placar Superior Gamificado -->
      <div class="bg-gradient-to-r from-[#3332A5] via-indigo-800 to-purple-800 text-white p-5 sm:p-6 rounded-3xl space-y-4 shadow-lg">
        <div class="flex flex-wrap justify-between items-center gap-3">
          <div>
            <span class="text-xs font-extrabold uppercase tracking-wider text-yellow-300 block">
              Questão ${state.indiceAtual + 1} de ${total} • ${tipoBadge}
            </span>
            <h3 class="text-base sm:text-lg font-bold mt-1 line-clamp-1">${state.atv.title}</h3>
          </div>
          <div class="flex items-center gap-2.5 shrink-0">
            ${tempoLimite > 0 ? `
              <span id="quiz-timer-badge" class="text-xs sm:text-sm font-extrabold bg-amber-400 text-purple-950 px-3.5 py-1.5 rounded-2xl shadow-sm">
                ⏱️ ${tempoLimite}s
              </span>
            ` : ''}
            ${state.streak >= 2 ? `<span class="text-xs font-extrabold bg-orange-500 text-white px-3 py-1.5 rounded-2xl animate-pulse">🔥 ${state.streak}x</span>` : ''}
            <span class="text-xs sm:text-sm font-extrabold bg-white/15 px-3.5 py-1.5 rounded-2xl border border-white/10">⭐ ${state.pontosTotais} pts</span>
          </div>
        </div>

        <!-- Barra de Progresso -->
        <div class="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div class="h-full bg-yellow-400 transition-all duration-300" style="width: ${progressoPct}%"></div>
        </div>
      </div>

      <!-- Card Ampliado da Pergunta -->
      <div class="p-6 sm:p-7 bg-slate-50 border border-slate-200 rounded-3xl space-y-5">
        <div class="flex items-center justify-between">
          <span class="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-xl">Enunciado</span>
          <span class="text-xs font-extrabold text-amber-700 bg-amber-100 px-3 py-1 rounded-xl">Valendo +${valorPontos} PTS</span>
        </div>

        <p class="text-base sm:text-lg font-bold text-slate-800 leading-relaxed">${qData.question}</p>

        <div id="quiz-options-grid" class="grid grid-cols-1 ${isVF ? 'sm:grid-cols-2' : ''} gap-3.5 pt-1">
          ${opcoes.map((opt, idx) => {
            const st = estilosOpcoes[idx % 4];
            const icone = isVF ? (idx === 0 ? '✓' : '✕') : simbolos[idx % 4];
            return `
              <button type="button" data-opt-idx="${idx}" onclick="responderPerguntaQuiz(${idx})" class="quiz-opt-btn ${st.bg} text-white border-b-4 text-left text-sm sm:text-base p-4 sm:p-5 font-bold rounded-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 flex items-center gap-3.5 cursor-pointer shadow-md">
                <span class="w-8 h-8 rounded-xl ${st.badge} flex items-center justify-center text-sm font-extrabold shrink-0 shadow-inner">${icone}</span>
                <span class="leading-snug">${opt}</span>
              </button>
            `;
          }).join('')}
        </div>

        <!-- Banner de Feedback e Explicação -->
        <div id="quiz-feedback-banner" class="hidden p-4 rounded-2xl text-xs sm:text-sm font-bold space-y-1.5"></div>
      </div>
    </div>
  `;

  // Inicia cronômetro regressivo se a questão tiver tempo limite
  if (tempoLimite > 0) {
    let restante = tempoLimite;
    state.timerInterval = setInterval(() => {
      restante--;
      const timerEl = document.getElementById('quiz-timer-badge');
      if (timerEl) {
        timerEl.innerText = `⏱️ ${restante}s`;
        if (restante <= 5) {
          timerEl.className = 'text-xs sm:text-sm font-extrabold bg-rose-500 text-white px-3.5 py-1.5 rounded-2xl animate-bounce';
        }
      }
      if (restante <= 0) {
        limparCronometroQuiz();
        responderPerguntaQuiz(-1); // Tempo esgotado
      }
    }, 1000);
  }
}

function responderPerguntaQuiz(indiceEscolhido) {
  const state = window.currentQuizState;
  if (!state || state.bloqueado) return;
  state.bloqueado = true;
  limparCronometroQuiz();

  const qData = state.perguntas[state.indiceAtual];
  const isEnquete = qData.type === 'ENQUETE';
  const correctIdx = Number(qData.correctIndex ?? 0);
  const valorPontos = Number(qData.points || 100);
  const tempoEsgotado = indiceEscolhido === -1;

  const acertou = !tempoEsgotado && (isEnquete || indiceEscolhido === correctIdx);

  if (acertou) {
    state.acertos++;
    state.pontosTotais += valorPontos;
    state.streak++;
  } else {
    state.streak = 0;
  }

  // Feedback visual instantâneo nos botões
  document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
    const idx = Number(btn.dataset.optIdx);
    btn.classList.add('pointer-events-none');

    if (isEnquete) {
      if (idx === indiceEscolhido) {
        btn.className = 'quiz-opt-btn bg-indigo-700 border-indigo-950 ring-4 ring-indigo-300 text-white border-b-4 text-left text-sm sm:text-base p-4 sm:p-5 font-bold rounded-2xl flex items-center gap-3.5 shadow-md';
      } else {
        btn.classList.add('opacity-40');
      }
    } else if (idx === correctIdx) {
      btn.className = 'quiz-opt-btn bg-emerald-600 border-emerald-900 ring-4 ring-emerald-300 text-white border-b-4 text-left text-sm sm:text-base p-4 sm:p-5 font-bold rounded-2xl flex items-center gap-3.5 shadow-md';
    } else if (idx === indiceEscolhido && !acertou) {
      btn.className = 'quiz-opt-btn bg-rose-600 border-rose-900 opacity-95 text-white border-b-4 text-left text-sm sm:text-base p-4 sm:p-5 font-bold rounded-2xl flex items-center gap-3.5';
    } else {
      btn.classList.add('opacity-35');
    }
  });

  const banner = document.getElementById('quiz-feedback-banner');
  const explicacaoHtml = qData.explanation
    ? `<p class="text-xs font-medium mt-1 pt-1.5 border-t border-black/10">💡 <strong>Comentário do Professor:</strong> ${qData.explanation}</p>`
    : '';

  if (banner) {
    banner.classList.remove('hidden');
    if (tempoEsgotado) {
      banner.className = 'p-4 rounded-2xl text-xs sm:text-sm font-extrabold bg-amber-100 text-amber-950 border border-amber-300';
      banner.innerHTML = `<div>⏰ Tempo esgotado!</div>${explicacaoHtml}`;
    } else if (isEnquete) {
      banner.className = 'p-4 rounded-2xl text-xs sm:text-sm font-extrabold bg-indigo-100 text-indigo-950 border border-indigo-300';
      banner.innerHTML = `<div>📊 Voto registrado! +${valorPontos} PTS</div>${explicacaoHtml}`;
    } else if (acertou) {
      banner.className = 'p-4 rounded-2xl text-xs sm:text-sm font-extrabold bg-emerald-100 text-emerald-950 border border-emerald-300';
      banner.innerHTML = `<div>🎉 Resposta Correta! +${valorPontos} PTS</div>${explicacaoHtml}`;
    } else {
      const textoCorreta = qData.options?.[correctIdx] || '';
      banner.className = 'p-4 rounded-2xl text-xs sm:text-sm font-extrabold bg-rose-100 text-rose-950 border border-rose-300';
      banner.innerHTML = `<div>❌ Ops! A resposta correta era: <span class="underline">${textoCorreta}</span></div>${explicacaoHtml}`;
    }
  }

  // Dá um tempo extra se houver explicação do professor para o aluno conseguir ler
  const delayAvanco = qData.explanation ? 2400 : 1500;

  setTimeout(() => {
    if (!window.currentQuizState) return;
    if (state.indiceAtual + 1 < state.perguntas.length) {
      state.indiceAtual++;
      state.bloqueado = false;
      renderizarPerguntaAtualQuiz();
    } else {
      exibirTelaFinalQuiz();
    }
  }, delayAvanco);
}

async function exibirTelaFinalQuiz() {
  limparCronometroQuiz();
  const body = document.getElementById('quiz-game-body');
  const state = window.currentQuizState;
  if (!body || !state) return;

  const total = state.perguntas.length;
  const acertos = state.acertos;
  const pontos = state.pontosTotais;
  const percentual = Math.round((acertos / total) * 100);

  const textoEntrega = `Quiz Concluído (Tentativa Única) — Acertou ${acertos} de ${total} questões (${percentual}%) [+${pontos} PTS]`;
  await salvarSubmissao(textoEntrega, '');

  body.innerHTML = `
    <div class="text-center space-y-6 py-5">
      <div class="w-20 h-20 mx-auto rounded-3xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-4xl shadow-inner">
        🏆
      </div>
      <div>
        <span class="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-3.5 py-1 rounded-full">Tentativa Concluída</span>
        <h3 class="text-2xl font-extrabold text-slate-800 mt-2.5">${percentual >= 70 ? 'Excelente Desempenho!' : 'Quiz Finalizado!'}</h3>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Sua resposta única já foi registrada no painel do professor.</p>
      </div>

      <div class="grid grid-cols-3 gap-4 bg-slate-50 p-5 rounded-3xl border border-slate-200 max-w-lg mx-auto">
        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase">Acertos</p>
          <p class="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">${acertos}/${total}</p>
        </div>
        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase">Aproveitamento</p>
          <p class="text-xl sm:text-2xl font-extrabold text-indigo-700 mt-0.5">${percentual}%</p>
        </div>
        <div>
          <p class="text-[11px] font-bold text-slate-400 uppercase">Pontuação</p>
          <p class="text-xl sm:text-2xl font-extrabold text-amber-600 mt-0.5">+${pontos}</p>
        </div>
      </div>

      <button type="button" onclick="fecharQuizGame(); carregarAtividadesDoAluno();" class="w-full max-w-md mx-auto py-3.5 bg-[#3332A5] hover:bg-indigo-900 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg transition cursor-pointer">
        Concluir e Voltar às Atividades
      </button>
    </div>
  `;
}

// 8. Salva a resposta localmente e envia para a tabela 'resposta' do Supabase (INTACTO)
async function salvarSubmissao(texto, arquivoUrl = '') {
  const idStr = String(atividadeAtualId);
  
  const conteudoParaBanco = arquivoUrl 
    ? `${texto}|||ANEXO_ALUNO|||${arquivoUrl}` 
    : texto;

  const respostasSalvas = JSON.parse(localStorage.getItem('tech_student_answers') || '{}');
  // Garante tentativa única também no armazenamento local
  respostasSalvas[idStr] = [{
    aluno: 'Lucas Silva (Aluno)',
    data: new Date().toLocaleDateString('pt-BR'),
    respostaTexto: texto,
    arquivoUrl: arquivoUrl
  }];
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