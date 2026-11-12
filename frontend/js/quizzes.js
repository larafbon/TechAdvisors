const API_URL = 'http://127.0.0.1:8000';

window.currentCreationMode = 'QUICK';
window.filterTurmaId = 'ALL';
window.teacherTurmas = [];
window.activities = [];
window.currentStudentSubmissions = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (window.lucide) window.lucide.createIcons();
  await carregarTurmasDoProfessor();
  await carregarAtividadesDoBanco();
});

// 1. Busca as turmas reais do professor no FastAPI (com fallback seguro)
async function carregarTurmasDoProfessor() {
  const userStr = localStorage.getItem('user') || localStorage.getItem('professor');
  let idProfessor = 1;
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      idProfessor = u.id_professor || u.id || 1;
    } catch (e) {}
  }

  const endpoints = [
    `${API_URL}/turmas/professor/${idProfessor}`,
    `${API_URL}/turmas`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const dados = await res.json();
        if (Array.isArray(dados) && dados.length > 0) {
          window.teacherTurmas = dados.map(t => ({
            id: String(t.id_turma || t.id),
            nome: t.nome_turma || t.nome || t.serie || `Turma #${t.id_turma || t.id}`
          }));
          break;
        }
      }
    } catch (e) {}
  }

  // Fallback caso o endpoint ainda não tenha turmas cadastradas
  if (window.teacherTurmas.length === 0) {
    const locais = JSON.parse(localStorage.getItem('tech_turmas') || '[]');
    if (Array.isArray(locais) && locais.length > 0) {
      window.teacherTurmas = locais.map(t => ({
        id: String(t.id_turma || t.id),
        nome: t.nome_turma || t.nome || 'Turma 1'
      }));
    } else {
      window.teacherTurmas = [
        { id: '1', nome: '1º Ano EM — Turma A' },
        { id: '2', nome: '2º Ano EM — Turma B' },
        { id: '3', nome: '3º Ano EM — Turma C' }
      ];
    }
  }

  preencherSeletoresDeTurma();
}

function preencherSeletoresDeTurma() {
  // Preenche o <select> dentro do Modal de Criação
  const modalSelect = document.getElementById('modal-turma-select');
  if (modalSelect) {
    modalSelect.innerHTML = `<option value="">Selecione a turma...</option>` +
      window.teacherTurmas.map(t => `<option value="${t.id}">${t.nome}</option>`).join('');
  }

  // Preenche os chips de filtro na barra superior
  const filterContainer = document.getElementById('filter-turmas-container');
  if (filterContainer) {
    filterContainer.innerHTML = `
      <button type="button" onclick="setFilterTurma('ALL', this)" class="filter-chip chip-selected text-xs font-bold px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition cursor-pointer">Todas as Turmas</button>
      ${window.teacherTurmas.map(t => `
        <button type="button" onclick="setFilterTurma('${t.id}', this)" class="filter-chip text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 transition cursor-pointer">${t.nome}</button>
      `).join('')}
    `;
  }
}

// 2. Carrega as atividades de TODAS as turmas do professor
async function carregarAtividadesDoBanco() {
  let todasAtividades = [];
  let carregouBanco = false;

  for (const turma of window.teacherTurmas) {
    try {
      const response = await fetch(`${API_URL}/atividades/turma/${turma.id}`);
      if (response.ok) {
        const dados = await response.json();
        if (Array.isArray(dados)) {
          carregouBanco = true;
          dados.forEach(a => {
            const idAtv = String(a.id_atividade || a.id);
            if (!todasAtividades.some(item => item.id === idAtv)) {
              const rawDesc = a.descricao || a.description || 'Sem orientações.';
              const metaMatch = rawDesc.match(/\|\|\|META_CONFIG\|\|\|(\{.*?\})/);
              let maxAttempts = 1;
              if (metaMatch) {
                try {
                  const meta = JSON.parse(metaMatch[1]);
                  maxAttempts = Number(meta.maxAttempts ?? 1);
                } catch (e) {}
              }

              todasAtividades.push({
                id: idAtv,
                idTurma: String(a.id_turma || turma.id),
                turmaNome: turma.nome,
                title: a.titulo || a.title,
                description: rawDesc,
                maxAttempts: maxAttempts,
                type: a.id_tipo_atividade === 2 || a.type === 'QUIZ' ? 'QUIZ' : 'MATERIAL',
                fileUrl: a.ficheiro_url || a.fileUrl || ''
              });
            }
          });
        }
      }
    } catch (err) {}
  }

  if (carregouBanco) {
    window.activities = todasAtividades;
  } else {
    const local = localStorage.getItem('tech_activities');
    window.activities = local ? JSON.parse(local) : [];
  }

  window.renderCards();
}

// 3. Renderiza os cards das atividades com Turma e Limite de Tentativas
window.renderCards = async function() {
  const container = document.getElementById('cards-grid');
  const emptyState = document.getElementById('empty-state');
  const totalCount = document.getElementById('total-count');
  const searchVal = document.getElementById('search-input')?.value.toLowerCase() || '';

  if (!container) return;

  const filtered = window.activities.filter(act => {
    const matchTurma = window.filterTurmaId === 'ALL' || String(act.idTurma) === String(window.filterTurmaId);
    const matchSearch = act.title.toLowerCase().includes(searchVal) || act.description.toLowerCase().includes(searchVal);
    return matchTurma && matchSearch;
  });

  if (totalCount) totalCount.innerText = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');

  const respostasSalvas = JSON.parse(localStorage.getItem('tech_student_answers') || '{}');

  const promessasCards = filtered.map(async (act) => {
    const idStr = String(act.id);
    let totalEntregas = (respostasSalvas[idStr] || []).length;

    try {
      const res = await fetch(`${API_URL}/atividades/${act.id}/respostas`);
      if (res.ok) {
        const dadosRespostas = await res.json();
        if (Array.isArray(dadosRespostas)) {
          totalEntregas = Math.max(totalEntregas, dadosRespostas.length);
        }
      }
    } catch (e) {}

    const descLimpa = act.description.split('|||QUIZ_DATA|||')[0].split('|||META_CONFIG|||')[0];
    const descParts = act.description.split('|||QUIZ_DATA|||');
    let qtdQuestoesBadge = '';
    if (act.type === 'QUIZ' && descParts[1]) {
      try {
        const parsedQ = JSON.parse(descParts[1]);
        const count = Array.isArray(parsedQ) ? parsedQ.length : 1;
        qtdQuestoesBadge = `<span class="text-[10px] font-bold px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">🎯 ${count} questão${count > 1 ? 'ões' : ''}</span>`;
      } catch (e) {}
    }

    const tentativasLabel = act.maxAttempts === 0
      ? '♾️ Ilimitadas'
      : `🔄 ${act.maxAttempts} tentativa${act.maxAttempts > 1 ? 's' : ''}`;

    return `
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-center justify-between mb-3 flex-wrap gap-1.5">
            <span class="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-900 rounded-xl">🏫 ${act.turmaNome}</span>
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] font-bold px-2.5 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">${tentativasLabel}</span>
              ${qtdQuestoesBadge}
              <span class="text-xs font-bold px-3 py-1 ${act.type === 'QUIZ' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'} rounded-xl">${act.type}</span>
            </div>
          </div>
          <h3 class="text-base font-bold text-slate-800 leading-snug">${act.title}</h3>
          <p class="text-xs text-slate-500 mt-2 line-clamp-2">${descLimpa}</p>
          
          ${act.fileUrl ? `
            <div class="mt-3 p-2.5 bg-purple-50 border border-purple-100 rounded-xl flex items-center justify-between">
              <span class="text-[11px] font-bold text-purple-900 truncate">📎 Anexo de Apoio</span>
              <button type="button" onclick="window.abrirAnexoPorId('${idStr}')" class="text-[10px] bg-purple-700 hover:bg-purple-800 text-white font-bold px-3 py-1 rounded-lg transition shrink-0 cursor-pointer">
                Abrir Anexo
              </button>
            </div>
          ` : ''}
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button type="button" onclick="window.verRespostasDoAluno('${idStr}', '${encodeURIComponent(act.title)}')" class="text-xs font-bold ${totalEntregas > 0 ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-slate-500 bg-slate-50'} px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer">
            <span>📥 ${totalEntregas} Resposta${totalEntregas === 1 ? '' : 's'}</span>
          </button>
          
          <button type="button" onclick="window.deleteActivity('${idStr}')" class="text-slate-400 hover:text-red-600 transition p-2 hover:bg-red-50 rounded-xl cursor-pointer" title="Excluir Atividade">
            🗑️
          </button>
        </div>
      </div>
    `;
  });

  const cardsHtml = await Promise.all(promessasCards);
  container.innerHTML = cardsHtml.join('');
};

window.setFilterTurma = function(turmaId, btnElement) {
  window.filterTurmaId = turmaId;
  document.querySelectorAll('.filter-chip').forEach(btn => {
    btn.classList.remove('chip-selected', 'bg-purple-700', 'text-white');
    btn.classList.add('bg-slate-50', 'text-slate-600');
  });
  if (btnElement) {
    btnElement.classList.add('chip-selected', 'bg-purple-700', 'text-white');
    btnElement.classList.remove('bg-slate-50', 'text-slate-600');
  }
  window.renderCards();
};

// 4. Abre PDF ou Imagem convertendo Base64 para Blob nativo (INTACTO)
window.abrirAnexoPorId = function(id) {
  const act = window.activities.find(a => String(a.id) === String(id));
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
      alert("Erro ao abrir o ficheiro.");
    }
  } else {
    window.open(url, '_blank');
  }
};

// 5. Controlo do Modal de Criação e das Abas
window.openModal = function() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.closeModal = function() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  const qContainer = document.getElementById('quiz-questions-container');
  if (qContainer) qContainer.innerHTML = '';
};

window.switchCreationMode = function(mode) {
  window.currentCreationMode = mode;
  const tabQuick = document.getElementById('tab-quick-btn');
  const tabManual = document.getElementById('tab-manual-btn');
  const tabAi = document.getElementById('tab-ai-btn');

  const secQuick = document.getElementById('mode-quick-section');
  const secManual = document.getElementById('mode-manual-section');
  const secAi = document.getElementById('mode-ai-section');

  [tabQuick, tabManual, tabAi].forEach(t => {
    if (!t) return;
    t.classList.remove('tab-active', 'bg-white', 'shadow-sm', 'text-purple-700', 'bg-[#3332A5]', 'bg-purple-800', 'text-white');
    t.classList.add('text-slate-600');
  });

  if (mode === 'QUICK') {
    tabQuick?.classList.add('tab-active', 'bg-[#3332A5]', 'text-white', 'shadow-sm');
    tabQuick?.classList.remove('text-slate-600');
    secQuick?.classList.remove('hidden');
    secManual?.classList.add('hidden');
    secAi?.classList.add('hidden');
  } else if (mode === 'MANUAL') {
    tabManual?.classList.add('tab-active', 'bg-[#3332A5]', 'text-white', 'shadow-sm');
    tabManual?.classList.remove('text-slate-600');
    secQuick?.classList.add('hidden');
    secManual?.classList.remove('hidden');
    secAi?.classList.add('hidden');
    const qContainer = document.getElementById('quiz-questions-container');
    if (qContainer && qContainer.children.length === 0) {
      window.adicionarBlocoQuestao('MULTIPLA');
    }
  } else if (mode === 'AI') {
    tabAi?.classList.add('tab-active', 'bg-[#3332A5]', 'text-white', 'shadow-sm');
    tabAi?.classList.remove('text-slate-600');
    secQuick?.classList.add('hidden');
    secManual?.classList.add('hidden');
    secAi?.classList.remove('hidden');
  }
};


window.switchCreationMode = function(mode) {
  window.currentCreationMode = mode;
  const tabQuick = document.getElementById('tab-quick-btn');
  const tabManual = document.getElementById('tab-manual-btn');
  const tabAi = document.getElementById('tab-ai-btn');

  const secQuick = document.getElementById('mode-quick-section');
  const secManual = document.getElementById('mode-manual-section');
  const secAi = document.getElementById('mode-ai-section');

  [tabQuick, tabManual, tabAi].forEach(t => {
    if (!t) return;
    t.classList.remove('tab-active', 'bg-white', 'shadow-sm', 'text-purple-700', 'bg-[#3332A5]', 'bg-purple-800', 'text-white');
    t.classList.add('text-slate-600');
  });

  if (mode === 'QUICK') {
    tabQuick?.classList.add('tab-active', 'bg-[#3332A5]', 'text-white', 'shadow-sm');
    tabQuick?.classList.remove('text-slate-600');
    secQuick?.classList.remove('hidden');
    secManual?.classList.add('hidden');
    secAi?.classList.add('hidden');
  } else if (mode === 'MANUAL') {
    tabManual?.classList.add('tab-active', 'bg-[#3332A5]', 'text-white', 'shadow-sm');
    tabManual?.classList.remove('text-slate-600');
    secQuick?.classList.add('hidden');
    secManual?.classList.remove('hidden');
    secAi?.classList.add('hidden');
    const qContainer = document.getElementById('quiz-questions-container');
    if (qContainer && qContainer.children.length === 0) {
      window.adicionarBlocoQuestao('MULTIPLA');
    }
  } else if (mode === 'AI') {
    tabAi?.classList.add('tab-active', 'bg-[#3332A5]', 'text-white', 'shadow-sm');
    tabAi?.classList.remove('text-slate-600');
    secQuick?.classList.add('hidden');
    secManual?.classList.add('hidden');
    secAi?.classList.remove('hidden');
  }
};

window.selectModalGrade = function(grade, btnElement) {
  window.selectedModalGrade = grade;
  document.querySelectorAll('.modal-grade-chip').forEach(btn => {
    btn.classList.remove('bg-purple-700', 'text-white');
    btn.classList.add('bg-white', 'text-slate-600');
  });
  if (btnElement) {
    btnElement.classList.add('bg-purple-700', 'text-white');
    btnElement.classList.remove('bg-white', 'text-slate-600');
  }
};

// 5. Editor Avançado de Questões (Múltipla Escolha, Verdadeiro/Falso e Enquete)
let questionUniqueCounter = 0;

window.adicionarBlocoQuestao = function(tipo = 'MULTIPLA') {
  const container = document.getElementById('quiz-questions-container');
  if (!container) return;

  questionUniqueCounter++;
  const uid = questionUniqueCounter;
  const numVisual = container.querySelectorAll('.quiz-question-card').length + 1;

  const div = document.createElement('div');
  div.className = 'quiz-question-card p-4 bg-white border border-indigo-200 rounded-2xl space-y-3 shadow-sm';
  div.dataset.qtype = tipo;

  const barraConfiguracao = `
    <div class="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200/80">
      <div class="flex items-center justify-between px-2">
        <span class="text-[10px] font-bold text-slate-500 uppercase">⏱️ Tempo:</span>
        <select class="q-time text-[11px] font-bold text-indigo-900 bg-transparent focus:outline-none cursor-pointer">
          <option value="0">Sem limite</option>
          <option value="15">15 segundos</option>
          <option value="30" selected>30 segundos</option>
          <option value="60">60 segundos</option>
        </select>
      </div>
      <div class="flex items-center justify-between px-2 border-l border-slate-200">
        <span class="text-[10px] font-bold text-slate-500 uppercase">⭐ Valor:</span>
        <select class="q-points text-[11px] font-bold text-amber-700 bg-transparent focus:outline-none cursor-pointer">
          <option value="50">50 pts</option>
          <option value="100" selected>100 pts (Normal)</option>
          <option value="200">200 pts (Em dobro)</option>
        </select>
      </div>
    </div>
  `;

  const campoExplicacao = `
    <div class="pt-1">
      <input type="text" class="q-explanation w-full text-[11px] p-2 bg-purple-50/50 border border-purple-200/70 rounded-xl text-purple-950 placeholder-purple-400 focus:outline-none" placeholder="💡 Gabarito comentado / Explicação (aparece após o aluno responder - opcional)">
    </div>
  `;

  if (tipo === 'VF') {
    div.innerHTML = `
      <div class="flex justify-between items-center">
        <span class="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg">Questão #${numVisual} • Verdadeiro ou Falso</span>
        <button type="button" onclick="window.removerBlocoQuestao(this)" class="text-[11px] text-red-500 font-bold hover:underline cursor-pointer">🗑️ Remover</button>
      </div>
      ${barraConfiguracao}
      <input type="text" class="q-text w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Digite a afirmação (Ex: O Brasil faz fronteira com o Chile)...">
      <div class="grid grid-cols-2 gap-2 pt-1">
        <label class="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/50 cursor-pointer text-xs font-bold text-emerald-900">
          <input type="radio" name="correct_${uid}" value="0" checked class="accent-emerald-600 w-4 h-4">
          <span>✅ Verdadeiro (Correta)</span>
        </label>
        <label class="flex items-center gap-2 p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer text-xs font-bold text-rose-900">
          <input type="radio" name="correct_${uid}" value="1" class="accent-rose-600 w-4 h-4">
          <span>❌ Falso</span>
        </label>
      </div>
      ${campoExplicacao}
    `;
  } else if (tipo === 'ENQUETE') {
    div.innerHTML = `
      <div class="flex justify-between items-center">
        <span class="text-xs font-extrabold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-lg">Questão #${numVisual} • Enquete / Opinião</span>
        <button type="button" onclick="window.removerBlocoQuestao(this)" class="text-[11px] text-red-500 font-bold hover:underline cursor-pointer">🗑️ Remover</button>
      </div>
      ${barraConfiguracao}
      <input type="text" class="q-text w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500" placeholder="Digite a pergunta da enquete (Ex: Qual tema você achou mais desafiador?)...">
      <p class="text-[10px] font-bold text-amber-700">ℹ️ Na enquete, qualquer alternativa escolhida pelo aluno contabiliza participação.</p>
      <div class="space-y-1.5">
        <input type="text" class="q-opt-0 w-full text-xs p-2 bg-amber-50/40 border border-amber-200 rounded-xl" placeholder="Opção 1...">
        <input type="text" class="q-opt-1 w-full text-xs p-2 bg-amber-50/40 border border-amber-200 rounded-xl" placeholder="Opção 2...">
        <input type="text" class="q-opt-2 w-full text-xs p-2 bg-amber-50/40 border border-amber-200 rounded-xl" placeholder="Opção 3 (opcional)...">
      </div>
      ${campoExplicacao}
    `;
  } else {
    const cores = [
      { bg: 'bg-emerald-50/60', border: 'border-emerald-200', badge: 'bg-emerald-600', letra: 'A' },
      { bg: 'bg-blue-50/60', border: 'border-blue-200', badge: 'bg-blue-600', letra: 'B' },
      { bg: 'bg-amber-50/60', border: 'border-amber-200', badge: 'bg-amber-500', letra: 'C' },
      { bg: 'bg-rose-50/60', border: 'border-rose-200', badge: 'bg-rose-600', letra: 'D' }
    ];

    div.innerHTML = `
      <div class="flex justify-between items-center">
        <span class="text-xs font-extrabold text-indigo-900 bg-indigo-100 px-2.5 py-0.5 rounded-lg">Questão #${numVisual} • Múltipla Escolha</span>
        <button type="button" onclick="window.removerBlocoQuestao(this)" class="text-[11px] text-red-500 font-bold hover:underline cursor-pointer">🗑️ Remover</button>
      </div>
      ${barraConfiguracao}
      <input type="text" class="q-text w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Digite o enunciado da pergunta...">
      <p class="text-[10px] font-bold text-slate-400 uppercase">Marque a bolinha da alternativa correta:</p>
      <div class="space-y-2">
        ${cores.map((c, idx) => `
          <div class="flex items-center gap-2 p-1.5 rounded-xl border ${c.border} ${c.bg}">
            <input type="radio" name="correct_${uid}" value="${idx}" ${idx === 0 ? 'checked' : ''} title="Marcar como correta" class="accent-emerald-600 w-4 h-4 ml-1 cursor-pointer shrink-0">
            <span class="w-5 h-5 rounded-md ${c.badge} text-white text-[10px] font-extrabold flex items-center justify-center shrink-0">${c.letra}</span>
            <input type="text" class="q-opt-${idx} w-full text-xs p-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none" placeholder="Alternativa ${c.letra}...">
          </div>
        `).join('')}
      </div>
      ${campoExplicacao}
    `;
  }

  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
};

window.removerBlocoQuestao = function(btn) {
  btn.closest('.quiz-question-card')?.remove();
  document.querySelectorAll('#quiz-questions-container .quiz-question-card').forEach((card, i) => {
    const badge = card.querySelector('span');
    if (badge) {
      const t = card.dataset.qtype;
      const tipoLabel = t === 'VF' ? 'Verdadeiro ou Falso' : (t === 'ENQUETE' ? 'Enquete / Opinião' : 'Múltipla Escolha');
      badge.innerText = `Questão #${i + 1} • ${tipoLabel}`;
    }
  });
};

// 6. Coleta as questões configuradas no Editor (com tempo, pontos e gabarito comentado)
function coletarQuestoesDoEditor() {
  const cards = Array.from(document.querySelectorAll('#quiz-questions-container .quiz-question-card'));
  return cards.map(card => {
    const tipo = card.dataset.qtype || 'MULTIPLA';
    const enunciado = card.querySelector('.q-text')?.value.trim() || 'Pergunta sem enunciado';
    const timeLimit = Number(card.querySelector('.q-time')?.value || 30);
    const points = Number(card.querySelector('.q-points')?.value || 100);
    const explanation = card.querySelector('.q-explanation')?.value.trim() || '';
    const radioMarcado = card.querySelector('input[type="radio"]:checked');
    const correctIndex = radioMarcado ? Number(radioMarcado.value) : 0;

    if (tipo === 'VF') {
      return {
        type: 'VF',
        question: enunciado,
        options: ['Verdadeiro', 'Falso'],
        correctIndex: correctIndex,
        timeLimit,
        points,
        explanation
      };
    }

    if (tipo === 'ENQUETE') {
      const opcoesEnquete = [
        card.querySelector('.q-opt-0')?.value.trim(),
        card.querySelector('.q-opt-1')?.value.trim(),
        card.querySelector('.q-opt-2')?.value.trim()
      ].filter(opt => opt && opt.length > 0);

      return {
        type: 'ENQUETE',
        question: enunciado,
        options: opcoesEnquete.length >= 2 ? opcoesEnquete : ['Concordo', 'Discordo'],
        correctIndex: -1, // Todas pontuam na enquete
        timeLimit,
        points,
        explanation
      };
    }

    const opcoes = [
      card.querySelector('.q-opt-0')?.value.trim(),
      card.querySelector('.q-opt-1')?.value.trim(),
      card.querySelector('.q-opt-2')?.value.trim(),
      card.querySelector('.q-opt-3')?.value.trim()
    ].filter(opt => opt && opt.length > 0);

    const opcoesFinais = opcoes.length >= 2 ? opcoes : ['Alternativa A', 'Alternativa B'];
    const indiceCorretoSeguro = correctIndex < opcoesFinais.length ? correctIndex : 0;

    return {
      type: 'MULTIPLA',
      question: enunciado,
      options: opcoesFinais,
      correctIndex: indiceCorretoSeguro,
      timeLimit,
      points,
      explanation
    };
  });
}

// 7. Pré-visualização do Quiz antes de publicar (Visão do Aluno)
window.preVisualizarQuizProfessor = function() {
  const perguntas = coletarQuestoesDoEditor();
  if (perguntas.length === 0) {
    alert("⚠️ Adicione pelo menos uma questão no 'Quizizz Editor' antes de pré-visualizar!");
    return;
  }

  const titulo = document.getElementById('title')?.value.trim() || 'Prévia do Quiz';
  const modal = document.getElementById('student-preview-modal');
  const body = document.getElementById('professor-preview-body');
  if (!modal || !body) return;

  const coresBotao = ['btn-opt-a', 'btn-opt-b', 'btn-opt-c', 'btn-opt-d'];

  body.innerHTML = `
    <div class="bg-gradient-to-r from-[#3332A5] to-purple-700 text-white p-4 rounded-2xl">
      <span class="text-[10px] font-extrabold uppercase tracking-wider text-yellow-300">Simulação do Aluno • ${perguntas.length} Questão(ões)</span>
      <h3 class="text-base font-bold mt-0.5">${titulo}</h3>
    </div>
    ${perguntas.map((q, idx) => {
      const tipoTxt = q.type === 'VF' ? 'Verdadeiro ou Falso' : (q.type === 'ENQUETE' ? 'Enquete / Opinião' : 'Múltipla Escolha');
      const gabaritoTxt = q.type === 'ENQUETE' ? '📊 Todas pontuam' : `✓ Gabarito: ${String.fromCharCode(65 + q.correctIndex)}`;
      return `
        <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
          <div class="flex justify-between items-center flex-wrap gap-1">
            <span class="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-lg">Questão ${idx + 1} • ${tipoTxt}</span>
            <div class="flex items-center gap-2 text-[10px] font-bold">
              <span class="text-slate-500">⏱️ ${q.timeLimit > 0 ? q.timeLimit + 's' : 'Livre'}</span>
              <span class="text-amber-600">⭐ ${q.points} pts</span>
              <span class="text-emerald-700">${gabaritoTxt}</span>
            </div>
          </div>
          <p class="text-xs font-bold text-slate-800">${q.question}</p>
          <div class="grid grid-cols-1 ${q.type === 'VF' ? 'sm:grid-cols-2' : ''} gap-2">
            ${q.options.map((opt, oIdx) => `
              <div class="game-option-btn ${coresBotao[oIdx % 4]} p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm">
                <span>${String.fromCharCode(65 + oIdx)}) ${opt}</span>
                ${oIdx === q.correctIndex ? '<span class="bg-white/25 px-2 py-0.5 rounded text-[10px]">CORRETA</span>' : ''}
              </div>
            `).join('')}
          </div>
          ${q.explanation ? `<p class="text-[11px] text-purple-900 bg-purple-50 p-2.5 rounded-xl border border-purple-200">💡 <strong>Explicação:</strong> ${q.explanation}</p>` : ''}
        </div>
      `;
    }).join('')}
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

// 8. Converte e comprime imagens para não estourar o limite do FastAPI (INTACTO)
function processarFicheiroParaBase64(file) {
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

// 9. Envia a nova atividade (Material PDF ou Quiz) para o Supabase via FastAPI
window.handleFormSubmit = async function(e) {
  if (e) e.preventDefault();

  const turmaId = document.getElementById('modal-turma-select')?.value;
  if (!turmaId) {
    alert("Por favor, selecione primeiro a Turma do Professor.");
    return;
  }

  const turmaObj = window.teacherTurmas.find(t => String(t.id) === String(turmaId));
  const turmaNome = turmaObj ? turmaObj.nome : `Turma #${turmaId}`;
  const maxAttempts = Number(document.getElementById('modal-max-attempts')?.value ?? 1);

  const modal = document.getElementById('modal');
  const titleVal = document.getElementById('title')?.value.trim() || '';
  
  if (!titleVal) {
    alert("Por favor, preencha o Título da Atividade.");
    return;
  }

  let actType = (window.currentCreationMode === 'MANUAL' || window.currentCreationMode === 'AI') ? 'QUIZ' : 'MATERIAL';
  let fileUrl = '';
  let descBase = document.getElementById('description')?.value.trim() || 'Atividade publicada pelo docente.';
  const metaTag = `|||META_CONFIG|||${JSON.stringify({ maxAttempts })}`;
  let descVal = `${descBase}${metaTag}`;

  if (actType === 'MATERIAL') {
    const fileInput = document.getElementById('quick-file-input') || modal?.querySelector('input[type="file"]');
    const linkInput = document.getElementById('quick-link-input') || modal?.querySelector('input[type="url"]');

    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (file.size > 3 * 1024 * 1024) {
        alert("⚠️ O ficheiro é muito grande! Escolha um PDF ou imagem de até 3MB.");
        return;
      }
      fileUrl = await processarFicheiroParaBase64(file);
    } else if (linkInput && linkInput.value.trim()) {
      fileUrl = linkInput.value.trim();
    }
  } else {
    const perguntas = coletarQuestoesDoEditor();
    if (perguntas.length === 0) {
      alert("⚠️ Adicione pelo menos uma questão antes de publicar o Quiz!");
      return;
    }
    descVal = `${descBase}${metaTag}|||QUIZ_DATA|||${JSON.stringify(perguntas)}`;
  }

  const fullTitle = `[${turmaNome}] ${titleVal}`;

  const payload = {
    titulo: fullTitle,
    descricao: descVal,
    id_turma: Number(turmaId),
    id_tipo_atividade: actType === 'QUIZ' ? 2 : 1,
    ficheiro_url: fileUrl
  };

  try {
    const res = await fetch(`${API_URL}/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Detalhes do erro FastAPI:", errText);
      alert(`⚠️ O servidor recusou o envio (Erro ${res.status}). Verifique o terminal do Python.`);
      return;
    }

    alert("✅ Atividade publicada com sucesso!");
    document.getElementById('activity-form')?.reset();
    window.closeModal();
    await carregarAtividadesDoBanco();
  } catch (err) {
    console.error("Erro de rede/CORS:", err);
    alert("⚠️ Falha na comunicação com o FastAPI. Verifique se o servidor está ativo.");
  }
};


// 10. Exclui atividade permanentemente
window.deleteActivity = async function(id) {
  if (!confirm("Deseja excluir esta atividade permanentemente?")) return;

  const key = String(id);
  window.activities = window.activities.filter(a => String(a.id) !== key);
  localStorage.setItem('tech_activities', JSON.stringify(window.activities));

  const respostasSalvas = JSON.parse(localStorage.getItem('tech_student_answers') || '{}');
  delete respostasSalvas[key];
  localStorage.setItem('tech_student_answers', JSON.stringify(respostasSalvas));

  try {
    await fetch(`${API_URL}/atividades/${id}`, { method: 'DELETE' });
  } catch (err) {}

  window.renderCards();
};

// 11. Visualizar as respostas e anexos enviados pelos alunos
window.verRespostasDoAluno = async function(id, tituloEnc) {
  const titulo = decodeURIComponent(tituloEnc);
  const idStr = String(id);
  let listaRespostas = [];

  try {
    const res = await fetch(`${API_URL}/atividades/${id}/respostas`);
    if (res.ok) {
      const dados = await res.json();
      if (Array.isArray(dados) && dados.length > 0) {
        listaRespostas = dados.map(r => {
          const raw = r.conteudo_resposta || '';
          const partes = raw.split('|||ANEXO_ALUNO|||');
          return {
            aluno: r.aluno?.nome || 'Lucas Silva (Aluno)',
            data: new Date(r.data_resposta).toLocaleDateString('pt-BR'),
            respostaTexto: partes[0],
            arquivoUrl: partes[1] || ''
          };
        });
      }
    }
  } catch (e) {}

  if (listaRespostas.length === 0) {
    const respostasSalvas = JSON.parse(localStorage.getItem('tech_student_answers') || '{}');
    listaRespostas = respostasSalvas[idStr] || [];
  }

  window.currentStudentSubmissions = listaRespostas;

  const modal = document.getElementById('modal-ver-respostas');
  const tituloEl = document.getElementById('modal-respostas-titulo');
  const listaEl = document.getElementById('modal-respostas-lista');

  if (modal && listaEl) {
    if (tituloEl) tituloEl.innerText = titulo;
    listaEl.innerHTML = listaRespostas.length === 0
      ? `<div class="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl"><p class="text-xs font-semibold">Nenhuma resposta enviada ainda.</p></div>`
      : listaRespostas.map((r, index) => `
          <div class="p-4 bg-purple-50/60 border border-purple-100 rounded-2xl space-y-2">
            <div class="flex justify-between items-center text-xs">
              <span class="font-bold text-purple-900">👤 ${r.aluno}</span>
              <span class="text-[10px] text-slate-400 font-bold">${r.data}</span>
            </div>
            <p class="text-xs text-slate-700 font-medium bg-white p-3 rounded-xl border border-purple-100/50 leading-relaxed">${r.respostaTexto}</p>
            ${r.arquivoUrl ? `
              <div class="pt-1 flex justify-end">
                <button type="button" onclick="window.abrirArquivoDaEntrega(${index})" class="bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5">
                  <span>📎 Abrir Arquivo Enviado pelo Aluno</span>
                </button>
              </div>
            ` : ''}
          </div>
        `).join('');

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

// 12. Abre o arquivo enviado pelo aluno convertendo Base64 para Blob (INTACTO)
window.abrirArquivoDaEntrega = function(index) {
  const item = window.currentStudentSubmissions?.[index];
  if (!item || !item.arquivoUrl) return alert("Arquivo não encontrado.");

  const url = item.arquivoUrl;
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
      alert("Erro ao abrir o arquivo.");
    }
  } else {
    window.open(url, '_blank');
  }
};

window.fecharModalRespostas = function() {
  const modal = document.getElementById('modal-ver-respostas');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};