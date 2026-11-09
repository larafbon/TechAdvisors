const API_URL = 'http://127.0.0.1:8000';

window.selectedModalGrade = '';
window.currentCreationMode = 'QUICK';
window.quizQuestionCounter = 0;
window.currentPreviewQuestions = [];
window.currentPreviewIndex = 0;

const curriculumTopics = {
  "1º Ano EM": {
    "Física": ["Leis de Newton", "Cinemática (MRU e MRUV)", "Trabalho e Energia"],
    "Matemática": ["Funções de 1º e 2º Grau", "Progressão Aritmética (PA)"],
    "Química": ["Massa Atômica & Mol", "Gases Ideais"]
  },
  "2º Ano EM": {
    "Física": ["Termodinâmica & Calor", "Óptica Geométrica"],
    "Matemática": ["Trigonometria no Círculo", "Matrizes"],
    "Química": ["Termoquímica", "Cinética Química"]
  },
  "3º Ano EM": {
    "Física": ["Eletrodinâmica & Circuitos", "Magnetismo"],
    "Matemática": ["Geometria Espacial", "Probabilidade"],
    "Química": ["Química Orgânica", "Reações Orgânicas"]
  }
};

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
    window.switchCreationMode('QUICK');
  }
};

window.fecharModalAtividade = function() {
  const modal = document.getElementById('modal-atividade');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
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

  if (subjectSelect) {
    subjectSelect.innerHTML = '<option value="Física">Física</option><option value="Matemática">Matemática</option><option value="Química">Química</option>';
    subjectSelect.disabled = false;
  }
  if (topicInput) {
    topicInput.disabled = false;
    topicInput.placeholder = "Selecione a matéria acima ou digite...";
  }
  if (generateBtn) generateBtn.disabled = false;

  window.updateTopicSuggestions();
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
  const subject = subjectSelect ? subjectSelect.value : 'Física';
  const container = document.getElementById('topic-chips-container');
  
  if (!container) return;

  const gradeTopics = curriculumTopics[window.selectedModalGrade];
  const topics = (gradeTopics && gradeTopics[subject]) ? gradeTopics[subject] : ["Leis de Newton", "Equações da Física"];

  container.innerHTML = topics.map(topic => `
    <button type="button" onclick="selectSuggestedTopic('${topic}')" class="text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-700 px-2.5 py-1 rounded-lg transition cursor-pointer">
      ${topic}
    </button>
  `).join('');
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

  qDiv.innerHTML = `
    <div class="flex justify-between items-center flex-wrap gap-2">
      <span class="text-xs font-bold text-purple-900">Questão ${window.quizQuestionCounter} (${questionType === 'MULTIPLE' ? 'Múltipla Escolha' : 'V ou F'})</span>
      <button type="button" onclick="document.getElementById('${questionId}').remove()" class="text-slate-400 hover:text-red-500 font-bold text-xs cursor-pointer">Excluir</button>
    </div>
    <input type="text" placeholder="Escreva o enunciado da pergunta..." required class="q-title-input w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
      <input type="text" placeholder="Opção A (Correta)" required class="q-opt-a text-[11px] p-2 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold rounded-xl">
      <input type="text" placeholder="Opção B" required class="q-opt-b text-[11px] p-2 bg-white border border-slate-200 text-slate-700 rounded-xl">
    </div>
  `;
  list.appendChild(qDiv);
};

window.generateAIQuiz = function() {
  const topicInput = document.getElementById('ai-topic');
  const topic = topicInput ? topicInput.value.trim() : '';

  if (!window.selectedModalGrade) {
    alert("Por favor, selecione primeiro a Série do Ensino Médio no topo.");
    return;
  }
  if (!topic) {
    alert("Por favor, selecione ou digite um tópico de conteúdo.");
    return;
  }

  const titleInput = document.getElementById('titulo_atividade');
  if (titleInput) titleInput.value = `Quizizz: ${topic} (${window.selectedModalGrade})`;

  const container = document.getElementById('ai-preview-container');
  const list = document.getElementById('ai-questions-list');
  list.innerHTML = '';

  const sampleQuestions = [
    { q: `Analise as afirmações sobre ${topic} (${window.selectedModalGrade}) e assinale a opção correta:`, optA: 'Opção Correta baseada em teorias', optB: 'Opção Incorreta A', optC: 'Opção Incorreta B', optD: 'N.D.A.' },
    { q: `Em relação aos conceitos de ${topic}, qual é a aplicação prática?`, optA: 'Aplicação correta direta', optB: 'Aplicação equivocada', optC: 'Erros conceituais', optD: 'Todas anteriores' }
  ];

  sampleQuestions.forEach((item, i) => {
    const qDiv = document.createElement('div');
    qDiv.className = "p-4 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm quizizz-card question-card-item";
    qDiv.dataset.type = "MULTIPLE";
    qDiv.innerHTML = `
      <span class="text-xs font-bold text-purple-900">Questão ${i+1} — Gerada por IA</span>
      <input type="text" value="${item.q}" class="q-title-input w-full text-xs font-bold text-slate-800 p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
        <input type="text" value="${item.optA}" class="q-opt-a text-[11px] p-2 bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold rounded-xl">
        <input type="text" value="${item.optB}" class="q-opt-b text-[11px] p-2 bg-white border border-slate-200 text-slate-700 rounded-xl">
      </div>
    `;
    list.appendChild(qDiv);
  });

  if (container) container.classList.remove('hidden');
};

/* ==================== VISÃO DO ALUNO ==================== */
window.previewCurrentQuizBeforePublish = function() {
  const targetContainerId = (window.currentCreationMode === 'AI') ? 'ai-questions-list' : 'manual-questions-list';
  const questionElements = document.querySelectorAll(`#${targetContainerId} .question-card-item`);

  window.currentPreviewQuestions = [];
  questionElements.forEach((el) => {
    const titleInput = el.querySelector('.q-title-input');
    const title = titleInput ? titleInput.value.trim() : 'Pergunta sem título';
    const optA = el.querySelector('.q-opt-a') ? el.querySelector('.q-opt-a').value.trim() : 'Opção A';
    const optB = el.querySelector('.q-opt-b') ? el.querySelector('.q-opt-b').value.trim() : 'Opção B';
    window.currentPreviewQuestions.push({ title, optA, optB, time: '30', points: '100' });
  });

  if (window.currentPreviewQuestions.length === 0) {
    window.currentPreviewQuestions.push({
      title: document.getElementById('titulo_atividade')?.value || "Exemplo de Pergunta Gamificada",
      optA: "Alternativa A (Correta)",
      optB: "Alternativa B (Incorreta)",
      time: "30",
      points: "100"
    });
  }

  window.currentPreviewIndex = 0;
  window.renderStudentPreviewStep();

  const modal = document.getElementById('student-preview-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.renderStudentPreviewStep = function() {
  const q = window.currentPreviewQuestions[window.currentPreviewIndex];
  const total = window.currentPreviewQuestions.length;

  document.getElementById('preview-grade-tag').innerText = window.selectedModalGrade || 'Ensino Médio';
  document.getElementById('preview-step-label').innerText = `Questão ${window.currentPreviewIndex + 1} de ${total}`;
  document.getElementById('preview-question-title').innerText = q.title;

  const container = document.getElementById('preview-options-container');
  container.innerHTML = `
    <button type="button" class="game-option-btn btn-opt-a w-full text-left p-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-md">
      <span class="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center font-extrabold text-xs">A</span>
      <span>${q.optA}</span>
    </button>
    <button type="button" class="game-option-btn btn-opt-b w-full text-left p-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 shadow-md">
      <span class="w-7 h-7 bg-white/20 rounded-xl flex items-center justify-center font-extrabold text-xs">B</span>
      <span>${q.optB}</span>
    </button>
  `;

  document.getElementById('prev-q-btn').disabled = (window.currentPreviewIndex === 0);
  document.getElementById('next-q-btn').disabled = (window.currentPreviewIndex === total - 1);
};

window.navigatePreviewQuestion = function(dir) {
  window.currentPreviewIndex += dir;
  window.renderStudentPreviewStep();
};

window.closeStudentPreview = function() {
  const modal = document.getElementById('student-preview-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

window.enviarAtividadeDireta = async function(event) {
  if (event) event.preventDefault();

  const tituloInput = document.getElementById('titulo_atividade');
  const descricaoInput = document.getElementById('descricao_atividade');

  const tituloVal = tituloInput ? tituloInput.value.trim() : '';
  const descricaoVal = descricaoInput ? descricaoInput.value.trim() : '';

  if (!tituloVal) {
    alert('Por favor, preencha o título da atividade!');
    return;
  }

  const prefixo = window.selectedModalGrade ? `[${window.selectedModalGrade}] ` : '';

  const payload = {
    titulo: `${prefixo}${tituloVal}`,
    descricao: descricaoVal || `Atividade gerada no modo ${window.currentCreationMode}`,
    id_turma: 1,
    id_tipo_atividade: window.currentCreationMode === 'QUICK' ? 1 : 2
  };

  try {
    const response = await fetch(`${API_URL}/atividades`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      alert('✅ Atividade salva com sucesso no Supabase!');
      window.fecharModalAtividade();
      window.location.reload();
    } else {
      const data = await response.json();
      alert('❌ Erro no servidor: ' + JSON.stringify(data.detail || data));
    }
  } catch (error) {
    console.error('Erro de conexão:', error);
    alert('❌ Verifique se a API Uvicorn está rodando.');
  }
};