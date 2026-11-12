const API_URL = 'http://127.0.0.1:8000';

window.currentCreationMode = 'QUICK';
window.selectedModalGrade = '';
window.filterGrade = 'ALL';
window.activities = [];
window.currentStudentSubmissions = [];

document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) window.lucide.createIcons();
  carregarAtividadesDoBanco();
});

// 1. Carrega as atividades do backend FastAPI
async function carregarAtividadesDoBanco() {
  let carregouBanco = false;

  try {
    const response = await fetch(`${API_URL}/atividades/turma/1`);
    if (response.ok) {
      const dados = await response.json();
      if (Array.isArray(dados)) {
        window.activities = dados.map(a => ({
          id: String(a.id_atividade || a.id),
          title: a.titulo || a.title,
          description: a.descricao || a.description || 'Sem orientações.',
          grade: (a.titulo || '').includes('1º') ? '1º Ano EM' : ((a.titulo || '').includes('2º') ? '2º Ano EM' : '3º Ano EM'),
          type: a.id_tipo_atividade === 2 || a.type === 'QUIZ' ? 'QUIZ' : 'MATERIAL',
          fileUrl: a.ficheiro_url || a.fileUrl || ''
        }));
        carregouBanco = true;
      }
    }
  } catch (err) {
    console.warn('Backend offline, lendo localStorage...', err);
  }

  if (!carregouBanco) {
    const local = localStorage.getItem('tech_activities');
    window.activities = local ? JSON.parse(local) : [];
  }

  window.renderCards();
}

// 2. Renderiza os cards das atividades e consulta entregas na tabela 'resposta'
window.renderCards = async function() {
  const container = document.getElementById('cards-grid');
  const emptyState = document.getElementById('empty-state');
  const totalCount = document.getElementById('total-count');
  const searchVal = document.getElementById('search-input')?.value.toLowerCase() || '';

  if (!container) return;

  const filtered = window.activities.filter(act => {
    const matchGrade = window.filterGrade === 'ALL' || act.grade === window.filterGrade;
    const matchSearch = act.title.toLowerCase().includes(searchVal) || act.description.toLowerCase().includes(searchVal);
    return matchGrade && matchSearch;
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

    const descLimpa = act.description.split('|||QUIZ_DATA|||')[0];

    return `
      <div class="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between space-y-4">
        <div>
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-bold px-3 py-1 bg-purple-100 text-purple-900 rounded-xl">${act.grade}</span>
            <span class="text-xs font-bold px-3 py-1 ${act.type === 'QUIZ' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'} rounded-xl">${act.type}</span>
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

// 3. Abre PDF ou Imagem convertendo Base64 para Blob nativo
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

// 4. Controlo de Modais e Filtros
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
};

window.setFilterGrade = function(grade, btnElement) {
  window.filterGrade = grade;
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

window.switchCreationMode = function(mode) {
  window.currentCreationMode = mode;
  const tabQuick = document.getElementById('tab-quick-btn');
  const tabManual = document.getElementById('tab-manual-btn');
  const tabAi = document.getElementById('tab-ai-btn');

  const secQuick = document.getElementById('mode-quick-section');
  const secManual = document.getElementById('mode-manual-section');
  const secAi = document.getElementById('mode-ai-section');

  [tabQuick, tabManual, tabAi].forEach(t => t?.classList.remove('tab-active', 'bg-white', 'shadow-sm', 'text-purple-700'));

  if (mode === 'QUICK') {
    tabQuick?.classList.add('tab-active', 'bg-white', 'shadow-sm', 'text-purple-700');
    secQuick?.classList.remove('hidden');
    secManual?.classList.add('hidden');
    secAi?.classList.add('hidden');
  } else if (mode === 'MANUAL') {
    tabManual?.classList.add('tab-active', 'bg-white', 'shadow-sm', 'text-purple-700');
    secQuick?.classList.add('hidden');
    secManual?.classList.remove('hidden');
    secAi?.classList.add('hidden');
  } else if (mode === 'AI') {
    tabAi?.classList.add('tab-active', 'bg-[#3332A5]', 'text-white');
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

window.quizQuestionsList = [];

window.adicionarPerguntaQuiz = function() {
  const container = document.getElementById('questions-container') || document.getElementById('mode-manual-section');
  if (!container) return;

  const qIndex = document.querySelectorAll('.quiz-question-card').length + 1;
  const div = document.createElement('div');
  div.className = 'quiz-question-card p-4 bg-white border border-purple-200 rounded-2xl space-y-2 mt-3 shadow-sm';
  div.innerHTML = `
    <div class="flex justify-between items-center">
      <span class="text-xs font-extrabold text-purple-900">Pergunta #${qIndex}</span>
      <button type="button" onclick="this.closest('.quiz-question-card').remove()" class="text-[11px] text-red-500 font-bold hover:underline cursor-pointer">Remover</button>
    </div>
    <input type="text" class="q-text w-full text-xs p-2.5 border border-slate-200 rounded-xl" placeholder="Digite o enunciado da pergunta...">
    <div class="space-y-1.5 pt-1">
      <input type="text" class="q-opt-0 w-full text-xs p-2 bg-emerald-50/60 border border-emerald-300 rounded-xl" placeholder="Alternativa A (Correta)">
      <input type="text" class="q-opt-1 w-full text-xs p-2 border border-slate-200 rounded-xl" placeholder="Alternativa B">
      <input type="text" class="q-opt-2 w-full text-xs p-2 border border-slate-200 rounded-xl" placeholder="Alternativa C">
    </div>
  `;
  container.appendChild(div);
};

// Vincula automaticamente o clique no botão "+ Adicionar Pergunta" ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  const btns = Array.from(document.querySelectorAll('button'));
  const btnAdd = btns.find(b => b.textContent.includes('Adicionar Pergunta'));
  if (btnAdd) {
    btnAdd.onclick = (e) => {
      e.preventDefault();
      window.adicionarPerguntaQuiz();
    };
  }
});


// 5. Converte e comprime imagens para não estourar o limite do FastAPI
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

// 6. Envia a nova atividade (Material ou Quiz) para o Supabase via FastAPI
window.handleFormSubmit = async function(e) {
  if (e) e.preventDefault();

  if (!window.selectedModalGrade) {
    alert("Por favor, selecione primeiro a Série (1º EM, 2º EM ou 3º EM).");
    return;
  }

  const modal = document.getElementById('modal');
  const titleVal = document.getElementById('title')?.value.trim() || modal?.querySelector('input[type="text"]')?.value.trim() || '';
  
  if (!titleVal) {
    alert("Por favor, preencha o Título da Atividade.");
    return;
  }

  let actType = (window.currentCreationMode === 'MANUAL' || window.currentCreationMode === 'AI') ? 'QUIZ' : 'MATERIAL';
  let fileUrl = '';
  let descVal = document.getElementById('description')?.value.trim() || modal?.querySelector('textarea')?.value.trim() || '';

  if (actType === 'MATERIAL') {
    const fileInput = modal?.querySelector('input[type="file"]');
    const linkInput = modal?.querySelector('input[type="url"]');

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
    const cards = Array.from(document.querySelectorAll('.quiz-question-card'));
    const perguntas = cards.map(card => ({
      question: card.querySelector('.q-text')?.value.trim() || 'Pergunta sem enunciado',
      options: [
        card.querySelector('.q-opt-0')?.value.trim() || 'Alternativa A',
        card.querySelector('.q-opt-1')?.value.trim() || 'Alternativa B',
        card.querySelector('.q-opt-2')?.value.trim() || 'Alternativa C'
      ],
      correctIndex: 0
    }));

    if (perguntas.length === 0) {
      alert("⚠️ Clique em '+ Adicionar Pergunta' e preencha pelo menos uma questão antes de publicar o Quiz!");
      return;
    }

    descVal = `${descVal || 'Quiz Interativo'}|||QUIZ_DATA|||${JSON.stringify(perguntas)}`;
  }
  

  const fullTitle = `[${window.selectedModalGrade}] ${titleVal}`;

  const payload = {
    titulo: fullTitle,
    descricao: descVal || 'Atividade publicada pelo docente.',
    id_turma: 1,
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
    const fileInput = modal?.querySelector('input[type="file"]');
    const linkInput = modal?.querySelector('input[type="url"]');
    if (fileInput) fileInput.value = '';
    if (linkInput) linkInput.value = '';
    document.getElementById('activity-form')?.reset();
    window.closeModal();
    await carregarAtividadesDoBanco();
  } catch (err) {
    console.error("Erro de rede/CORS:", err);
    alert("⚠️ Falha na comunicação com o FastAPI. Verifique se o servidor está ativo.");
  }
};

// 7. Exclui atividade permanentemente
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

// 8. Visualizar as respostas e anexos enviados pelos alunos
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

// 9. Abre o arquivo enviado pelo aluno convertendo Base64 para Blob
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