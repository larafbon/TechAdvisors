const API_URL = 'http://127.0.0.1:8000';

window.selectedGradeFilter = 'ALL';
window.selectedModalGrade = '';
window.currentCreationMode = 'QUICK';
window.quizQuestionCounter = 0;
window.currentPreviewQuestions = [];
window.currentPreviewIndex = 0;
window.isEditingInPreview = false;

const professorProfile = {
  name: "Prof. Carlos Eduardo",
  subjects: ["Física", "Matemática", "Química"]
};

const curriculumTopics = {
  "1º Ano EM": {
    "Física": ["Leis de Newton", "Cinemática (MRU e MRUV)", "Trabalho e Energia"],
    "Matemática": ["Funções de 1º e 2º Grau", "Progressão Aritmética (PA)", "Conjuntos Numéricos"],
    "Química": ["Massa Atômica & Mol", "Gases Ideais", "Ligações Químicas Avançadas"]
  },
  "2º Ano EM": {
    "Física": ["Termodinâmica & Calor", "Óptica Geométrica", "Ondulatória e Acústica"],
    "Matemática": ["Trigonometria no Círculo", "Matrizes e Determinantes", "Geometria Plana"],
    "Química": ["Termoquímica", "Cinética Química", "Equilíbrio Químico e pH"]
  },
  "3º Ano EM": {
    "Física": ["Eletrodinâmica & Circuitos", "Magnetismo", "Física Moderna Básica"],
    "Matemática": ["Geometria Espacial (Volumes)", "Análise Combinatória", "Probabilidade e Estatística"],
    "Química": ["Química Orgânica (Cadeias)", "Funções Orgânicas", "Reações Orgânicas"]
  }
};

window.activities = [
  { id: 1, title: "Quizizz: Dinâmica e Leis de Newton", grade: "1º Ano EM", type: "QUIZ", description: "Quiz estilo Quizizz contendo questões conceituais com tempo limite." },
  { id: 2, title: "Guia PDF: Termodinâmica Básica", grade: "2º Ano EM", type: "MATERIAL", description: "Resumo sintético em PDF sobre as leis da termodinâmica." },
  { id: 3, title: "Lista de Exercícios: Eletrodinâmica", grade: "3º Ano EM", type: "TAREFA", description: "Exercícios de fixação de circuitos elétricos em série e paralelo." }
];

document.addEventListener('DOMContentLoaded', () => {
  window.renderCards();
});

window.renderCards = function() {
  const grid = document.getElementById('cards-grid');
  const emptyState = document.getElementById('empty-state');
  const searchVal = document.getElementById('search-input')?.value.toLowerCase().trim() || '';

  const filtered = window.activities.filter(act => {
    const matchSearch = act.title.toLowerCase().includes(searchVal) || (act.description && act.description.toLowerCase().includes(searchVal));
    const matchGrade = window.selectedGradeFilter === 'ALL' || act.grade === window.selectedGradeFilter;
    return matchSearch && matchGrade;
  });

  const totalEl = document.getElementById('total-count');
  if (totalEl) totalEl.innerText = filtered.length;

  if (filtered.length === 0) {
    if (grid) grid.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (grid) {
    grid.innerHTML = filtered.map(act => `
      <div class="bg-white border border-slate-100 rounded-3xl p-6 shadow-md hover:shadow-lg transition flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="text-xs font-bold px-3 py-1 bg-blue-50 text-[#3332A5] rounded-xl">${act.grade}</span>
            <span class="text-xs font-bold px-3 py-1 ${getTypeStyle(act.type)} rounded-xl">${act.type}</span>
          </div>
          <h3 class="text-base font-bold text-slate-800 mb-1.5 leading-snug">${act.title}</h3>
          <p class="text-xs text-slate-500 leading-relaxed">${act.description || 'Sem orientações específicas.'}</p>
        </div>
        <div class="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span class="text-slate-400 text-[11px] font-semibold">Ensino Médio</span>
          <div class="flex items-center gap-1">
            <button onclick="previewPublishedCard('${act.title}', '${act.grade}')" title="Visão do Aluno" class="text-slate-400 hover:text-purple-600 p-1.5 transition cursor-pointer">
              <i data-lucide="eye" class="w-4 h-4"></i>
            </button>
            <button onclick="deleteActivity(${act.id})" title="Excluir" class="text-slate-400 hover:text-red-500 p-1.5 transition cursor-pointer">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
    if (window.lucide) window.lucide.createIcons();
  }
};

function getTypeStyle(type) {
  switch (type) {
    case 'QUIZ': return 'bg-purple-50 text-purple-700';
    case 'MATERIAL': return 'bg-blue-50 text-blue-700';
    default: return 'bg-amber-50 text-amber-700';
  }
}

window.setFilterGrade = function(grade, btnElement) {
  window.selectedGradeFilter = grade;
  document.querySelectorAll('.filter-chip').forEach(b => {
    b.classList.remove('chip-selected');
    b.classList.add('bg-slate-50', 'text-slate-600');
  });
  if (btnElement) btnElement.classList.add('chip-selected');
  window.renderCards();
};

window.openModal = function() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    window.switchCreationMode('QUICK');
  }
};

window.closeModal = function() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  const form = document.getElementById('activity-form');
  if (form) form.reset();
  
  const manualList = document.getElementById('manual-questions-list');
  if (manualList) manualList.innerHTML = '';
  
  const aiList = document.getElementById('ai-questions-list');
  if (aiList) aiList.innerHTML = '';

  const aiPrev = document.getElementById('ai-preview-container');
  if (aiPrev) aiPrev.classList.add('hidden');

  window.selectedModalGrade = '';
  document.querySelectorAll('.modal-grade-chip').forEach(b => {
    b.classList.remove('chip-selected');
    b.classList.add('bg-white', 'text-slate-600');
  });

  const subjectSelect = document.getElementById('ai-subject');
  const topicInput = document.getElementById('ai-topic');
  const generateBtn = document.getElementById('ai-generate-btn');

  if (subjectSelect) {
    subjectSelect.innerHTML = '<option value="">Selecione primeiro a Série acima</option>';
    subjectSelect.disabled = true;
  }
  if (topicInput) topicInput.disabled = true;
  if (generateBtn) generateBtn.disabled = true;

  window.quizQuestionCounter = 0;
};

window.selectModalGrade = function(grade, btnElement) {
  window.selectedModalGrade = grade;
  document.querySelectorAll('.modal-grade-chip').forEach(b => {
    b.classList.remove('chip-selected');
    b.classList.add('bg-white', 'text-slate-600');
  });
  if (btnElement) {
    btnElement.classList.add('chip-selected');
    btnElement.classList.remove('bg-white', 'text-slate-600');
  }

  const subjectSelect = document.getElementById('ai-subject');
  const topicInput = document.getElementById('ai-topic');
  const generateBtn = document.getElementById('ai-generate-btn');

  const availableGradeData = curriculumTopics[grade] || {};
  const validSubjects = professorProfile.subjects.filter(subj => availableGradeData[subj] && availableGradeData[subj].length > 0);

  if (validSubjects.length === 0) {
    if (subjectSelect) {
      subjectSelect.innerHTML = '<option value="">Nenhuma matéria cadastrada para esta série</option>';
      subjectSelect.disabled = true;
    }
    if (topicInput) topicInput.disabled = true;
    if (generateBtn) generateBtn.disabled = true;
  } else {
    if (subjectSelect) {
      subjectSelect.innerHTML = validSubjects.map(s => `<option value="${s}">${s}</option>`).join('');
      subjectSelect.disabled = false;
    }
    if (topicInput) {
      topicInput.disabled = false;
      topicInput.placeholder = "Selecione abaixo ou digite...";
    }
    if (generateBtn) generateBtn.disabled = false;
  }

  if (window.currentCreationMode === 'AI') {
    window.updateTopicSuggestions();
  }
};

window.switchCreationMode = function(mode) {
  window.currentCreationMode = mode;
  const quickBtn = document.getElementById('tab-quick-btn');
  const manualBtn = document.getElementById('tab-manual-btn');
  const aiBtn = document.getElementById('tab-ai-btn');

  const quickSec = document.getElementById('mode-quick-section');
  const manualSec = document.getElementById('mode-manual-section');
  const aiSec = document.getElementById('mode-ai-section');

  [quickBtn, manualBtn, aiBtn].forEach(btn => {
    if (btn) btn.className = "py-2.5 px-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 transition text-center cursor-pointer";
  });

  if (quickSec) quickSec.classList.add('hidden');
  if (manualSec) manualSec.classList.add('hidden');
  if (aiSec) aiSec.classList.add('hidden');

  if (mode === 'QUICK') {
    if (quickBtn) quickBtn.className = "py-2.5 px-2 rounded-xl text-xs font-bold transition tab-active text-center cursor-pointer";
    if (quickSec) quickSec.classList.remove('hidden');
  } else if (mode === 'MANUAL') {
    if (manualBtn) manualBtn.className = "py-2.5 px-2 rounded-xl text-xs font-bold transition tab-active text-center cursor-pointer";
    if (manualSec) manualSec.classList.remove('hidden');
    if (window.quizQuestionCounter === 0) window.addQuizizzQuestion('MULTIPLE');
  } else if (mode === 'AI') {
    if (aiBtn) aiBtn.className = "py-2.5 px-2 rounded-xl text-xs font-bold transition tab-active text-center cursor-pointer flex items-center justify-center gap-1";
    if (aiSec) aiSec.classList.remove('hidden');
    window.updateTopicSuggestions();
  }
};

window.updateTopicSuggestions = function() {
  const subjectSelect = document.getElementById('ai-subject');
  const subject = subjectSelect ? subjectSelect.value : '';
  const gradeLabel = document.getElementById('grade-label-suggest');
  const subjectLabel = document.getElementById('subject-label-suggest');
  const container = document.getElementById('topic-chips-container');

  if (subjectLabel) subjectLabel.innerText = subject || 'Disciplina';

  if (!window.selectedModalGrade) {
    if (gradeLabel) gradeLabel.innerText = "Selecione uma série acima";
    if (container) container.innerHTML = '<span class="text-[11px] text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">Escolha a Série do Ensino Médio no topo do formulário.</span>';
    return;
  }

  if (gradeLabel) gradeLabel.innerText = window.selectedModalGrade;
  const gradeTopics = curriculumTopics[window.selectedModalGrade];
  const topics = (gradeTopics && gradeTopics[subject]) ? gradeTopics[subject] : [];

  if (topics.length === 0) {
    if (container) container.innerHTML = '<span class="text-[11px] text-slate-400">Digite manualmente o tópico de conteúdo desejado acima.</span>';
    return;
  }

  if (container) {
    container.innerHTML = topics.map(topic => `
      <button type="button" onclick="selectSuggestedTopic('${topic}')" class="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-700 px-2.5 py-1 rounded-lg transition cursor-pointer">
        ${topic}
      </button>
    `).join('');
  }
};

window.selectSuggestedTopic = function(topic) {
  const topicInput = document.getElementById('ai-topic');
  if (topicInput) topicInput.value = topic;
};

window.addQuizizzQuestion = function(questionType) {
  window.quizQuestionCounter++;
  const list = document.getElementById('manual-questions-list');
  if (!list) return;

  const qDiv = document.createElement('div');
  const questionId = `question-block-${Date.now()}-${window.quizQuestionCounter}`;
  qDiv.id = questionId;
  qDiv.dataset.type = questionType;
  qDiv.className = "p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm quizizz-card relative question-card-item";

  let headerLabel = 'Múltipla Escolha';
  if (questionType === 'TF') headerLabel = 'Verdadeiro ou Falso (Afirmações)';
  if (questionType === 'MATCH') headerLabel = 'Associação Visual';
  if (questionType === 'ORDER') headerLabel = 'Ordenar Etapas';

  qDiv.innerHTML = `
    <div class="flex justify-between items-center flex-wrap gap-2">
      <span class="text-xs font-bold text-purple-900">Questão ${window.quizQuestionCounter} - ${headerLabel}</span>
      <div class="flex items-center gap-2">
        <select class="q-time-select text-[10px] font-bold bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-slate-700 focus:outline-none">
          <option value="15">15s</option>
          <option value="30" selected>30s</option>
          <option value="60">60s</option>
          <option value="120">120s</option>
          <option value="0">Sem Tempo</option>
        </select>
        <select class="q-points-select text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-1 rounded-lg border border-purple-200 focus:outline-none">
          <option value="50">50 pt</option>
          <option value="100" selected>100 pt</option>
          <option value="200">200 pt</option>
        </select>
        <button type="button" onclick="removeSingleQuestion('${questionId}')" title="Apagar esta pergunta" class="text-slate-400 hover:text-red-500 p-1 transition cursor-pointer">
          <i data-lucide="trash-2" class="w-4 h-4"></i>
        </button>
      </div>
    </div>
    <input type="text" placeholder="Escreva o enunciado da pergunta..." class="q-title-input w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-semibold text-slate-800">
    ${getQuestionFieldsHTML(questionType, window.quizQuestionCounter)}
  `;
  list.appendChild(qDiv);
  if (window.lucide) window.lucide.createIcons();
};

window.removeSingleQuestion = function(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
};

function getQuestionFieldsHTML(type, count) {
  if (type === 'MULTIPLE') {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
        <div class="option-card-a p-2 rounded-xl flex items-center gap-2">
          <span class="w-5 h-5 bg-emerald-600 text-white rounded-md flex items-center justify-center font-bold text-[10px]">A</span>
          <input type="text" placeholder="Opção A (Correta)" class="q-opt-a w-full bg-transparent text-[11px] font-bold text-emerald-900 focus:outline-none">
        </div>
        <div class="option-card-b p-2 rounded-xl flex items-center gap-2">
          <span class="w-5 h-5 bg-blue-600 text-white rounded-md flex items-center justify-center font-bold text-[10px]">B</span>
          <input type="text" placeholder="Opção B" class="q-opt-b w-full bg-transparent text-[11px] font-medium text-slate-700 focus:outline-none">
        </div>
        <div class="option-card-c p-2 rounded-xl flex items-center gap-2">
          <span class="w-5 h-5 bg-amber-500 text-white rounded-md flex items-center justify-center font-bold text-[10px]">C</span>
          <input type="text" placeholder="Opção C" class="q-opt-c w-full bg-transparent text-[11px] font-medium text-slate-700 focus:outline-none">
        </div>
        <div class="option-card-d p-2 rounded-xl flex items-center gap-2">
          <span class="w-5 h-5 bg-red-500 text-white rounded-md flex items-center justify-center font-bold text-[10px]">D</span>
          <input type="text" placeholder="Opção D" class="q-opt-d w-full bg-transparent text-[11px] font-medium text-slate-700 focus:outline-none">
        </div>
      </div>
    `;
  } else if (type === 'TF') {
    return `
      <div class="space-y-2 pt-1">
        <span class="text-[10px] font-bold text-slate-500 uppercase">Escreva as afirmações (I, II, III):</span>
        <input type="text" placeholder="Afirmação I..." class="q-stmt-1 w-full text-[11px] p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium">
        <input type="text" placeholder="Afirmação II..." class="q-stmt-2 w-full text-[11px] p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium">
        <input type="text" placeholder="Afirmação III..." class="q-stmt-3 w-full text-[11px] p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none font-medium">
        <span class="text-[10px] font-bold text-slate-500 uppercase block pt-1">Alternativas de Resposta:</span>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input type="text" value="V - V - F (Correta)" class="q-opt-a text-[11px] p-2 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold rounded-xl focus:outline-none">
          <input type="text" value="F - V - V" class="q-opt-b text-[11px] p-2 bg-white border border-slate-200 text-slate-700 rounded-xl focus:outline-none">
          <input type="text" value="V - F - V" class="q-opt-c text-[11px] p-2 bg-white border border-slate-200 text-slate-700 rounded-xl focus:outline-none">
          <input type="text" value="F - F - F" class="q-opt-d text-[11px] p-2 bg-white border border-slate-200 text-slate-700 rounded-xl focus:outline-none">
        </div>
      </div>
    `;
  } else {
    return `
      <div class="grid grid-cols-2 gap-2">
        <input type="text" placeholder="Item A" class="q-opt-a text-[11px] p-2 bg-blue-50 border border-blue-200 text-blue-900 font-bold rounded-xl focus:outline-none">
        <input type="text" placeholder="Item B" class="q-opt-b text-[11px] p-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl focus:outline-none">
      </div>
    `;
  }
}

window.generateAIQuiz = function() {
  const topicInput = document.getElementById('ai-topic');
  const subjectInput = document.getElementById('ai-subject');
  const countInput = document.getElementById('ai-count');

  const topic = topicInput ? topicInput.value.trim() : '';
  const subject = subjectInput ? subjectInput.value : '';
  const count = countInput ? (parseInt(countInput.value) || 5) : 5;

  if (!window.selectedModalGrade) {
    alert("Por favor, selecione primeiro a Série do Ensino Médio no topo.");
    return;
  }
  if (!topic) {
    alert("Por favor, selecione ou digite um tópico de conteúdo.");
    return;
  }

  const container = document.getElementById('ai-preview-container');
  const list = document.getElementById('ai-questions-list');
  if (list) list.innerHTML = '';

  const titleEl = document.getElementById('title');
  if (titleEl) titleEl.value = `Quizizz: ${topic} (${window.selectedModalGrade})`;

  const sampleQuestions = [
    {
      q: `Analise as afirmações abaixo sobre ${topic} (${window.selectedModalGrade}) e assinale a sequência correta:`,
      type: 'TF',
      stmt1: `I. O estudo de ${topic} é essencial para a compreensão dos tópicos avançados de ${subject}.`,
      stmt2: `II. A aplicação prática de ${topic} é restrita apenas a teorias abstratas sem uso no cotidiano.`,
      stmt3: `III. A análise analítica de ${topic} permite resolver problemas complexos.`,
      optA: 'V - F - V (Correta)',
      optB: 'F - V - F',
      optC: 'V - V - F',
      optD: 'F - F - V'
    },
    {
      q: `Em relação ao conteúdo de ${topic}, qual das alternativas expressa a aplicação correta?`,
      type: 'MULTIPLE',
      optA: `Definição e aplicação exata do conteúdo de ${topic}.`,
      optB: 'Explicação contrária com erro de cálculo intencional.',
      optC: 'Aplicação que ignora as leis básicas da matéria.',
      optD: 'Nenhuma das respostas anteriores.'
    }
  ];

  for (let i = 0; i < count; i++) {
    const item = sampleQuestions[i % sampleQuestions.length];
    const qDiv = document.createElement('div');
    const aiQId = `ai-question-${Date.now()}-${i}`;
    qDiv.id = aiQId;
    qDiv.dataset.type = item.type;
    qDiv.className = "p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm quizizz-card relative question-card-item";

    if (item.type === 'TF') {
      qDiv.innerHTML = `
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-purple-900">Questão ${i+1} - Verdadeiro ou Falso (Afirmações)</span>
          <div class="flex gap-2 items-center">
            <select class="q-time-select text-[10px] font-bold text-slate-700 px-2 py-0.5 rounded border"><option value="30">30s</option></select>
            <select class="q-points-select text-[10px] font-bold text-purple-800 px-2 py-0.5 rounded border"><option value="100">100 pt</option></select>
            <button type="button" onclick="removeSingleQuestion('${aiQId}')" title="Apagar Pergunta" class="text-slate-400 hover:text-red-500 p-1 cursor-pointer"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          </div>
        </div>
        <input type="text" value="${item.q}" class="q-title-input w-full text-xs font-bold text-slate-800 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none">
        <div class="space-y-1.5">
          <input type="text" value="${item.stmt1}" class="q-stmt-1 w-full text-[11px] p-2 bg-slate-50 border rounded-xl">
          <input type="text" value="${item.stmt2}" class="q-stmt-2 w-full text-[11px] p-2 bg-slate-50 border rounded-xl">
          <input type="text" value="${item.stmt3}" class="q-stmt-3 w-full text-[11px] p-2 bg-slate-50 border rounded-xl">
        </div>
        <div class="grid grid-cols-2 gap-2 pt-1">
          <input type="text" value="${item.optA}" class="q-opt-a text-[11px] p-2 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold rounded-xl focus:outline-none">
          <input type="text" value="${item.optB}" class="q-opt-b text-[11px] p-2 bg-white border border-slate-200 text-slate-700 rounded-xl focus:outline-none">
          <input type="text" value="${item.optC}" class="q-opt-c text-[11px] p-2 bg-white border border-slate-200 text-slate-700 rounded-xl focus:outline-none">
          <input type="text" value="${item.optD}" class="q-opt-d text-[11px] p-2 bg-white border border-slate-200 text-slate-700 rounded-xl focus:outline-none">
        </div>
      `;
    } else {
      qDiv.innerHTML = `
        <div class="flex justify-between items-center">
          <span class="text-xs font-bold text-purple-900">Questão ${i+1} - Múltipla Escolha</span>
          <div class="flex gap-2 items-center">
            <select class="q-time-select text-[10px] font-bold text-slate-700 px-2 py-0.5 rounded border"><option value="30">30s</option></select>
            <select class="q-points-select text-[10px] font-bold text-purple-800 px-2 py-0.5 rounded border"><option value="100">100 pt</option></select>
            <button type="button" onclick="removeSingleQuestion('${aiQId}')" title="Apagar Pergunta" class="text-slate-400 hover:text-red-500 p-1 cursor-pointer"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
          </div>
        </div>
        <input type="text" value="${item.q}" class="q-title-input w-full text-xs font-bold text-slate-800 p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
          <div class="option-card-a p-2 rounded-xl flex items-center gap-2">
            <span class="w-5 h-5 bg-emerald-600 text-white rounded-md flex items-center justify-center font-bold text-[10px]">A</span>
            <input type="text" value="${item.optA}" class="q-opt-a w-full bg-transparent text-[11px] font-bold text-emerald-900 focus:outline-none">
          </div>
          <div class="option-card-b p-2 rounded-xl flex items-center gap-2">
            <span class="w-5 h-5 bg-blue-600 text-white rounded-md flex items-center justify-center font-bold text-[10px]">B</span>
            <input type="text" value="${item.optB}" class="q-opt-b w-full bg-transparent text-[11px] font-medium text-slate-700 focus:outline-none">
          </div>
          <div class="option-card-c p-2 rounded-xl flex items-center gap-2">
            <span class="w-5 h-5 bg-amber-500 text-white rounded-md flex items-center justify-center font-bold text-[10px]">C</span>
            <input type="text" value="${item.optC || ''}" class="q-opt-c w-full bg-transparent text-[11px] font-medium text-slate-700 focus:outline-none">
          </div>
          <div class="option-card-d p-2 rounded-xl flex items-center gap-2">
            <span class="w-5 h-5 bg-red-500 text-white rounded-md flex items-center justify-center font-bold text-[10px]">D</span>
            <input type="text" value="${item.optD || ''}" class="q-opt-d w-full bg-transparent text-[11px] font-medium text-slate-700 focus:outline-none">
          </div>
        </div>
      `;
    }
    if (list) list.appendChild(qDiv);
  }

  if (container) container.classList.remove('hidden');
  if (window.lucide) window.lucide.createIcons();
};

window.previewCurrentQuizBeforePublish = function() {
  const targetContainerId = (window.currentCreationMode === 'AI') ? 'ai-questions-list' : 'manual-questions-list';
  const questionElements = document.querySelectorAll(`#${targetContainerId} .question-card-item`);

  window.currentPreviewQuestions = [];
  questionElements.forEach((el) => {
    const titleInput = el.querySelector('.q-title-input');
    const title = titleInput ? titleInput.value.trim() : 'Pergunta sem título';
    const type = el.dataset.type || 'MULTIPLE';
    const timeSelect = el.querySelector('.q-time-select');
    const time = timeSelect ? timeSelect.value : '30';
    const pointsSelect = el.querySelector('.q-points-select');
    const points = pointsSelect ? pointsSelect.value : '100';

    const stmt1 = el.querySelector('.q-stmt-1') ? el.querySelector('.q-stmt-1').value.trim() : '';
    const stmt2 = el.querySelector('.q-stmt-2') ? el.querySelector('.q-stmt-2').value.trim() : '';
    const stmt3 = el.querySelector('.q-stmt-3') ? el.querySelector('.q-stmt-3').value.trim() : '';

    const optA = el.querySelector('.q-opt-a') ? el.querySelector('.q-opt-a').value.trim() : '';
    const optB = el.querySelector('.q-opt-b') ? el.querySelector('.q-opt-b').value.trim() : '';
    const optC = el.querySelector('.q-opt-c') ? el.querySelector('.q-opt-c').value.trim() : '';
    const optD = el.querySelector('.q-opt-d') ? el.querySelector('.q-opt-d').value.trim() : '';

    window.currentPreviewQuestions.push({ elRef: el, title, type, time, points, stmt1, stmt2, stmt3, optA, optB, optC, optD });
  });

  if (window.currentPreviewQuestions.length === 0) {
    alert("Não há perguntas criadas ou geradas para visualizar ainda!");
    return;
  }

  window.currentPreviewIndex = 0;
  window.isEditingInPreview = false;
  togglePreviewEditingModeUI(false);
  window.renderStudentPreviewStep();

  const modal = document.getElementById('student-preview-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.previewPublishedCard = function(title, grade) {
  window.currentPreviewQuestions = [{
    elRef: null,
    title: title,
    type: 'MULTIPLE',
    time: '30',
    points: '100',
    optA: 'Opção de resposta correta baseada no conteúdo da atividade.',
    optB: 'Opção alternativa de teste para verificação do aluno.',
    optC: 'Terceira alternativa secundária.',
    optD: 'Quarta opção de escolha.'
  }];

  window.selectedModalGrade = grade;
  window.currentPreviewIndex = 0;
  window.isEditingInPreview = false;
  togglePreviewEditingModeUI(false);
  window.renderStudentPreviewStep();

  const modal = document.getElementById('student-preview-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.renderStudentPreviewStep = function() {
  const q = window.currentPreviewQuestions[window.currentPreviewIndex];
  if (!q) return;

  const total = window.currentPreviewQuestions.length;

  const tag = document.getElementById('preview-grade-tag');
  const stepLabel = document.getElementById('preview-step-label');
  const timeLabel = document.getElementById('preview-time-label');
  const pointsBadge = document.getElementById('preview-points-badge');
  const progressBar = document.getElementById('preview-progress-bar');
  const qTitle = document.getElementById('preview-question-title');

  if (tag) tag.innerText = window.selectedModalGrade || 'Geral';
  if (stepLabel) stepLabel.innerText = `Questão ${window.currentPreviewIndex + 1} de ${total}`;
  if (timeLabel) timeLabel.innerText = q.time === '0' ? 'Sem Tempo' : `⏱️ ${q.time}s restantes`;
  if (pointsBadge) pointsBadge.innerText = `+${q.points || 100} PTS`;

  const percent = ((window.currentPreviewIndex + 1) / total) * 100;
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (qTitle) qTitle.innerText = q.title || "Pergunta sem título";

  const stmtsContainer = document.getElementById('preview-statements-container');
  if (stmtsContainer) {
    if (q.type === 'TF' && (q.stmt1 || q.stmt2 || q.stmt3)) {
      stmtsContainer.classList.remove('hidden');
      stmtsContainer.innerHTML = `
        ${q.stmt1 ? `<p>${q.stmt1}</p>` : ''}
        ${q.stmt2 ? `<p>${q.stmt2}</p>` : ''}
        ${q.stmt3 ? `<p>${q.stmt3}</p>` : ''}
      `;
    } else {
      stmtsContainer.classList.add('hidden');
    }
  }

  const container = document.getElementById('preview-options-container');
  if (container) {
    container.innerHTML = `
      ${q.optA ? `
        <button type="button" class="game-option-btn btn-opt-a w-full text-left p-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-md">
          <span class="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0">A</span>
          <span>${q.optA}</span>
        </button>
      ` : ''}
      ${q.optB ? `
        <button type="button" class="game-option-btn btn-opt-b w-full text-left p-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-md">
          <span class="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0">B</span>
          <span>${q.optB}</span>
        </button>
      ` : ''}
      ${q.optC ? `
        <button type="button" class="game-option-btn btn-opt-c w-full text-left p-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-md">
          <span class="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0">C</span>
          <span>${q.optC}</span>
        </button>
      ` : ''}
      ${q.optD ? `
        <button type="button" class="game-option-btn btn-opt-d w-full text-left p-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-md">
          <span class="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0">D</span>
          <span>${q.optD}</span>
        </button>
      ` : ''}
    `;
  }

  const prevBtn = document.getElementById('prev-q-btn');
  const nextBtn = document.getElementById('next-q-btn');
  if (prevBtn) prevBtn.disabled = (window.currentPreviewIndex === 0);
  if (nextBtn) nextBtn.disabled = (window.currentPreviewIndex === total - 1);

  fillPreviewEditFields(q);
};

window.togglePreviewEditing = function() {
  window.isEditingInPreview = !window.isEditingInPreview;
  togglePreviewEditingModeUI(window.isEditingInPreview);
};

function togglePreviewEditingModeUI(showEdit) {
  const displayDiv = document.getElementById('preview-display-mode');
  const editDiv = document.getElementById('preview-edit-mode');
  const btn = document.getElementById('toggle-edit-preview-btn');

  if (showEdit) {
    if (displayDiv) displayDiv.classList.add('hidden');
    if (editDiv) editDiv.classList.remove('hidden');
    if (btn) btn.innerText = "Voltar a Ver";
  } else {
    if (displayDiv) displayDiv.classList.remove('hidden');
    if (editDiv) editDiv.classList.add('hidden');
    if (btn) btn.innerText = "Editar Pergunta";
  }
}

function fillPreviewEditFields(q) {
  const titleInput = document.getElementById('edit-preview-title');
  const timeSelect = document.getElementById('edit-preview-time');
  const pointsSelect = document.getElementById('edit-preview-points');
  const optAInput = document.getElementById('edit-preview-opta');
  const optBInput = document.getElementById('edit-preview-optb');
  const optCInput = document.getElementById('edit-preview-optc');
  const optDInput = document.getElementById('edit-preview-optd');

  if (titleInput) titleInput.value = q.title || '';
  if (timeSelect) timeSelect.value = q.time || '30';
  if (pointsSelect) pointsSelect.value = q.points || '100';
  if (optAInput) optAInput.value = q.optA || '';
  if (optBInput) optBInput.value = q.optB || '';
  if (optCInput) optCInput.value = q.optC || '';
  if (optDInput) optDInput.value = q.optD || '';
}

window.savePreviewEdits = function() {
  const q = window.currentPreviewQuestions[window.currentPreviewIndex];
  if (!q) return;

  q.title = document.getElementById('edit-preview-title')?.value || '';
  q.time = document.getElementById('edit-preview-time')?.value || '30';
  q.points = document.getElementById('edit-preview-points')?.value || '100';
  q.optA = document.getElementById('edit-preview-opta')?.value || '';
  q.optB = document.getElementById('edit-preview-optb')?.value || '';
  q.optC = document.getElementById('edit-preview-optc')?.value || '';
  q.optD = document.getElementById('edit-preview-optd')?.value || '';

  if (q.elRef) {
    const titleInput = q.elRef.querySelector('.q-title-input');
    if (titleInput) titleInput.value = q.title;

    const timeSel = q.elRef.querySelector('.q-time-select');
    if (timeSel) timeSel.value = q.time;

    const ptsSel = q.elRef.querySelector('.q-points-select');
    if (ptsSel) ptsSel.value = q.points;

    const optA = q.elRef.querySelector('.q-opt-a');
    if (optA) optA.value = q.optA;

    const optB = q.elRef.querySelector('.q-opt-b');
    if (optB) optB.value = q.optB;

    const optC = q.elRef.querySelector('.q-opt-c');
    if (optC) optC.value = q.optC;

    const optD = q.elRef.querySelector('.q-opt-d');
    if (optD) optD.value = q.optD;
  }

  togglePreviewEditingModeUI(false);
  window.isEditingInPreview = false;
  window.renderStudentPreviewStep();
};

window.navigatePreviewQuestion = function(dir) {
  window.currentPreviewIndex += dir;
  window.isEditingInPreview = false;
  togglePreviewEditingModeUI(false);
  window.renderStudentPreviewStep();
};

window.closeStudentPreview = function() {
  const modal = document.getElementById('student-preview-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.handleFormSubmit = async function(e) {
  if (e) e.preventDefault();

  if (!window.selectedModalGrade) {
    alert("Por favor, selecione uma série do Ensino Médio.");
    return;
  }

  const titleVal = document.getElementById('title')?.value.trim() || '';
  if (!titleVal) {
    alert("Por favor, preencha o Título da Atividade.");
    return;
  }

  let actType = 'MATERIAL';
  if (window.currentCreationMode === 'MANUAL' || window.currentCreationMode === 'AI') {
    actType = 'QUIZ';
  } else {
    const quickType = document.getElementById('quick-type');
    if (quickType) actType = quickType.value;
  }

  const descVal = document.getElementById('description')?.value.trim() || '';

  const payload = {
    titulo: `[${window.selectedModalGrade}] ${titleVal}`,
    descricao: descVal || `Atividade gerada no modo ${window.currentCreationMode}`,
    id_turma: 1,
    id_tipo_atividade: actType === 'QUIZ' ? 2 : 1
  };

  try {
    const response = await fetch(`${API_URL}/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert('✅ Atividade salva com sucesso!');
    }
  } catch (err) {
    console.warn('API local offline. Adicionando ao estado local...');
  }

  const newAct = {
    id: Date.now(),
    title: payload.titulo,
    grade: window.selectedModalGrade,
    type: actType,
    description: payload.descricao
  };

  window.activities.unshift(newAct);
  window.renderCards();
  window.closeModal();
};

window.deleteActivity = function(id) {
  window.activities = window.activities.filter(a => a.id !== id);
  window.renderCards();
};