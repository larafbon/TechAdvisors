const API_URL = 'http://127.0.0.1:8000';

let turmas = [];
let alunos = [];
let professores = [];

// Metadados visuais complementares salvos em localStorage
let adminMeta = JSON.parse(localStorage.getItem('tech_admin_meta')) || {
  turmas: {},
  alunos: {},
  professores: {},
  listaProfessoresCache: []
};

function saveMeta() {
  localStorage.setItem('tech_admin_meta', JSON.stringify(adminMeta));
}

function normalizarTurno(turno) {
  const t = (turno || '').toLowerCase();
  if (t === 'matutino' || t === 'manhã') return 'Manhã';
  if (t === 'vespertino' || t === 'tarde') return 'Tarde';
  if (t === 'noturno' || t === 'noite') return 'Noite';
  if (t === 'integral') return 'Integral';
  return turno || 'Manhã';
}

function normalizarStatusProf(status) {
  const s = (status || '').toString().trim().toLowerCase();
  return s === 'inativo' ? 'inativo' : 'ativo';
}

// Retorna todos os IDs de turmas de um aluno (combinando id_turma do banco + turmas extras)
function getTurmasIdsDoAluno(aluno) {
  const ids = new Set();
  if (aluno.id_turma) ids.add(Number(aluno.id_turma));
  const extras = adminMeta.alunos[aluno.id_aluno]?.turmasIds;
  if (Array.isArray(extras)) {
    extras.forEach(id => {
      if (id) ids.add(Number(id));
    });
  }
  return Array.from(ids);
}

// Normaliza os dados vindos da tabela "professor" do Supabase
function normalizarProfessor(raw) {
  const id = Number(raw.id_professor || raw.id);
  const nome =
    raw.nome ||
    raw.nome_professor ||
    raw.usuario?.nome ||
    `Professor #${id}`;

  const email =
    raw.email ||
    raw.email_professor ||
    raw.usuario?.email ||
    'docente@techadvisors.br';

  const disciplina =
    raw.disciplina ||
    adminMeta.professores[id]?.disciplina ||
    '';

  const status = normalizarStatusProf(
    adminMeta.professores[id]?.status || raw.status || 'ativo'
  );

  return {
    id_professor: id,
    nome,
    email,
    disciplina,
    status
  };
}

document.addEventListener('DOMContentLoaded', async () => {
  const userString = localStorage.getItem('tech_user');

  if (!userString) {
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(userString);
  if (user.role !== 'admin' && user.role !== 'responsavel') {
    window.location.href = user.role === 'professor' ? 'professor.html' : 'alunos.html';
    return;
  }

  const nomeAdmin = user.nome || 'Administrador';
  const navAdminName = document.getElementById('nav-admin-name');
  if (navAdminName) navAdminName.innerText = `⚙️ ${nomeAdmin}`;

  const welcomeTitle = document.getElementById('welcome-title');
  if (welcomeTitle) welcomeTitle.innerText = `Bem-vindo(a), ${nomeAdmin}!`;

  if (localStorage.getItem('tech_dark_mode') === 'true') {
    document.body.classList.add('dark-theme');
    updateThemeButtonText(true);
  }

  await carregarDadosDoBanco();
});

async function carregarDadosDoBanco() {
  try {
    const [resTurmas, resAlunos, resProfs] = await Promise.all([
      fetch(`${API_URL}/turmas`).catch(() => ({ ok: false })),
      fetch(`${API_URL}/alunos`).catch(() => ({ ok: false })),
      fetch(`${API_URL}/professores`).catch(() => ({ ok: false }))
    ]);

    const rawTurmas = resTurmas.ok ? await resTurmas.json() : [];
    const rawAlunos = resAlunos.ok ? await resAlunos.json() : [];
    const rawProfs = resProfs.ok ? await resProfs.json() : null;

    turmas = Array.isArray(rawTurmas) ? rawTurmas : (rawTurmas.turmas || rawTurmas.data || []);
    alunos = Array.isArray(rawAlunos) ? rawAlunos : (rawAlunos.alunos || rawAlunos.data || []);

    const mapProfs = new Map();

    if (Array.isArray(rawProfs)) {
      rawProfs.map(normalizarProfessor).forEach(p => {
        if (p.id_professor) mapProfs.set(p.id_professor, p);
      });
    } else {
      (adminMeta.listaProfessoresCache || []).forEach(p => {
        const norm = normalizarProfessor(p);
        if (norm.id_professor && !mapProfs.has(norm.id_professor)) {
          mapProfs.set(norm.id_professor, norm);
        }
      });

      turmas.forEach(t => {
        const idProf = Number(t.id_professor);
        if (idProf && !mapProfs.has(idProf)) {
          mapProfs.set(idProf, normalizarProfessor({
            id_professor: idProf,
            nome: t.nome_professor || t.professor,
            disciplina: t.disciplina
          }));
        }
      });
    }

    professores = Array.from(mapProfs.values());
    adminMeta.listaProfessoresCache = professores;
    saveMeta();

    renderTurmas();
    renderAlunos();
    renderProfessores();
    renderRelatorios();
    populateSelects();
  } catch (error) {
    console.error('Erro ao carregar dados do backend:', error);
  }
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.card-nav').forEach(card => card.classList.remove('active-tab'));

  const targetSection = document.getElementById(`section-${tabName}`);
  const targetCard = document.getElementById(`card-tab-${tabName}`);

  if (targetSection) targetSection.classList.add('active');
  if (targetCard) targetCard.classList.add('active-tab');

  if (tabName === 'relatorios') {
    renderRelatorios();
  }
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('tech_dark_mode', isDark);
  updateThemeButtonText(isDark);
}

function updateThemeButtonText(isDark) {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) btn.innerText = isDark ? '☀️ Modo Claro' : '🌙 Modo Escuro';
}

function openModal(id) {
  populateSelects();
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function renderCheckboxesTurmas(containerId, inputName, idsSelecionados = []) {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!turmas.length) {
    container.innerHTML = `<p class="text-muted text-[11px]">Nenhuma turma cadastrada ainda.</p>`;
    return;
  }

  container.innerHTML = turmas.map(t => {
    const marcado = idsSelecionados.includes(Number(t.id_turma)) ? 'checked' : '';
    return `
      <label class="flex items-center justify-between p-1.5 rounded hover:bg-purple-500/10 cursor-pointer">
        <div class="flex items-center gap-2">
          <input type="checkbox" name="${inputName}" value="${t.id_turma}" ${marcado} class="accent-purple-700">
          <span class="font-semibold text-main">${t.nome_turma}</span>
        </div>
        <span class="text-[10px] text-muted">${normalizarTurno(t.turno)}</span>
      </label>
    `;
  }).join('');
}

function populateSelects() {
  renderCheckboxesTurmas('aluno-turmas-checkboxes', 'aluno-turma-check', []);

  const selectProf = document.getElementById('turma-professor');
  if (selectProf) {
    selectProf.innerHTML = professores.length
      ? professores.map(p => `<option value="${p.id_professor}">${p.nome}</option>`).join('')
      : `<option value="">Nenhum professor cadastrado</option>`;
  }

  renderCheckboxesTurmas('prof-turmas-checkboxes', 'prof-turma-check', []);
}

// ==========================================
// TURMAS
// ==========================================
function renderTurmas() {
  const grid = document.getElementById('grid-turmas');
  if (!grid) return;

  const search = (document.getElementById('search-turmas')?.value || '').toLowerCase();
  const turnoFilter = document.getElementById('filter-turno')?.value || 'Todos';

  const filtradas = turmas.filter(t => {
    const profObj = professores.find(p => Number(p.id_professor) === Number(t.id_professor));
    const nomeProf = profObj ? profObj.nome : '';
    const disciplina = t.disciplina || '';
    const turnoPadrao = normalizarTurno(t.turno);

    const matchTexto =
      (t.nome_turma || '').toLowerCase().includes(search) ||
      disciplina.toLowerCase().includes(search) ||
      nomeProf.toLowerCase().includes(search);
    const matchTurno = turnoFilter === 'Todos' || turnoPadrao === turnoFilter;
    return matchTexto && matchTurno;
  });

  if (filtradas.length === 0) {
    grid.innerHTML = `<p class="text-xs text-muted col-span-full text-center py-8">Nenhuma turma encontrada.</p>`;
    return;
  }

  grid.innerHTML = filtradas.map(t => {
    const turnoPadrao = normalizarTurno(t.turno);
    const matriculados = alunos.filter(a => getTurmasIdsDoAluno(a).includes(Number(t.id_turma))).length;
    const profObj = professores.find(p => Number(p.id_professor) === Number(t.id_professor));
    const nomeProf = profObj ? profObj.nome : 'Docente não atribuído';

    const badgeColor = turnoPadrao === 'Manhã' ? 'bg-amber-100 text-amber-800' :
                       turnoPadrao === 'Tarde' ? 'bg-blue-100 text-blue-800' :
                       turnoPadrao === 'Noite' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800';

    return `
      <div class="surface-alt rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start gap-2 mb-2">
            <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeColor}">${turnoPadrao}</span>
            <div class="flex items-center gap-2">
              <button onclick="verAlunosTurma(${t.id_turma})" class="text-purple-600 hover:text-purple-800 text-xs font-bold cursor-pointer" title="Ver Alunos da Turma">🎓</button>
              <button onclick="removerTurma(${t.id_turma})" class="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer" title="Excluir Turma">✕</button>
            </div>
          </div>
          <h4 class="font-bold text-sm text-main mb-1">${t.nome_turma}</h4>
          <p class="text-xs text-muted mb-1">📘 Disciplina: ${t.disciplina || 'Geral'}</p>
          <p class="text-xs text-muted mb-3">👨‍🏫 Professor: <span class="text-main font-semibold">${nomeProf}</span></p>
        </div>

        <div class="pt-3 border-t border-theme flex justify-between items-center text-[11px] font-semibold">
          <span class="text-muted">Alunos matriculados</span>
          <button onclick="verAlunosTurma(${t.id_turma})" class="text-purple-600 hover:text-purple-800 font-bold cursor-pointer">
            🎓 ${matriculados} aluno(s)
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function verAlunosTurma(idTurma) {
  const turma = turmas.find(t => Number(t.id_turma) === Number(idTurma));
  const alunosDaTurma = alunos.filter(a => getTurmasIdsDoAluno(a).includes(Number(idTurma)));

  const tituloEl = document.getElementById('modal-turma-alunos-titulo');
  const listaEl = document.getElementById('lista-alunos-turma');

  if (tituloEl) {
    tituloEl.innerText = turma ? `🎓 Alunos Matriculados — ${turma.nome_turma}` : '🎓 Alunos da Turma';
  }

  if (listaEl) {
    if (alunosDaTurma.length === 0) {
      listaEl.innerHTML = `<p class="text-xs text-muted text-center py-6">Nenhum aluno matriculado nesta turma ainda.</p>`;
    } else {
      listaEl.innerHTML = alunosDaTurma.map(a => {
        const status = (adminMeta.alunos[a.id_aluno]?.status) || 'Ativo';
        return `
          <div class="surface-alt rounded-xl p-3 flex items-center justify-between">
            <div>
              <div class="font-bold text-xs text-main">${a.nome}</div>
              <div class="text-[11px] text-muted">${a.matricula} • ${a.email || ''}</div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">${status}</span>
          </div>
        `;
      }).join('');
    }
  }

  openModal('modal-alunos-turma');
}

async function salvarTurma(e) {
  e.preventDefault();
  const nome_turma = document.getElementById('turma-nome').value.trim();
  const serie_ano = document.getElementById('turma-serie').value.trim();
  const disciplina = document.getElementById('turma-disciplina').value.trim();
  const turno = document.getElementById('turma-turno').value;
  const id_professor = parseInt(document.getElementById('turma-professor').value, 10);

  if (!id_professor) {
    alert('Cadastre ou selecione um professor responsável antes de criar a turma.');
    return;
  }

  const payload = {
    codigo_turma: `TURMA${Date.now().toString().slice(-5)}`,
    nome_turma,
    serie_ano,
    disciplina,
    turno,
    ano_letivo: new Date().getFullYear(),
    id_professor,
    status_turma: 'ativa'
  };

  try {
    const res = await fetch(`${API_URL}/turmas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Erro ao salvar turma: ${err.detail || 'Verifique os campos.'}`);
      return;
    }

    await carregarDadosDoBanco();
    e.target.reset();
    closeModal('modal-turma');
  } catch (error) {
    console.error('Erro ao criar turma:', error);
    alert('Falha na comunicação com o servidor.');
  }
}

async function removerTurma(idTurma) {
  if (!confirm('Deseja realmente excluir esta turma?')) return;

  try {
    const res = await fetch(`${API_URL}/turmas/${idTurma}`, { method: 'DELETE' });
    if (res.ok) {
      delete adminMeta.turmas[idTurma];
      saveMeta();
      await carregarDadosDoBanco();
    } else {
      alert('Não foi possível excluir a turma.');
    }
  } catch (error) {
    console.error('Erro ao excluir turma:', error);
  }
}

// ==========================================
// ALUNOS (MÚLTIPLAS TURMAS, EDITAR E REMOVER)
// ==========================================
function renderAlunos() {
  const tbody = document.getElementById('tbody-alunos');
  if (!tbody) return;

  const search = (document.getElementById('search-alunos')?.value || '').toLowerCase();
  const statusFilter = document.getElementById('filter-aluno-status')?.value || 'Todos';

  const filtrados = alunos.filter(a => {
    const idsTurmas = getTurmasIdsDoAluno(a);
    const nomesTurmas = idsTurmas
      .map(id => turmas.find(t => Number(t.id_turma) === id)?.nome_turma)
      .filter(Boolean);
    const textoTurmas = nomesTurmas.length ? nomesTurmas.join(', ') : 'Sem turma';
    const status = (adminMeta.alunos[a.id_aluno]?.status) || 'Ativo';

    const matchTexto = (a.nome || '').toLowerCase().includes(search) ||
                       (a.matricula || '').toLowerCase().includes(search) ||
                       textoTurmas.toLowerCase().includes(search);
    const matchStatus = statusFilter === 'Todos' || status === statusFilter;
    return matchTexto && matchStatus;
  });

  if (filtrados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-muted">Nenhum aluno encontrado.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtrados.map(a => {
    const idsTurmas = getTurmasIdsDoAluno(a);
    const nomesTurmas = idsTurmas
      .map(id => turmas.find(t => Number(t.id_turma) === id)?.nome_turma)
      .filter(Boolean);

    const turmasHtml = nomesTurmas.length
      ? `<div class="flex flex-wrap gap-1">${nomesTurmas.map(nome =>
          `<span class="px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200">${nome}</span>`
        ).join('')}</div>`
      : `<span class="text-muted">Sem turma</span>`;

    const status = (adminMeta.alunos[a.id_aluno]?.status) || 'Ativo';
    const statusBadge = status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' :
                        status === 'Pendente' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800';

    return `
      <tr>
        <td class="py-3 px-4 font-mono font-bold text-purple-600">${a.matricula}</td>
        <td class="py-3 px-4">
          <div class="font-bold text-main">${a.nome}</div>
          <div class="text-[11px] text-muted">${a.email || ''}</div>
        </td>
        <td class="py-3 px-4 text-main">${turmasHtml}</td>
        <td class="py-3 px-4">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusBadge}">${status}</span>
        </td>
        <td class="py-3 px-4 text-right space-x-3">
          <button onclick="abrirModalEditarAluno(${a.id_aluno})" class="text-purple-600 hover:text-purple-800 font-bold cursor-pointer">Editar</button>
          <button onclick="removerAluno(${a.id_aluno})" class="text-red-500 hover:text-red-700 font-bold cursor-pointer">Remover</button>
        </td>
      </tr>
    `;
  }).join('');
}

function abrirModalEditarAluno(idAluno) {
  const aluno = alunos.find(a => Number(a.id_aluno) === Number(idAluno));
  if (!aluno) return;

  const statusAtual = (adminMeta.alunos[aluno.id_aluno]?.status) || 'Ativo';
  const turmasAtuais = getTurmasIdsDoAluno(aluno);

  document.getElementById('edit-aluno-id').value = aluno.id_aluno;
  document.getElementById('edit-aluno-matricula').value = aluno.matricula || '';
  document.getElementById('edit-aluno-nome').value = aluno.nome || '';
  document.getElementById('edit-aluno-email').value = aluno.email || '';
  document.getElementById('edit-aluno-nascimento').value = (aluno.data_nascimento || '2011-05-10').split('T')[0];
  document.getElementById('edit-aluno-status').value = statusAtual;

  renderCheckboxesTurmas('edit-aluno-turmas-checkboxes', 'edit-aluno-turma-check', turmasAtuais);

  const modal = document.getElementById('modal-editar-aluno');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

async function atualizarAluno(e) {
  e.preventDefault();

  const idAluno = parseInt(document.getElementById('edit-aluno-id').value, 10);
  const alunoOriginal = alunos.find(a => Number(a.id_aluno) === idAluno) || {};

  const matricula = document.getElementById('edit-aluno-matricula').value.trim();
  const nome = document.getElementById('edit-aluno-nome').value.trim();
  const email = document.getElementById('edit-aluno-email').value.trim();
  const data_nascimento = document.getElementById('edit-aluno-nascimento').value;
  const status = document.getElementById('edit-aluno-status').value;

  const turmasSelecionadas = Array.from(document.querySelectorAll('input[name="edit-aluno-turma-check"]:checked'))
    .map(cb => parseInt(cb.value, 10));

  const turmaPrincipal = turmasSelecionadas.length > 0 ? turmasSelecionadas[0] : null;

  const payload = {
    nome,
    email,
    data_nascimento,
    matricula,
    id_turma: turmaPrincipal,
    id_responsavel: alunoOriginal.id_responsavel || null
  };

  try {
    const res = await fetch(`${API_URL}/alunos/${idAluno}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      const msgErro = Array.isArray(err.detail)
        ? err.detail.map(d => `${d.loc?.slice(-1)[0] || 'Campo'}: ${d.msg}`).join('\n')
        : (err.detail || 'Verifique os dados informados.');
      alert(`Erro ao atualizar aluno:\n${msgErro}`);
      return;
    }

    adminMeta.alunos[idAluno] = {
      status,
      turmasIds: turmasSelecionadas
    };
    saveMeta();

    await carregarDadosDoBanco();
    closeModal('modal-editar-aluno');
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    alert('Falha na comunicação com o servidor.');
  }
}

async function salvarAluno(e) {
  e.preventDefault();
  const user = JSON.parse(localStorage.getItem('tech_user') || '{}');

  const nome = document.getElementById('aluno-nome').value.trim();
  const email = document.getElementById('aluno-email').value.trim();
  const data_nascimento = document.getElementById('aluno-nascimento').value;
  const status = document.getElementById('aluno-status').value;
  const matricula = `MAT${Date.now().toString().slice(-6)}`;

  const turmasSelecionadas = Array.from(document.querySelectorAll('input[name="aluno-turma-check"]:checked'))
    .map(cb => parseInt(cb.value, 10));

  const turmaPrincipal = turmasSelecionadas.length > 0 ? turmasSelecionadas[0] : null;

  const payload = {
    nome,
    email,
    data_nascimento,
    matricula,
    senha: '12345678',
    id_turma: turmaPrincipal,
    id_responsavel: user.id_responsavel || user.id || null
  };

  try {
    const res = await fetch(`${API_URL}/alunos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Erro ao matricular aluno: ${err.detail || 'Verifique os dados.'}`);
      return;
    }

    const novoAluno = await res.json();
    adminMeta.alunos[novoAluno.id_aluno] = {
      status,
      turmasIds: turmasSelecionadas
    };
    saveMeta();

    await carregarDadosDoBanco();
    e.target.reset();
    closeModal('modal-aluno');
  } catch (error) {
    console.error('Erro ao salvar aluno:', error);
    alert('Falha na comunicação com o servidor.');
  }
}

async function removerAluno(idAluno) {
  if (!confirm('Deseja realmente remover este aluno?')) return;

  try {
    const res = await fetch(`${API_URL}/alunos/${idAluno}`, { method: 'DELETE' });
    if (res.ok) {
      delete adminMeta.alunos[idAluno];
      saveMeta();
      await carregarDadosDoBanco();
    } else {
      alert('Não foi possível remover o aluno.');
    }
  } catch (error) {
    console.error('Erro ao remover aluno:', error);
  }
}

// ==========================================
// PROFESSORES (BANCO DE DADOS + VER/EDITAR + VÍNCULO/DESVÍNCULO)
// ==========================================
function renderProfessores() {
  const grid = document.getElementById('grid-profs');
  if (!grid) return;

  const search = (document.getElementById('search-profs')?.value || '').toLowerCase();

  const filtrados = professores.filter(p => {
    const idProf = Number(p.id_professor);
    const nomeProf = p.nome || '';
    const emailProf = p.email || '';
    const meta = adminMeta.professores[idProf] || {};
    const disc = p.disciplina || meta.disciplina || 'Docente';
    return (
      nomeProf.toLowerCase().includes(search) ||
      emailProf.toLowerCase().includes(search) ||
      disc.toLowerCase().includes(search)
    );
  });

  if (filtrados.length === 0) {
    grid.innerHTML = `<p class="text-xs text-muted col-span-full text-center py-8">Nenhum docente encontrado.</p>`;
    return;
  }

  grid.innerHTML = filtrados.map(p => {
    const idProf = Number(p.id_professor);
    const nomeProf = p.nome || `Professor #${idProf}`;
    const meta = adminMeta.professores[idProf] || {};
    const turmasVinculadas = turmas.filter(t => Number(t.id_professor) === idProf);
    const disciplina = p.disciplina || meta.disciplina || (turmasVinculadas[0]?.disciplina) || 'Corpo Docente';
    const statusProf = normalizarStatusProf(meta.status || p.status || 'ativo');

    const nomesTurmas = turmasVinculadas.length > 0
      ? turmasVinculadas.map(t => t.nome_turma).join(', ')
      : 'Nenhuma turma vinculada';

    return `
      <div class="surface-alt rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-start gap-2 mb-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800">${disciplina}</span>
              ${statusProf === 'inativo' ? `<span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">Inativo</span>` : ''}
            </div>
            <div class="flex items-center gap-2">
              <button onclick="abrirModalEditarProfessor(${idProf})" class="text-purple-600 hover:text-purple-800 text-xs font-bold cursor-pointer" title="Ver e Editar Dados">✏️</button>
              <button onclick="removerProfessor(${idProf})" class="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer" title="Remover Docente">✕</button>
            </div>
          </div>
          <h4 class="font-bold text-sm text-main mb-1">${nomeProf}</h4>
          <p class="text-xs text-muted mb-2">✉️ ${p.email || 'E-mail não disponível'}</p>
          <p class="text-[11px] text-main mb-3">🏫 <span class="text-muted">Turmas:</span> ${nomesTurmas}</p>
        </div>
        <div class="pt-3 border-t border-theme flex justify-between items-center text-[11px] font-semibold">
          <button onclick="abrirModalEditarProfessor(${idProf})" class="text-slate-600 hover:text-purple-700 font-bold cursor-pointer">
            👁️ Ver / Editar
          </button>
          <button onclick="abrirModalVincularTurmas(${idProf})" class="text-purple-600 hover:text-purple-800 font-bold cursor-pointer">
            + Vincular Turmas (${turmasVinculadas.length})
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function abrirModalEditarProfessor(idProf) {
  const prof = professores.find(p => Number(p.id_professor) === Number(idProf));
  if (!prof) return;

  const meta = adminMeta.professores[idProf] || {};
  const turmasVinculadasIds = turmas
    .filter(t => Number(t.id_professor) === Number(idProf))
    .map(t => Number(t.id_turma));

  const disciplinaAtual = prof.disciplina || meta.disciplina || (turmas.find(t => Number(t.id_professor) === Number(idProf))?.disciplina) || 'Corpo Docente';
  const statusAtual = normalizarStatusProf(meta.status || prof.status || 'ativo');

  document.getElementById('edit-prof-id').value = idProf;
  document.getElementById('edit-prof-codigo').value = `PROF-${String(idProf).padStart(3, '0')}`;
  document.getElementById('edit-prof-status').value = statusAtual;
  document.getElementById('edit-prof-nome').value = prof.nome || '';
  document.getElementById('edit-prof-email').value = prof.email || '';
  document.getElementById('edit-prof-disciplina').value = disciplinaAtual;

  renderCheckboxesTurmas('edit-prof-turmas-checkboxes', 'edit-prof-turma-check', turmasVinculadasIds);

  const modal = document.getElementById('modal-editar-professor');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

async function atualizarProfessor(e) {
  e.preventDefault();

  const idProf = parseInt(document.getElementById('edit-prof-id').value, 10);
  const profOriginal = professores.find(p => Number(p.id_professor) === idProf) || {};

  const nome = document.getElementById('edit-prof-nome').value.trim();
  const email = document.getElementById('edit-prof-email').value.trim();
  const disciplina = document.getElementById('edit-prof-disciplina').value.trim();
  const statusSelect = document.getElementById('edit-prof-status').value;
  const status = normalizarStatusProf(statusSelect || profOriginal.status || 'ativo');

  const turmasSelecionadas = Array.from(document.querySelectorAll('input[name="edit-prof-turma-check"]:checked'))
    .map(cb => parseInt(cb.value, 10));

  adminMeta.professores[idProf] = {
    ...(adminMeta.professores[idProf] || {}),
    nome,
    email,
    disciplina,
    status,
    turmasIds: turmasSelecionadas
  };

  if (Array.isArray(adminMeta.listaProfessoresCache)) {
    const idx = adminMeta.listaProfessoresCache.findIndex(p => Number(p.id_professor) === idProf);
    if (idx !== -1) {
      adminMeta.listaProfessoresCache[idx] = { ...adminMeta.listaProfessoresCache[idx], nome, email, disciplina, status };
    }
  }
  saveMeta();

  try {
    // Atualiza vínculos e desvínculos das turmas primeiro
    await sincronizarTurmasDoProfessor(idProf, turmasSelecionadas);

    // Atualiza dados cadastrais do professor
    const res = await fetch(`${API_URL}/professores/${idProf}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        email,
        senha: profOriginal.senha || '12345678',
        status
      })
    });

    if (!res.ok && res.status !== 404 && res.status !== 405) {
      console.warn('Aviso ao atualizar dados do professor no banco:', res.status);
    }

    await carregarDadosDoBanco();
    closeModal('modal-editar-professor');
  } catch (error) {
    console.error('Erro ao atualizar professor:', error);
    alert('Falha na comunicação com o servidor.');
  }
}

async function salvarProfessor(e) {
  e.preventDefault();
  const nome = document.getElementById('prof-nome').value.trim();
  const disciplina = document.getElementById('prof-disciplina').value.trim();
  const email = document.getElementById('prof-email').value.trim();
  const turmasSelecionadas = Array.from(document.querySelectorAll('input[name="prof-turma-check"]:checked'))
    .map(cb => parseInt(cb.value, 10));

  const payload = {
    nome,
    email,
    senha: '12345678',
    status: 'ativo'
  };

  try {
    const res = await fetch(`${API_URL}/professores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(`Erro ao cadastrar professor: ${err.detail || 'Verifique os dados.'}`);
      return;
    }

    const novoProf = await res.json();
    const idNovo = Number(novoProf.id_professor || novoProf.id || Date.now());
    const profObj = { id_professor: idNovo, nome, email, disciplina, status: 'ativo' };

    adminMeta.professores[idNovo] = { nome, email, disciplina, status: 'ativo', turmasIds: turmasSelecionadas };
    if (!adminMeta.listaProfessoresCache) adminMeta.listaProfessoresCache = [];
    adminMeta.listaProfessoresCache.push(profObj);
    saveMeta();

    await sincronizarTurmasDoProfessor(idNovo, turmasSelecionadas);

    await carregarDadosDoBanco();
    e.target.reset();
    closeModal('modal-professor');
  } catch (error) {
    console.error('Erro ao salvar professor:', error);
    alert('Falha na comunicação com o servidor.');
  }
}

function abrirModalVincularTurmas(idProf) {
  const prof = professores.find(p => Number(p.id_professor) === Number(idProf));
  const titulo = document.getElementById('modal-vincular-prof-titulo');
  const inputId = document.getElementById('vincular-prof-id');
  const container = document.getElementById('lista-checkboxes-vincular-turmas');

  if (titulo) titulo.innerText = `🏫 Vincular Turmas — ${prof?.nome || 'Docente'}`;
  if (inputId) inputId.value = idProf;

  if (container) {
    container.innerHTML = turmas.length
      ? turmas.map(t => {
          const jaVinculada = Number(t.id_professor) === Number(idProf);
          return `
            <label class="flex items-center justify-between p-1.5 rounded hover:bg-purple-500/10 cursor-pointer">
              <div class="flex items-center gap-2">
                <input type="checkbox" name="vincular-turma-item" value="${t.id_turma}" ${jaVinculada ? 'checked' : ''} class="accent-purple-700">
                <span class="font-semibold text-main">${t.nome_turma}</span>
              </div>
              <span class="text-[10px] text-muted">${normalizarTurno(t.turno)}</span>
            </label>
          `;
        }).join('')
      : `<p class="text-muted text-center py-4">Nenhuma turma cadastrada.</p>`;
  }

  openModal('modal-vincular-turmas-prof');
}

async function confirmarVinculoTurmasProf(e) {
  e.preventDefault();
  const idProf = parseInt(document.getElementById('vincular-prof-id').value, 10);
  const selecionadas = Array.from(document.querySelectorAll('input[name="vincular-turma-item"]:checked'))
    .map(cb => parseInt(cb.value, 10));

  if (!adminMeta.professores[idProf]) adminMeta.professores[idProf] = {};
  adminMeta.professores[idProf].turmasIds = selecionadas;
  saveMeta();

  await sincronizarTurmasDoProfessor(idProf, selecionadas);

  await carregarDadosDoBanco();
  closeModal('modal-vincular-turmas-prof');
}

async function sincronizarTurmasDoProfessor(idProf, turmasSelecionadas) {
  // 1. Vincula as turmas marcadas
  for (const idTurma of turmasSelecionadas) {
    await vincularTurmaNoBanco(idTurma, idProf);
  }

  // 2. Desvincula as turmas que pertenciam a este professor e foram desmarcadas
  const turmasParaDesvincular = turmas.filter(
    t => Number(t.id_professor) === Number(idProf) && !turmasSelecionadas.includes(Number(t.id_turma))
  );

  for (const t of turmasParaDesvincular) {
    await vincularTurmaNoBanco(t.id_turma, null);
  }
}

async function vincularTurmaNoBanco(idTurma, idProf) {
  const turmaObj = turmas.find(t => Number(t.id_turma) === Number(idTurma));
  if (!turmaObj) return;

  if (idProf !== null) {
    Object.keys(adminMeta.professores).forEach(key => {
      if (Number(key) !== Number(idProf) && Array.isArray(adminMeta.professores[key]?.turmasIds)) {
        adminMeta.professores[key].turmasIds = adminMeta.professores[key].turmasIds.filter(
          id => Number(id) !== Number(idTurma)
        );
      }
    });
    saveMeta();
  }

  const res = await fetch(`${API_URL}/turmas/${idTurma}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_professor: idProf })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert(`Não foi possível atualizar a turma no banco: ${err.detail || 'Erro desconhecido.'}`);
    return;
  }

  turmaObj.id_professor = idProf;
}

async function removerProfessor(idProfessor) {
  if (!confirm('Deseja realmente remover este docente?')) return;

  try {
    const res = await fetch(`${API_URL}/professores/${idProfessor}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.detail || 'Não foi possível remover este professor.');
      return;
    }
    delete adminMeta.professores[idProfessor];
    if (adminMeta.listaProfessoresCache) {
      adminMeta.listaProfessoresCache = adminMeta.listaProfessoresCache.filter(p => Number(p.id_professor) !== Number(idProfessor));
    }
    saveMeta();
    await carregarDadosDoBanco();
  } catch (error) {
    console.error('Erro ao remover professor:', error);
  }
}

// ==========================================
// RELATÓRIOS & INDICADORES DA PLATAFORMA
// ==========================================
function renderRelatorios() {
  const totalAlunosEl = document.getElementById('rel-total-alunos');
  const freqMediaEl = document.getElementById('rel-freq-media');
  const mediaSimuladosEl = document.getElementById('rel-media-simulados');
  const turmasAtencaoEl = document.getElementById('rel-turmas-atencao');

  const totalAlunos = alunos.length;
  const freqMedia = totalAlunos > 0 ? '89,8%' : '0%';
  const mediaGeral = totalAlunos > 0 ? '7,8' : '0,0';
  const turmasSemAlunos = turmas.filter(t => alunos.filter(a => getTurmasIdsDoAluno(a).includes(Number(t.id_turma))).length === 0).length;

  if (totalAlunosEl) totalAlunosEl.innerText = totalAlunos;
  if (freqMediaEl) freqMediaEl.innerText = freqMedia;
  if (mediaSimuladosEl) mediaSimuladosEl.innerText = mediaGeral;
  if (turmasAtencaoEl) turmasAtencaoEl.innerText = turmasSemAlunos;

  const chartMensal = document.getElementById('rel-chart-mensal');
  if (chartMensal) {
    const dadosMeses = [
      { mes: 'Jan', valor: 86, cor: '#10b981' },
      { mes: 'Fev', valor: 88, cor: '#10b981' },
      { mes: 'Mar', valor: 91, cor: '#5b21b6' },
      { mes: 'Abr', valor: 89, cor: '#10b981' },
      { mes: 'Mai', valor: 84, cor: '#f43f5e' },
      { mes: 'Jun', valor: 92, cor: '#10b981' }
    ];

    chartMensal.innerHTML = dadosMeses.map(d => `
      <div class="chart-bar-col">
        <span class="text-[11px] font-bold text-main">${d.valor}%</span>
        <div class="chart-bar-fill" style="height: ${d.valor}px; background-color: ${d.cor};"></div>
        <span class="text-[11px] font-semibold text-muted">${d.mes}</span>
      </div>
    `).join('');
  }

  const chartAreas = document.getElementById('rel-conclusao-areas');
  if (chartAreas) {
    const areas = [
      { nome: 'Matemática & Lógica', pct: 84 },
      { nome: 'Linguagens & Redação', pct: 91 },
      { nome: 'Ciências Humanas', pct: 88 },
      { nome: 'Ciências da Natureza', pct: 79 }
    ];

    chartAreas.innerHTML = areas.map(a => `
      <div>
        <div class="flex justify-between text-xs font-semibold mb-1">
          <span class="text-main">${a.nome}</span>
          <span class="text-purple-600 font-bold">${a.pct}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill bg-[#5b21b6]" style="width: ${a.pct}%;"></div>
        </div>
      </div>
    `).join('');
  }

  const tbodyConsolidado = document.getElementById('tbody-relatorios-turmas');
  if (!tbodyConsolidado) return;

  const busca = (document.getElementById('search-rel-turmas')?.value || '').toLowerCase();
  const turmasFiltradas = turmas.filter(t =>
    (t.nome_turma || '').toLowerCase().includes(busca) ||
    (t.disciplina || '').toLowerCase().includes(busca)
  );

  if (turmasFiltradas.length === 0) {
    tbodyConsolidado.innerHTML = `<tr><td colspan="7" class="text-center py-8 text-muted">Nenhuma turma encontrada para exibição consolidada.</td></tr>`;
    return;
  }

  tbodyConsolidado.innerHTML = turmasFiltradas.map(t => {
    const qtdAlunos = alunos.filter(a => getTurmasIdsDoAluno(a).includes(Number(t.id_turma))).length;
    const freq = qtdAlunos > 0 ? '91,4%' : '0%';
    const atividades = qtdAlunos > 0 ? '88%' : '0%';
    const media = qtdAlunos > 0 ? '7,9' : '-';
    const situacao = qtdAlunos > 0
      ? `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Ótimo Ritmo</span>`
      : `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">Sem Alunos</span>`;

    return `
      <tr>
        <td class="py-3 px-4">
          <div class="font-bold text-main">${t.nome_turma}</div>
          <div class="text-[11px] text-muted">${t.disciplina || ''}</div>
        </td>
        <td class="py-3 px-4 text-main">${normalizarTurno(t.turno)}</td>
        <td class="py-3 px-4 text-main font-semibold">${qtdAlunos} alunos</td>
        <td class="py-3 px-4 text-main">${freq}</td>
        <td class="py-3 px-4 text-main">${atividades}</td>
        <td class="py-3 px-4 font-bold text-purple-600">${media}</td>
        <td class="py-3 px-4 text-right">${situacao}</td>
      </tr>
    `;
  }).join('');
}

function exportarRelatorioCSV() {
  if (turmas.length === 0) {
    alert('Não há dados de turmas para exportar.');
    return;
  }

  const linhas = [
    ['Turma', 'Disciplina', 'Turno', 'Total de Alunos'],
    ...turmas.map(t => [
      t.nome_turma,
      t.disciplina || '',
      normalizarTurno(t.turno),
      alunos.filter(a => getTurmasIdsDoAluno(a).includes(Number(t.id_turma))).length
    ])
  ];

  const csvContent = 'data:text/csv;charset=utf-8,' + linhas.map(e => e.join(';')).join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'relatorio_turmas_techadvisors.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}