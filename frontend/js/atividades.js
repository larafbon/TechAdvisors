const API_URL = 'http://127.0.0.1:8000';
let atividadeAtualId = null;
window.studentActivities = [];
window.studentSubmissionsMap = {};

// =========================================================
// CENTRAL DE ACESSIBILIDADE NEURODIVERGENTE DE ALTA PRECISÃO
// =========================================================
const PERFIS_INCLUSIVOS = {
  PADRAO: {
    label: 'Perfil Padrão',
    descricao: 'Experiência gamificada padrão com cronômetro e cores originais.',
    theme: 'default',
    fontScale: 1.0,
    noTimer: false,
    twoStepConfirm: false,
    readingRuler: false,
    wideSpacing: false,
    tdahKeywords: false,
    bionicReading: false,
    syllables: false,
    calmColors: false,
    allowEliminate: false,
    voiceRate: 0.95
  },
  TEA: {
    label: '🧩 Autismo (TEA)',
    descricao: 'Roteiro visual previsível, cores calmas sem animações bruscas, sem cronômetro e confirmação em 2 cliques.',
    theme: 'calm',
    fontScale: 1.05,
    noTimer: true,
    twoStepConfirm: true,
    readingRuler: false,
    wideSpacing: false,
    tdahKeywords: false,
    bionicReading: false,
    syllables: false,
    calmColors: true,
    allowEliminate: false,
    voiceRate: 0.9
  },
  TDAH: {
    label: '⚡ TDAH (Hiperfoco)',
    descricao: 'Modo Spotlight sem distrações, Leitura Biônica + palavras-chave, descarte de alternativas e 2 cliques.',
    theme: 'default',
    fontScale: 1.05,
    noTimer: false,
    twoStepConfirm: true,
    readingRuler: false,
    wideSpacing: false,
    tdahKeywords: true,
    bionicReading: true,
    syllables: false,
    calmColors: false,
    allowEliminate: true,
    voiceRate: 1.0
  },
  DISLEXIA: {
    label: '📖 Dislexia',
    descricao: 'Papel creme suave, fonte espaçada, régua guia, leitor de voz por alternativa e divisão silábica.',
    theme: 'cream',
    fontScale: 1.15,
    noTimer: true,
    twoStepConfirm: false,
    readingRuler: true,
    wideSpacing: true,
    tdahKeywords: false,
    bionicReading: false,
    syllables: true,
    calmColors: false,
    voiceRate: 0.8
  }
};

let a11yState = JSON.parse(localStorage.getItem('tech_quiz_inclusive_v2')) || {
  profile: 'PADRAO',
  ...PERFIS_INCLUSIVOS.PADRAO
};

function salvarEstadoA11y() {
  localStorage.setItem('tech_quiz_inclusive_v2', JSON.stringify(a11yState));
}

function togglePainelPersonalizacao() {
  const drawer = document.getElementById('quiz-custom-drawer');
  if (drawer) drawer.classList.toggle('hidden');
}

function selecionarPerfilInclusivo(profileKey) {
  const preset = PERFIS_INCLUSIVOS[profileKey] || PERFIS_INCLUSIVOS.PADRAO;
  a11yState = {
    profile: profileKey,
    ...preset
  };
  salvarEstadoA11y();
  aplicarEstadoVisualA11y();

  if (window.currentQuizState) {
    renderizarPerguntaAtualQuiz();
  }
}

function alterarEscalaFonte(delta) {
  a11yState.profile = 'CUSTOM';
  a11yState.fontScale = Math.min(1.45, Math.max(0.85, Number((a11yState.fontScale + delta).toFixed(2))));
  salvarEstadoA11y();
  aplicarEstadoVisualA11y();
}

function aplicarAjusteManual() {
  a11yState.profile = 'CUSTOM';
  a11yState.theme = document.getElementById('custom-theme-select')?.value || 'default';
  a11yState.voiceRate = Number(document.getElementById('custom-voice-rate')?.value || 0.95);
  a11yState.noTimer = !!document.getElementById('chk-no-timer')?.checked;
  a11yState.twoStepConfirm = !!document.getElementById('chk-two-step')?.checked;
  a11yState.readingRuler = !!document.getElementById('chk-reading-ruler')?.checked;
  a11yState.wideSpacing = !!document.getElementById('chk-wide-spacing')?.checked;
  a11yState.tdahKeywords = !!document.getElementById('chk-tdah-keywords')?.checked;
  a11yState.bionicReading = !!document.getElementById('chk-tdah-keywords')?.checked;
  a11yState.syllables = !!document.getElementById('chk-syllables')?.checked;
  a11yState.calmColors = !!document.getElementById('chk-calm-colors')?.checked;
  a11yState.allowEliminate = !!document.getElementById('chk-allow-eliminate')?.checked;

  salvarEstadoA11y();
  aplicarEstadoVisualA11y();

  if (window.currentQuizState) {
    renderizarPerguntaAtualQuiz();
  }
}

function aplicarEstadoVisualA11y() {
  const modal = document.getElementById('modal-quiz-game');
  if (!modal) return;

  modal.classList.remove(
    'mode-tea', 'mode-tdah', 'mode-dislexia',
    'theme-cream', 'theme-calm', 'theme-dark',
    'hide-timer', 'wide-spacing'
  );

  if (a11yState.profile === 'TEA' || a11yState.calmColors) modal.classList.add('mode-tea');
  if (a11yState.profile === 'TDAH') modal.classList.add('mode-tdah');
  if (a11yState.profile === 'DISLEXIA') modal.classList.add('mode-dislexia');

  if (a11yState.theme === 'cream') modal.classList.add('theme-cream');
  if (a11yState.theme === 'calm') modal.classList.add('theme-calm');
  if (a11yState.theme === 'dark') modal.classList.add('theme-dark');

  if (a11yState.noTimer) modal.classList.add('hide-timer');
  if (a11yState.wideSpacing) modal.classList.add('wide-spacing');

  const body = document.getElementById('quiz-game-body');
  if (body) {
    body.style.fontSize = `${Math.round(a11yState.fontScale * 100)}%`;
  }
  const fontValEl = document.getElementById('custom-font-value');
  if (fontValEl) fontValEl.innerText = `${Math.round(a11yState.fontScale * 100)}%`;

  const ruler = document.getElementById('reading-ruler-bar');
  if (ruler) {
    if (a11yState.readingRuler) ruler.classList.remove('hidden');
    else ruler.classList.add('hidden');
  }

  const themeSel = document.getElementById('custom-theme-select');
  if (themeSel) themeSel.value = a11yState.theme;

  const voiceSel = document.getElementById('custom-voice-rate');
  if (voiceSel) voiceSel.value = String(a11yState.voiceRate);

  const mapChecks = {
    'chk-no-timer': a11yState.noTimer,
    'chk-two-step': a11yState.twoStepConfirm,
    'chk-reading-ruler': a11yState.readingRuler,
    'chk-wide-spacing': a11yState.wideSpacing,
    'chk-tdah-keywords': a11yState.tdahKeywords,
    'chk-syllables': a11yState.syllables,
    'chk-calm-colors': a11yState.calmColors,
    'chk-allow-eliminate': a11yState.allowEliminate
  };
  Object.entries(mapChecks).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.checked = !!val;
  });

  const badge = document.getElementById('quiz-a11y-status-badge');
  const descBox = document.getElementById('quiz-a11y-description');
  if (a11yState.profile === 'CUSTOM') {
    if (badge) badge.innerText = '🎛️ Perfil Personalizado';
    if (descBox) descBox.innerHTML = '<span>Configuração personalizada ativa com suas preferências combinadas.</span>';
  } else {
    const info = PERFIS_INCLUSIVOS[a11yState.profile] || PERFIS_INCLUSIVOS.PADRAO;
    if (badge) badge.innerText = info.label;
    if (descBox) descBox.innerHTML = `<span>${info.descricao}</span>`;
  }

  document.querySelectorAll('.a11y-profile-btn').forEach(btn => {
    btn.classList.remove('bg-purple-700', 'text-white');
    btn.classList.add('bg-white', 'text-slate-700');
  });
  const activeBtn = document.getElementById(`btn-profile-${a11yState.profile}`);
  if (activeBtn) {
    activeBtn.classList.add('bg-purple-700', 'text-white');
    activeBtn.classList.remove('bg-white', 'text-slate-700');
  }
}

// =========================================================
// MOTOR DE PROCESSAMENTO COGNITIVO DE TEXTO (TDAH & DISLEXIA)
// =========================================================
function separarSilabasPortugues(palavra) {
  if (palavra.length <= 4) return palavra;
  // Separação silábica heurística para auxiliar decodificação fonológica na dislexia
  return palavra.replace(/([^aeiouáéíóúâêôãõü])([aeiouáéíóúâêôãõü])/gi, '·$1$2')
                .replace(/^·/, '')
                .replace(/([aeiouáéíóúâêôãõü])([bcdfgjklmnpqrstvwxz])([bcdfgjklmnpqrstvwxz])/gi, '$1$2·$3');
}

function aplicarLeituraBionica(palavra) {
  if (palavra.length <= 2) return `<span class="bionic-lead">${palavra}</span>`;
  const corte = Math.ceil(palavra.length * 0.42);
  return `<span class="bionic-lead">${palavra.slice(0, corte)}</span>${palavra.slice(corte)}`;
}

function processarTextoAcessivel(texto) {
  if (!texto) return '';

  const palavrasChaveRegex = /^(não|nunca|exceto|incorreta|correta|falso|verdadeiro|calcule|identifique|assinale|principal|menor|maior|apenas|somente|sempre)$/i;

  return texto.split(/(\s+)/).map(token => {
    if (/^\s+$/.test(token)) return token;

    const matchPontuacao = token.match(/^([^\wÀ-ÿ]*)([\wÀ-ÿ-]+)([^\wÀ-ÿ]*)$/);
    if (!matchPontuacao) return token;

    const [, prefixo, nucleo, sufixo] = matchPontuacao;
    let processado = nucleo;

    // 1. Separação silábica (Dislexia)
    if (a11yState.syllables) {
      processado = separarSilabasPortugues(processado);
    }

    // 2. Destaque de palavras-chave e Leitura Biônica (TDAH)
    if (a11yState.tdahKeywords && palavrasChaveRegex.test(nucleo)) {
      processado = `<span class="tdah-keyword">${processado}</span>`;
    } else if (a11yState.bionicReading && !a11yState.syllables) {
      processado = aplicarLeituraBionica(processado);
    }

    return `${prefixo}${processado}${sufixo}`;
  }).join('');
}

// =========================================================
// LEITOR DE VOZ (TTS) GRANULAR COM DESTAQUE VISUAL (KARAOKÊ)
// =========================================================
function limparDestaquesVoz() {
  document.querySelectorAll('.tts-speaking-highlight').forEach(el => {
    el.classList.remove('tts-speaking-highlight');
  });
}

function falarTextoComDestaque(texto, elementoAlvo = null) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  limparDestaquesVoz();

  if (elementoAlvo) {
    elementoAlvo.classList.add('tts-speaking-highlight');
  }

  const utterance = new SpeechSynthesisUtterance(texto);
  utterance.lang = 'pt-BR';
  utterance.rate = a11yState.voiceRate || 0.95;

  utterance.onend = () => limparDestaquesVoz();
  utterance.onerror = () => limparDestaquesVoz();

  window.speechSynthesis.speak(utterance);
}

function lerQuestaoAtualEmVozAlta() {
  const state = window.currentQuizState;
  if (!state) return;

  const qData = state.perguntas[state.indiceAtual];
  const letras = ['A', 'B', 'C', 'D'];
  const textoOpcoes = (qData.options || [])
    .map((opt, idx) => `Alternativa ${letras[idx] || idx + 1}: ${opt}`)
    .join('. ');

  const boxEnunciado = document.getElementById('quiz-question-box-el');
  falarTextoComDestaque(`${qData.question}. ${textoOpcoes}`, boxEnunciado);
}

function lerAlternativaIndividual(event, idx) {
  if (event) event.stopPropagation();
  const state = window.currentQuizState;
  if (!state) return;

  const qData = state.perguntas[state.indiceAtual];
  const letras = ['A', 'B', 'C', 'D'];
  const texto = `Alternativa ${letras[idx] || idx + 1}: ${qData.options?.[idx] || ''}`;
  const cardEl = document.getElementById(`opt-wrapper-${idx}`);
  falarTextoComDestaque(texto, cardEl);
}

// =========================================================
// RÉGUA DE LEITURA E ATALHOS DE TECLADO (ACESSIBILIDADE MOTORA)
// =========================================================
document.addEventListener('mousemove', (e) => {
  if (!a11yState.readingRuler) return;
  const ruler = document.getElementById('reading-ruler-bar');
  if (ruler && !ruler.classList.contains('hidden')) {
    ruler.style.top = `${e.clientY}px`;
  }
});

document.addEventListener('touchmove', (e) => {
  if (!a11yState.readingRuler || !e.touches[0]) return;
  const ruler = document.getElementById('reading-ruler-bar');
  if (ruler && !ruler.classList.contains('hidden')) {
    ruler.style.top = `${e.touches[0].clientY}px`;
  }
}, { passive: true });

document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('modal-quiz-game');
  if (!modal || modal.classList.contains('hidden') || !window.currentQuizState) return;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

  const tecla = e.key.toLowerCase();
  const mapaOpcoes = { '1': 0, 'a': 0, '2': 1, 'b': 1, '3': 2, 'c': 2, '4': 3, 'd': 3 };

  if (tecla in mapaOpcoes) {
    const idx = mapaOpcoes[tecla];
    const totalOpts = window.currentQuizState.perguntas[window.currentQuizState.indiceAtual]?.options?.length || 0;
    if (idx < totalOpts) {
      e.preventDefault();
      aoClicarAlternativa(idx);
    }
  } else if (tecla === 'enter' && a11yState.twoStepConfirm && window.currentQuizState.selecaoPendente !== null) {
    e.preventDefault();
    confirmarEscolhaPendente();
  } else if (tecla === 'r') {
    e.preventDefault();
    lerQuestaoAtualEmVozAlta();
  } else if (tecla === 'p') {
    e.preventDefault();
    const overlay = document.getElementById('sensory-pause-overlay');
    if (overlay && overlay.classList.contains('hidden')) abrirPausaSensorial();
    else fecharPausaSensorial();
  }
});

// =========================================================
// PAUSA SENSORIAL, RESPIRAÇÃO GUIADA & SOM CALMANTE (WEB AUDIO)
// =========================================================
let breathingInterval = null;
let audioCtx = null;
let rainNoiseNode = null;

function alternarSomCalmante() {
  const btn = document.getElementById('btn-calm-sound');
  if (rainNoiseNode) {
    pararSomCalmante();
    if (btn) btn.innerText = '🌧️ Ligar Som Suave de Chuva';
    return;
  }

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
    const bufferSize = 2 * audioCtx.sampleRate;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Gera ruído marrom suave (som natural de chuva calma)
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 0.18;
    }

    rainNoiseNode = audioCtx.createBufferSource();
    rainNoiseNode.buffer = noiseBuffer;
    rainNoiseNode.loop = true;
    rainNoiseNode.connect(audioCtx.destination);
    rainNoiseNode.start(0);

    if (btn) btn.innerText = '🔇 Desligar Som de Chuva';
  } catch (e) {
    alert('Seu navegador bloqueou o áudio automático.');
  }
}

function pararSomCalmante() {
  if (rainNoiseNode) {
    try { rainNoiseNode.stop(); } catch (e) {}
    rainNoiseNode = null;
  }
  if (audioCtx) {
    try { audioCtx.close(); } catch (e) {}
    audioCtx = null;
  }
}

function abrirPausaSensorial() {
  limparCronometroQuiz();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();

  const overlay = document.getElementById('sensory-pause-overlay');
  const quizBody = document.getElementById('quiz-game-body');
  if (overlay && quizBody) {
    quizBody.classList.add('hidden');
    overlay.classList.remove('hidden');
    iniciarCicloRespiracao();
  }
}

function fecharPausaSensorial() {
  pararSomCalmante();
  const btn = document.getElementById('btn-calm-sound');
  if (btn) btn.innerText = '🌧️ Ligar Som Suave de Chuva';

  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
  }
  const overlay = document.getElementById('sensory-pause-overlay');
  const quizBody = document.getElementById('quiz-game-body');
  if (overlay && quizBody) {
    overlay.classList.add('hidden');
    quizBody.classList.remove('hidden');
  }
  if (window.currentQuizState && !window.currentQuizState.bloqueado) {
    renderizarPerguntaAtualQuiz();
  }
}

function iniciarCicloRespiracao() {
  if (breathingInterval) clearInterval(breathingInterval);
  const circle = document.getElementById('breathing-circle-el');
  const label = document.getElementById('breathing-instruction-text');
  if (!circle || !label) return;

  const etapas = [
    { classe: 'inhale', texto: 'Inspire devagar pelo nariz (4s)...', circulo: 'Inspire' },
    { classe: 'hold', texto: 'Segure o ar suavemente (4s)...', circulo: 'Segure' },
    { classe: 'exhale', texto: 'Expire devagar pela boca (4s)...', circulo: 'Expire' }
  ];
  let idx = 0;

  const aplicarEtapa = () => {
    const atual = etapas[idx];
    circle.className = `breathing-circle flex items-center justify-center text-white font-extrabold text-xs ${atual.classe}`;
    circle.innerText = atual.circulo;
    label.innerText = atual.texto;
    idx = (idx + 1) % etapas.length;
  };

  aplicarEtapa();
  breathingInterval = setInterval(aplicarEtapa, 4000);
}

// =========================================================
// GESTÃO DO ALUNO LOGADO E ATIVIDADES
// =========================================================
function getAlunoLogado() {
  try {
    const raw = localStorage.getItem('tech_user') || localStorage.getItem('user') || '{}';
    const u = JSON.parse(raw);
    return {
      id: Number(u.id_aluno || u.id || 1),
      nome: u.nome || 'Aluno',
      idTurma: Number(u.id_turma || 1)
    };
  } catch (e) {
    return { id: 1, nome: 'Aluno', idTurma: 1 };
  }
}

function getStorageKeyAluno(idAluno) {
  return `tech_student_answers_${idAluno}`;
}

document.addEventListener('DOMContentLoaded', () => {
  carregarAtividadesDoAluno();
});

async function carregarAtividadesDoAluno() {
  const container = document.getElementById('lista-atividades-container');
  if (!container) return;

  const aluno = getAlunoLogado();

  try {
    const response = await fetch(`${API_URL}/atividades/turma/${aluno.idTurma}`);
    if (response.ok) {
      const dadosBackend = await response.json();
      window.studentActivities = dadosBackend.map(a => {
        const rawDesc = a.descricao || 'Sem orientações.';
        const descSemMeta = rawDesc.split('|||META_CONFIG|||')[0];
        const parts = rawDesc.split('|||QUIZ_DATA|||');
        return {
          id: String(a.id_atividade || a.id),
          title: a.titulo,
          description: descSemMeta.split('|||QUIZ_DATA|||')[0],
          quizData: parts[1] ? JSON.parse(parts[1]) : null,
          grade: (a.titulo || '').includes('1º') ? '1º Ano EM' : ((a.titulo || '').includes('2º') ? '2º Ano EM' : '3º Ano EM'),
          type: a.id_tipo_atividade === 2 ? 'QUIZ' : 'MATERIAL',
          fileUrl: a.ficheiro_url || ''
        };
      });
    }
  } catch (err) {
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

async function renderizarListaAlunos(container, lista) {
  const aluno = getAlunoLogado();
  const respostasSalvas = JSON.parse(localStorage.getItem(getStorageKeyAluno(aluno.id)) || '{}');
  window.studentSubmissionsMap = {};

  const promessas = lista.map(async (atv) => {
    const idStr = String(atv.id);
    let entregaAluno = (respostasSalvas[idStr] && respostasSalvas[idStr][0]) || null;

    try {
      const res = await fetch(`${API_URL}/atividades/${atv.id}/respostas`);
      if (res.ok) {
        const dadosRespostas = await res.json();
        if (Array.isArray(dadosRespostas)) {
          const doAluno = dadosRespostas.find(r => Number(r.id_aluno) === aluno.id);
          if (doAluno) {
            const raw = doAluno.conteudo_resposta || '';
            entregaAluno = {
              respostaTexto: raw.split('|||ANEXO_ALUNO|||')[0],
              data: doAluno.data_resposta ? new Date(doAluno.data_resposta).toLocaleDateString('pt-BR') : 'Concluída'
            };
          } else {
            entregaAluno = null;
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
            ${respondida ? '✓ Concluída' : '⏳ Pendente'}
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
              ${atv.type === 'QUIZ' ? '🎮 Iniciar Quiz Inclusivo' : '📝 Enviar Tarefa'}
            </button>
          </div>
        `}
      </div>
    `;
  });

  const htmlCards = await Promise.all(promessas);
  container.innerHTML = htmlCards.join('');
}

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
      while (n--) u8arr[n] = bstr.charCodeAt(n);
      const blob = new Blob([u8arr], { type: mime });
      window.open(URL.createObjectURL(blob), '_blank');
    } catch (e) {
      alert("Erro ao processar o ficheiro anexo.");
    }
  } else {
    window.open(url, '_blank');
  }
}

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

// =========================================================
// EXECUÇÃO DA ARENA QUIZIZZ INCLUSIVA
// =========================================================
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
    selecaoPendente: null,
    eliminadas: new Set(),
    timerInterval: null
  };

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  aplicarEstadoVisualA11y();
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
  pararSomCalmante();
  if (breathingInterval) {
    clearInterval(breathingInterval);
    breathingInterval = null;
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  const ruler = document.getElementById('reading-ruler-bar');
  if (ruler) ruler.classList.add('hidden');

  const modal = document.getElementById('modal-quiz-game');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  window.currentQuizState = null;
}

function alternarDescarteAlternativa(event, idx) {
  if (event) event.stopPropagation();
  const state = window.currentQuizState;
  if (!state || state.bloqueado) return;

  const wrapper = document.getElementById(`opt-wrapper-${idx}`);
  if (!wrapper) return;

  if (state.eliminadas.has(idx)) {
    state.eliminadas.delete(idx);
    wrapper.classList.remove('opt-eliminated');
  } else {
    state.eliminadas.add(idx);
    wrapper.classList.add('opt-eliminated');
  }
}

function renderizarPerguntaAtualQuiz() {
  limparCronometroQuiz();
  const body = document.getElementById('quiz-game-body');
  const state = window.currentQuizState;
  if (!body || !state) return;

  state.selecaoPendente = null;
  state.eliminadas = new Set();

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

  // Mapa visual de previsibilidade (TEA)
  const mapaEtapasHtml = (a11yState.profile === 'TEA') ? `
    <div class="bg-slate-100 border border-slate-300 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-800">
      <div>
        <span class="font-extrabold block">🧭 Roteiro Previsível: Etapa ${state.indiceAtual + 1} de ${total}</span>
        <span class="text-[11px] text-slate-600">Sem limite de tempo. Leia com calma, escolha uma opção e clique em confirmar.</span>
      </div>
      <div class="flex items-center gap-1.5">
        ${state.perguntas.map((_, i) => `
          <span class="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold ${i < state.indiceAtual ? 'bg-emerald-600 text-white' : (i === state.indiceAtual ? 'bg-slate-800 text-white ring-2 ring-slate-400' : 'bg-white border border-slate-300 text-slate-500')}">
            ${i + 1}
          </span>
        `).join('')}
      </div>
    </div>
  ` : '';

  const enunciadoProcessado = processarTextoAcessivel(qData.question);

  body.innerHTML = `
    <div class="space-y-4">
      ${mapaEtapasHtml}

      <div class="quiz-header-banner bg-gradient-to-r from-[#3332A5] via-indigo-800 to-purple-800 text-white p-5 sm:p-6 rounded-3xl space-y-4 shadow-lg">
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
            ${state.streak >= 2 ? `<span class="quiz-streak-badge text-xs font-extrabold bg-orange-500 text-white px-3 py-1.5 rounded-2xl animate-pulse">🔥 ${state.streak}x</span>` : ''}
            <span class="quiz-points-badge text-xs sm:text-sm font-extrabold bg-white/15 px-3.5 py-1.5 rounded-2xl border border-white/10">⭐ ${state.pontosTotais} pts</span>
          </div>
        </div>

        <div class="w-full h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div class="h-full bg-yellow-400 transition-all duration-300" style="width: ${progressoPct}%"></div>
        </div>
      </div>

      <div id="quiz-question-box-el" class="quiz-question-box p-6 sm:p-7 bg-slate-50 border border-slate-200 rounded-3xl space-y-5 transition-colors">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-extrabold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-3 py-1 rounded-xl">Enunciado</span>
            <button type="button" onclick="falarTextoComDestaque('${qData.question.replace(/'/g, "\\'")}', document.getElementById('quiz-question-box-el'))" class="text-[11px] font-bold bg-white border border-slate-200 hover:bg-indigo-50 text-indigo-900 px-2.5 py-1 rounded-xl cursor-pointer">
              🔊 Ouvir Pergunta
            </button>
          </div>
          <div class="flex items-center gap-2">
            ${a11yState.twoStepConfirm ? `<span class="text-[11px] font-bold text-purple-800 bg-purple-100 px-2.5 py-1 rounded-xl">🛡️ Confirmação em 2 Cliques</span>` : ''}
            <span class="text-xs font-extrabold text-amber-700 bg-amber-100 px-3 py-1 rounded-xl">+${valorPontos} PTS</span>
          </div>
        </div>

        <p class="quiz-readable-text text-base sm:text-lg font-bold text-slate-800 leading-relaxed">${enunciadoProcessado}</p>

        <div id="quiz-options-grid" class="grid grid-cols-1 ${isVF ? 'sm:grid-cols-2' : ''} gap-3.5 pt-1">
          ${opcoes.map((opt, idx) => {
            const st = estilosOpcoes[idx % 4];
            const icone = isVF ? (idx === 0 ? '✓' : '✕') : simbolos[idx % 4];
            const optProcessada = processarTextoAcessivel(opt);
            return `
              <div id="opt-wrapper-${idx}" class="relative flex items-stretch gap-2 transition-all rounded-2xl">
                <button type="button" data-opt-idx="${idx}" onclick="aoClicarAlternativa(${idx})" class="quiz-opt-btn flex-1 ${st.bg} text-white border-b-4 text-left text-sm sm:text-base p-4 sm:p-5 font-bold rounded-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0.5 flex items-center gap-3.5 cursor-pointer shadow-md">
                  <span class="opt-badge-icon w-8 h-8 rounded-xl ${st.badge} flex items-center justify-center text-sm font-extrabold shrink-0 shadow-inner">${icone}</span>
                  <span class="quiz-readable-text leading-snug">${optProcessada}</span>
                </button>

                <!-- Botões Laterais de Apoio (Ouvir só esta alternativa / Descartar distrator no TDAH) -->
                <div class="flex flex-col justify-center gap-1.5 shrink-0">
                  <button type="button" onclick="lerAlternativaIndividual(event, ${idx})" title="Ouvir apenas esta alternativa" class="px-2.5 py-2 bg-white hover:bg-indigo-50 border border-slate-200 rounded-xl text-xs font-bold text-indigo-900 shadow-sm cursor-pointer">
                    🔊
                  </button>
                  ${a11yState.allowEliminate ? `
                    <button type="button" onclick="alternarDescarteAlternativa(event, ${idx})" title="Riscar alternativa (Eliminar distrator)" class="px-2.5 py-2 bg-white hover:bg-rose-50 border border-slate-200 rounded-xl text-xs font-bold text-rose-700 shadow-sm cursor-pointer">
                      ✂️
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Barra de Confirmação Anti-Impulsividade (2 Cliques) -->
        <div id="two-step-confirm-bar" class="hidden p-4 bg-purple-100/90 border-2 border-purple-500 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <span id="two-step-selected-label" class="text-xs sm:text-sm font-extrabold text-purple-950">Alternativa selecionada. Deseja confirmar?</span>
          <button type="button" onclick="confirmarEscolhaPendente()" class="w-full sm:w-auto px-6 py-2.5 bg-purple-800 hover:bg-purple-950 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow cursor-pointer">
            ✓ Confirmar Resposta (Enter)
          </button>
        </div>

        <div id="quiz-feedback-banner" class="hidden p-4 rounded-2xl text-xs sm:text-sm font-bold space-y-1.5"></div>
      </div>
    </div>
  `;

  aplicarEstadoVisualA11y();

  if (tempoLimite > 0 && !a11yState.noTimer) {
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
        responderPerguntaQuiz(-1);
      }
    }, 1000);
  }
}

function aoClicarAlternativa(indiceEscolhido) {
  const state = window.currentQuizState;
  if (!state || state.bloqueado) return;

  if (a11yState.twoStepConfirm) {
    state.selecaoPendente = indiceEscolhido;
    const qData = state.perguntas[state.indiceAtual];
    const textoOpt = qData.options?.[indiceEscolhido] || '';

    document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      const idx = Number(btn.dataset.optIdx);
      btn.classList.remove('ring-4', 'ring-yellow-300', 'opt-selected-pending');
      if (idx === indiceEscolhido) {
        btn.classList.add('ring-4', 'ring-yellow-300', 'opt-selected-pending');
      }
    });

    const bar = document.getElementById('two-step-confirm-bar');
    const lbl = document.getElementById('two-step-selected-label');
    if (bar && lbl) {
      lbl.innerText = `Você escolheu: "${textoOpt}". Pode trocar ou confirmar:`;
      bar.classList.remove('hidden');
    }
    return;
  }

  responderPerguntaQuiz(indiceEscolhido);
}

function confirmarEscolhaPendente() {
  const state = window.currentQuizState;
  if (!state || state.selecaoPendente === null) return;
  responderPerguntaQuiz(state.selecaoPendente);
}

function responderPerguntaQuiz(indiceEscolhido) {
  const state = window.currentQuizState;
  if (!state || state.bloqueado) return;
  state.bloqueado = true;
  limparCronometroQuiz();
  limparDestaquesVoz();

  document.getElementById('two-step-confirm-bar')?.classList.add('hidden');

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

  document.querySelectorAll('.quiz-opt-btn').forEach(btn => {
    const idx = Number(btn.dataset.optIdx);
    btn.classList.add('pointer-events-none');
    btn.classList.remove('ring-4', 'ring-yellow-300', 'opt-selected-pending');

    if (isEnquete) {
      if (idx === indiceEscolhido) {
        btn.classList.add('ring-4', 'ring-indigo-300', 'opt-correct-final');
      } else {
        btn.classList.add('opacity-40');
      }
    } else if (idx === correctIdx) {
      btn.className = 'quiz-opt-btn flex-1 opt-correct-final bg-emerald-600 border-emerald-900 ring-4 ring-emerald-300 text-white border-b-4 text-left text-sm sm:text-base p-4 sm:p-5 font-bold rounded-2xl flex items-center gap-3.5 shadow-md';
    } else if (idx === indiceEscolhido && !acertou) {
      btn.className = 'quiz-opt-btn flex-1 opt-wrong-final bg-rose-600 border-rose-900 opacity-95 text-white border-b-4 text-left text-sm sm:text-base p-4 sm:p-5 font-bold rounded-2xl flex items-center gap-3.5';
    } else {
      btn.classList.add('opacity-35');
    }
  });

  const banner = document.getElementById('quiz-feedback-banner');
  const explicacaoHtml = qData.explanation
    ? `<p class="quiz-readable-text text-xs font-medium mt-1 pt-1.5 border-t border-black/10">💡 <strong>Explicação:</strong> ${processarTextoAcessivel(qData.explanation)}</p>`
    : '';

  const isTea = a11yState.profile === 'TEA';

  if (banner) {
    banner.classList.remove('hidden');
    if (tempoEsgotado) {
      banner.className = 'p-4 rounded-2xl text-xs sm:text-sm font-extrabold bg-amber-100 text-amber-950 border border-amber-300';
      banner.innerHTML = `<div>⏰ Tempo esgotado.</div>${explicacaoHtml}`;
    } else if (isEnquete) {
      banner.className = 'p-4 rounded-2xl text-xs sm:text-sm font-extrabold bg-indigo-100 text-indigo-950 border border-indigo-300';
      banner.innerHTML = `<div>📊 Opinião registrada. +${valorPontos} pontos.</div>${explicacaoHtml}`;
    } else if (acertou) {
      banner.className = 'p-4 rounded-2xl text-xs sm:text-sm font-extrabold bg-emerald-100 text-emerald-950 border border-emerald-300';
      banner.innerHTML = isTea
        ? `<div>✓ Resposta correta. Você ganhou ${valorPontos} pontos.</div>${explicacaoHtml}`
        : `<div>🎉 Resposta Correta! +${valorPontos} PTS</div>${explicacaoHtml}`;
    } else {
      const textoCorreta = qData.options?.[correctIdx] || '';
      banner.className = 'p-4 rounded-2xl text-xs sm:text-sm font-extrabold bg-rose-100 text-rose-950 border border-rose-300';
      banner.innerHTML = isTea
        ? `<div>Resposta incorreta. A alternativa correta é: <span class="underline">${textoCorreta}</span>.</div>${explicacaoHtml}`
        : `<div>❌ Ops! A resposta correta era: <span class="underline">${textoCorreta}</span></div>${explicacaoHtml}`;
    }
  }

  const delayAvanco = qData.explanation ? 2800 : 1700;

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

  const perfilUsado = a11yState.profile !== 'PADRAO' ? ` [Apoio: ${a11yState.profile}]` : '';
  const textoEntrega = `Quiz Concluído — Acertou ${acertos} de ${total} questões (${percentual}%) [+${pontos} PTS]${perfilUsado}`;
  await salvarSubmissao(textoEntrega, '');

  body.innerHTML = `
    <div class="text-center space-y-6 py-5">
      <div class="w-20 h-20 mx-auto rounded-3xl bg-yellow-100 text-yellow-600 flex items-center justify-center text-4xl shadow-inner">
        🏆
      </div>
      <div>
        <span class="text-xs font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-3.5 py-1 rounded-full">Atividade Concluída</span>
        <h3 class="text-2xl font-extrabold text-slate-800 mt-2.5">${percentual >= 70 ? 'Excelente Desempenho!' : 'Quiz Finalizado!'}</h3>
        <p class="text-xs sm:text-sm text-slate-500 mt-1">Sua entrega já foi registrada com sucesso para o professor.</p>
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

async function salvarSubmissao(texto, arquivoUrl = '') {
  const idStr = String(atividadeAtualId);
  const aluno = getAlunoLogado();
  
  const conteudoParaBanco = arquivoUrl 
    ? `${texto}|||ANEXO_ALUNO|||${arquivoUrl}` 
    : texto;

  const storageKey = getStorageKeyAluno(aluno.id);
  const respostasSalvas = JSON.parse(localStorage.getItem(storageKey) || '{}');
  respostasSalvas[idStr] = [{
    aluno: aluno.nome,
    data: new Date().toLocaleDateString('pt-BR'),
    respostaTexto: texto,
    arquivoUrl: arquivoUrl
  }];
  localStorage.setItem(storageKey, JSON.stringify(respostasSalvas));

  try {
    await fetch(`${API_URL}/atividades/resposta`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_aluno: aluno.id,
        id_atividade: Number(atividadeAtualId),
        conteudo_resposta: conteudoParaBanco
      })
    });
  } catch (e) {
    console.warn("API offline, resposta salva localmente.");
  }
}