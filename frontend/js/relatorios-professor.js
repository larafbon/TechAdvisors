const API_URL = 'http://127.0.0.1:8000';

window.relatorioCache = {
  turmas: [],
  alunos: [],
  atividades: [],
  entregas: [],
  entregasFiltradas: []
};

const DICIONARIO_SUGESTOES_RECURSOS = {
  'Autismo (TEA)': 'Mantenha roteiros visuais claros, instruções diretas em etapas e evite limites de tempo rígidos nas avaliações.',
  'TDAH (Hiperfoco)': 'Destaque palavras-chave nos enunciados e divida tarefas longas em blocos curtos para sustentar o foco.',
  'Dislexia': 'Priorize textos com espaçamento amplo, fontes limpas, apoio de leitura em voz alta (TTS) e evite blocos densos de texto.',
  'Fonte para Dislexia': 'A tipografia adaptada melhorou a legibilidade; mantenha textos com alinhamento à esquerda e espaçamento entre linhas.',
  'Linguagem Simplificada': 'Enunciados objetivos e diretos facilitaram a compreensão; evite períodos muito longos ou dupla negação.',
  'Leitura Biônica': 'O destaque visual do início das palavras acelerou a leitura dos alunos; aplique negrito estratégico nos termos centrais.',
  'Divisão Silábica': 'A segmentação silábica auxiliou na decodificação; disponibilize glossários e textos adaptados previamente.',
  'Régua de Leitura': 'O guia visual de linha reduziu erros de leitura; evite tabelas muito extensas sem alternância de cor.',
  'Sem Cronômetro': 'Remover a pressão do tempo elevou o acerto; considere avaliações assíncronas ou tempo estendido para a turma.',
  'Confirmação em 2 Cliques': 'A confirmação dupla reduziu respostas impulsivas; incentive a revisão antes da entrega final.',
  'Papel Creme': 'O fundo de baixo contraste visual reduziu a fadiga ocular; evite fundos brancos brilhantes em materiais PDF.',
  'Perfil Personalizado': 'O estudante ajustou manualmente as configurações visuais (fonte, contraste ou ritmo) para suas necessidades individuais.'
};

document.addEventListener('DOMContentLoaded', () => {
  inicializarRelatorioProfessor();
});

function formatarNomeRecurso(nome) {
  if (!nome) return '';
  const limpo = String(nome).trim();
  if (limpo.toUpperCase() === 'CUSTOM' || limpo.toUpperCase() === 'MODO CUSTOM') {
    return 'Perfil Personalizado';
  }
  return limpo;
}

function extrairRecursosItem(resp, recursosBanco = [], logsLocais = []) {
  const tags = new Set();

  if (Array.isArray(recursosBanco)) {
    recursosBanco.forEach(item => {
      const nomeRec =
        item.recurso_acessibilidade?.nome_recurso ||
        item.recurso_acessibilidade?.nome ||
        item.nome_recurso ||
        item.nome;
      if (nomeRec) tags.add(formatarNomeRecurso(nomeRec));
    });
  }

  if (Array.isArray(resp.recursos_locais)) {
    resp.recursos_locais.forEach(r => {
      if (r) tags.add(formatarNomeRecurso(r));
    });
  }

  if (typeof resp.conteudo_resposta === 'string') {
    const matchApoio = resp.conteudo_resposta.match(/\[Apoio:\s*(.*?)\]/);
    if (matchApoio && matchApoio[1]) {
      matchApoio[1].split(',').forEach(r => {
        if (r.trim()) tags.add(formatarNomeRecurso(r));
      });
    }
  }

  const logLocal = logsLocais.find(
    l => Number(l.id_atividade) === Number(resp.id_atividade) &&
         Number(l.id_aluno) === Number(resp.id_aluno)
  );
  if (logLocal && Array.isArray(logLocal.recursos)) {
    logLocal.recursos.forEach(r => {
      if (r) tags.add(formatarNomeRecurso(r));
    });
  }

  return Array.from(tags);
}

async function inicializarRelatorioProfessor() {
  const userString = localStorage.getItem('tech_user') || localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : {};
  const idProfessor = Number(user.id_professor || user.id || 0);

  const tituloEl = document.getElementById('relatorio-prof-titulo');
  if (tituloEl && user.nome) {
    const nomeLimpo = user.nome.replace(/^Prof\.\s*/i, '');
    tituloEl.innerText = `📊 Relatórios & Notas — Prof. ${nomeLimpo}`;
  }

  try {
    const [resTurmas, resAlunos, resAtividades, resRespostas] = await Promise.all([
      fetch(`${API_URL}/turmas`).catch(() => ({ ok: false })),
      fetch(`${API_URL}/alunos`).catch(() => ({ ok: false })),
      fetch(`${API_URL}/atividades`).catch(() => ({ ok: false })),
      fetch(`${API_URL}/respostas`).catch(() => ({ ok: false }))
    ]);

    const rawTurmas = resTurmas.ok ? await resTurmas.json() : [];
    const rawAlunos = resAlunos.ok ? await resAlunos.json() : [];
    const rawAtividades = resAtividades.ok ? await resAtividades.json() : [];
    const rawRespostas = resRespostas.ok ? await resRespostas.json() : [];

    const todasTurmas = Array.isArray(rawTurmas) ? rawTurmas : (rawTurmas.turmas || rawTurmas.data || []);
    const todosAlunos = Array.isArray(rawAlunos) ? rawAlunos : (rawAlunos.alunos || rawAlunos.data || []);
    const todasAtividades = Array.isArray(rawAtividades) ? rawAtividades : (rawAtividades.atividades || rawAtividades.data || []);
    const todasRespostas = Array.isArray(rawRespostas) ? rawRespostas : (rawRespostas.respostas || rawRespostas.data || []);

    // Filtra apenas as turmas vinculadas ao professor (banco + adminMeta)
    const adminMeta = JSON.parse(localStorage.getItem('tech_admin_meta') || '{}');
    const extrasProf = adminMeta.professores?.[idProfessor]?.turmasIds || [];
    const turmasProf = idProfessor > 0
      ? todasTurmas.filter(t =>
          Number(t.id_professor) === idProfessor ||
          extrasProf.map(Number).includes(Number(t.id_turma))
        )
      : todasTurmas;

    const turmasAtivas = turmasProf.length > 0 ? turmasProf : todasTurmas;
    window.relatorioCache.turmas = turmasAtivas;
    window.relatorioCache.alunos = todosAlunos;
    window.relatorioCache.atividades = todasAtividades;

    // Preenche o seletor de turmas
    const selectTurma = document.getElementById('filtro-turma-relatorio');
    if (selectTurma) {
      selectTurma.innerHTML = `<option value="ALL">Todas as Minhas Turmas (${turmasAtivas.length})</option>` +
        turmasAtivas.map(t => `<option value="${t.id_turma}">${t.nome_turma} — ${t.disciplina || 'Geral'}</option>`).join('');
    }

    // Busca os recursos vinculados no banco (/resposta-recurso/{id_resposta})
    const recursosPorResposta = {};
    await Promise.all(
      todasRespostas.map(async (r) => {
        if (!r.id_resposta) return;
        try {
          const resRec = await fetch(`${API_URL}/resposta-recurso/${r.id_resposta}`);
          if (resRec.ok) {
            recursosPorResposta[r.id_resposta] = await resRec.json();
          }
        } catch (e) {}
      })
    );

    const logsLocais = JSON.parse(localStorage.getItem('tech_quiz_recursos_log') || '[]');

    // Enriquecer todas as respostas
    window.relatorioCache.entregas = todasRespostas.map(r => {
      const aluno = todosAlunos.find(a => Number(a.id_aluno) === Number(r.id_aluno)) || {};
      const ativ = todasAtividades.find(a => Number(a.id_atividade) === Number(r.id_atividade)) || {};
      const idTurmaFinal = Number(ativ.id_turma || aluno.id_turma || 0);
      const turma = todasTurmas.find(t => Number(t.id_turma) === idTurmaFinal) || {};
      const recursos = extrairRecursosItem(r, recursosPorResposta[r.id_resposta], logsLocais);
      const textoLimpo = (r.conteudo_resposta || '').split('|||ANEXO_ALUNO|||')[0];

      return {
        ...r,
        nome_aluno: aluno.nome || `Aluno #${r.id_aluno}`,
        titulo_atividade: ativ.titulo || `Atividade #${r.id_atividade}`,
        id_turma: idTurmaFinal,
        nome_turma: turma.nome_turma || 'Turma Geral',
        disciplina: turma.disciplina || 'Geral',
        texto_limpo: textoLimpo,
        recursos
      };
    });

    renderizarRelatorioProfessor();
  } catch (err) {
    console.error('Erro ao carregar relatório do professor:', err);
  }
}

window.renderizarRelatorioProfessor = function() {
  const filtroTurma = document.getElementById('filtro-turma-relatorio')?.value || 'ALL';
  const idsTurmasProf = new Set(window.relatorioCache.turmas.map(t => Number(t.id_turma)));

  const entregasEscopo = window.relatorioCache.entregas.filter(e => {
    if (filtroTurma !== 'ALL') {
      return Number(e.id_turma) === Number(filtroTurma);
    }
    return idsTurmasProf.size === 0 || idsTurmasProf.has(Number(e.id_turma)) || e.id_turma === 0;
  });

  window.relatorioCache.entregasFiltradas = entregasEscopo;

  // ==========================================
  // 1. ATUALIZAR KPIs DO TOPO
  // ==========================================
  const notasValidas = entregasEscopo
    .map(e => e.nota)
    .filter(n => n !== null && n !== undefined && !isNaN(Number(n)))
    .map(Number);

  const mediaEl = document.getElementById('prof-kpi-media');
  const mediaSubEl = document.getElementById('prof-kpi-media-sub');
  const aprovEl = document.getElementById('prof-kpi-aprovacao');

  if (notasValidas.length > 0) {
    const media = notasValidas.reduce((a, b) => a + b, 0) / notasValidas.length;
    const aprovados = notasValidas.filter(n => n >= 6).length;
    const taxaAprov = Math.round((aprovados / notasValidas.length) * 100);

    if (mediaEl) mediaEl.innerText = media.toFixed(1).replace('.', ',');
    if (mediaSubEl) mediaSubEl.innerText = `${notasValidas.length} avaliação(ões) com nota`;
    if (aprovEl) aprovEl.innerText = `${taxaAprov}%`;
  } else {
    if (mediaEl) mediaEl.innerText = '--';
    if (mediaSubEl) mediaSubEl.innerText = 'Nenhuma nota lançada';
    if (aprovEl) aprovEl.innerText = '--';
  }

  const pendentesCorrecao = entregasEscopo.filter(e => e.nota === null || e.nota === undefined).length;
  const entregasEl = document.getElementById('prof-kpi-entregas');
  const pendSubEl = document.getElementById('prof-kpi-pendentes-correcao');
  if (entregasEl) entregasEl.innerText = entregasEscopo.length;
  if (pendSubEl) {
    pendSubEl.innerText = pendentesCorrecao > 0
      ? `${pendentesCorrecao} aguardando correção`
      : 'Todas corrigidas!';
  }

  // ==========================================
  // 2. MOTOR DE SUGESTÕES INCLUSIVAS
  // ==========================================
  gerarSugestoesPedagogicas(entregasEscopo);

  // ==========================================
  // 3. TABELA CONSOLIDADA POR ALUNO
  // ==========================================
  renderizarTabelaBoletimAlunos(entregasEscopo, filtroTurma);

  // ==========================================
  // 4. TABELA DE ENTREGAS COM EDIÇÃO DE NOTA
  // ==========================================
  renderizarTabelaEntregas(entregasEscopo);
};

function gerarSugestoesPedagogicas(entregas) {
  const container = document.getElementById('container-sugestoes-professor');
  const kpiRecEl = document.getElementById('prof-kpi-recurso');
  const kpiRecMediaEl = document.getElementById('prof-kpi-recurso-media');
  if (!container) return;

  const statsPorRecurso = {};
  const alunosSemRecursoComNotaBaixa = new Set();

  entregas.forEach(e => {
    const temNota = e.nota !== null && e.nota !== undefined && !isNaN(Number(e.nota));
    const notaNum = temNota ? Number(e.nota) : null;

    if (e.recursos.length === 0 && temNota && notaNum < 6) {
      alunosSemRecursoComNotaBaixa.add(e.nome_aluno);
    }

    e.recursos.forEach(rec => {
      if (!statsPorRecurso[rec]) {
        statsPorRecurso[rec] = { usos: 0, somaNotas: 0, qtdNotas: 0 };
      }
      statsPorRecurso[rec].usos++;
      if (temNota) {
        statsPorRecurso[rec].somaNotas += notaNum;
        statsPorRecurso[rec].qtdNotas++;
      }
    });
  });

  const ranking = Object.entries(statsPorRecurso)
    .map(([nome, s]) => ({
      nome,
      usos: s.usos,
      media: s.qtdNotas > 0 ? s.somaNotas / s.qtdNotas : null
    }))
    .sort((a, b) => (b.media ?? 0) - (a.media ?? 0) || b.usos - a.usos);

  if (kpiRecEl && kpiRecMediaEl) {
    if (ranking.length > 0) {
      kpiRecEl.innerText = ranking[0].nome;
      kpiRecMediaEl.innerText = ranking[0].media !== null
        ? `Média ${ranking[0].media.toFixed(1).replace('.', ',')} (${ranking[0].usos} uso${ranking[0].usos > 1 ? 's' : ''})`
        : `${ranking[0].usos} uso(s) registrado(s)`;
    } else {
      kpiRecEl.innerText = 'Modo Padrão';
      kpiRecMediaEl.innerText = 'Nenhum recurso ativado ainda';
    }
  }

  const cardsSugestoes = [];

  ranking.slice(0, 3).forEach(item => {
    const dicaPedagogica = DICIONARIO_SUGESTOES_RECURSOS[item.nome] ||
      'Este recurso apresentou boa adesão dos estudantes. Considere manter materiais adaptados compatíveis com essa preferência.';
    const badgeMedia = item.media !== null
      ? `<span class="bg-emerald-100 text-emerald-800 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">Média: ${item.media.toFixed(1).replace('.', ',')}</span>`
      : `<span class="bg-purple-100 text-purple-800 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">${item.usos} uso(s)</span>`;

    cardsSugestoes.push(`
      <div class="bg-white p-4 rounded-2xl border border-purple-100 shadow-sm space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-extrabold text-purple-900">✨ Recurso: ${item.nome}</span>
          ${badgeMedia}
        </div>
        <p class="text-xs text-slate-600 leading-relaxed">${dicaPedagogica}</p>
      </div>
    `);
  });

  if (alunosSemRecursoComNotaBaixa.size > 0) {
    const listaNomes = Array.from(alunosSemRecursoComNotaBaixa).join(', ');
    cardsSugestoes.push(`
      <div class="bg-amber-50/90 p-4 rounded-2xl border border-amber-200 shadow-sm space-y-1.5">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs font-extrabold text-amber-900">⚠️ Oportunidade de Apoio Inclusivo</span>
          <span class="bg-amber-200 text-amber-950 font-extrabold px-2.5 py-0.5 rounded-full text-[10px]">Atenção</span>
        </div>
        <p class="text-xs text-amber-900 leading-relaxed">
          <strong>${listaNomes}</strong> obteve(iveram) nota abaixo de 6,0 no Modo Padrão. Recomende testar os modos <strong>TDAH (Leitura Biônica)</strong>, <strong>Dislexia</strong> ou <strong>Sem Cronômetro</strong> na próxima atividade.
        </p>
      </div>
    `);
  }

  if (cardsSugestoes.length === 0) {
    container.innerHTML = `
      <div class="bg-white p-4 rounded-2xl border border-purple-100 text-xs text-slate-500 md:col-span-2">
        Assim que os alunos realizarem quizzes e ativarem os recursos inclusivos (TEA, TDAH, Dislexia, Leitura Biônica, Voz TTS), as recomendações pedagógicas aparecerão automaticamente aqui.
      </div>
    `;
  } else {
    container.innerHTML = cardsSugestoes.join('');
  }
}

function renderizarTabelaBoletimAlunos(entregas, filtroTurma) {
  const tbody = document.getElementById('tbody-boletim-alunos-prof');
  if (!tbody) return;

  const idsTurmasEscopo = filtroTurma !== 'ALL'
    ? new Set([Number(filtroTurma)])
    : new Set(window.relatorioCache.turmas.map(t => Number(t.id_turma)));

  const alunosEscopo = window.relatorioCache.alunos.filter(a =>
    idsTurmasEscopo.size === 0 || idsTurmasEscopo.has(Number(a.id_turma))
  );

  const mapaAlunos = new Map();
  alunosEscopo.forEach(a => {
    const turma = window.relatorioCache.turmas.find(t => Number(t.id_turma) === Number(a.id_turma)) || {};
    mapaAlunos.set(Number(a.id_aluno), {
      id_aluno: Number(a.id_aluno),
      nome: a.nome,
      turma: turma.nome_turma || 'Turma Principal',
      entregas: [],
      recursos: new Set()
    });
  });

  entregas.forEach(e => {
    const idAl = Number(e.id_aluno);
    if (!mapaAlunos.has(idAl)) {
      mapaAlunos.set(idAl, {
        id_aluno: idAl,
        nome: e.nome_aluno,
        turma: e.nome_turma,
        entregas: [],
        recursos: new Set()
      });
    }
    const reg = mapaAlunos.get(idAl);
    reg.entregas.push(e);
    e.recursos.forEach(r => reg.recursos.add(r));
  });

  const listaConsolidada = Array.from(mapaAlunos.values());

  if (listaConsolidada.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Nenhum aluno encontrado nesta turma.</td></tr>`;
    return;
  }

  tbody.innerHTML = listaConsolidada.map(al => {
    const notas = al.entregas
      .map(e => e.nota)
      .filter(n => n !== null && n !== undefined && !isNaN(Number(n)))
      .map(Number);

    const media = notas.length > 0
      ? (notas.reduce((a, b) => a + b, 0) / notas.length)
      : null;

    const recursosArr = Array.from(al.recursos);
    const recursosHtml = recursosArr.length > 0
      ? `<div class="flex flex-wrap gap-1">${recursosArr.map(r => `<span class="bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">✨ ${r}</span>`).join('')}</div>`
      : `<span class="text-slate-400 text-[11px]">Modo Padrão</span>`;

    let badgeStatus = `<span class="bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Sem Notas</span>`;
    if (media !== null) {
      badgeStatus = media >= 6
        ? `<span class="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Na Média</span>`
        : `<span class="bg-rose-100 text-rose-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Abaixo da Média</span>`;
    }

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50">
        <td class="p-3 font-bold text-slate-800">${al.nome}</td>
        <td class="p-3 text-slate-500">${al.turma}</td>
        <td class="p-3 font-semibold">${al.entregas.length}</td>
        <td class="p-3">${recursosHtml}</td>
        <td class="p-3 font-black text-purple-900">${media !== null ? media.toFixed(1).replace('.', ',') : '--'}</td>
        <td class="p-3">${badgeStatus}</td>
      </tr>
    `;
  }).join('');
}

function renderizarTabelaEntregas(entregas) {
  const tbody = document.getElementById('tbody-entregas-professor');
  if (!tbody) return;

  if (entregas.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Nenhuma entrega registrada para este filtro.</td></tr>`;
    return;
  }

  tbody.innerHTML = entregas
    .slice()
    .reverse()
    .map(e => {
      const recursosHtml = e.recursos.length > 0
        ? `<div class="flex flex-wrap gap-1">${e.recursos.map(r => `<span class="bg-indigo-100 text-indigo-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">✨ ${r}</span>`).join('')}</div>`
        : `<span class="text-slate-400 text-[11px]">Padrão</span>`;

      const valorNota = (e.nota !== null && e.nota !== undefined) ? e.nota : '';

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50">
          <td class="p-3 font-bold text-slate-800">${e.nome_aluno}</td>
          <td class="p-3 font-semibold text-purple-900">${e.titulo_atividade}</td>
          <td class="p-3 text-slate-600 max-w-xs truncate" title="${e.texto_limpo}">${e.texto_limpo}</td>
          <td class="p-3">${recursosHtml}</td>
          <td class="p-3">
            <input type="number" id="input-nota-${e.id_resposta}" min="0" max="10" step="0.1" value="${valorNota}" placeholder="0.0" class="w-20 px-2.5 py-1.5 text-xs font-bold text-purple-950 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600">
          </td>
          <td class="p-3 text-right">
            <button type="button" onclick="salvarNotaProfessor(${e.id_resposta})" class="bg-[#5b21b6] hover:bg-purple-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition cursor-pointer">
              💾 Salvar Nota
            </button>
          </td>
        </tr>
      `;
    }).join('');
}

window.salvarNotaProfessor = async function(idResposta) {
  const input = document.getElementById(`input-nota-${idResposta}`);
  if (!input) return;

  const valorStr = input.value.trim();
  if (valorStr === '') {
    alert('Digite uma nota entre 0 e 10 antes de salvar.');
    return;
  }

  const notaNum = Number(valorStr);
  if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
    alert('A nota deve ser um número entre 0 e 10.');
    return;
  }

  const entrega = window.relatorioCache.entregas.find(e => Number(e.id_resposta) === Number(idResposta));
  if (!entrega) return;

  try {
    const res = await fetch(`${API_URL}/respostas/${idResposta}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conteudo_resposta: entrega.conteudo_resposta,
        id_aluno: Number(entrega.id_aluno),
        id_atividade: Number(entrega.id_atividade),
        data_resposta: entrega.data_resposta || new Date().toISOString(),
        nota: notaNum
      })
    });

    if (res.ok) {
      entrega.nota = notaNum;
      alert(`✅ Nota ${notaNum.toFixed(1).replace('.', ',')} salva com sucesso para ${entrega.nome_aluno}!`);
      window.renderizarRelatorioProfessor();
    } else {
      alert('⚠️ Não foi possível atualizar a nota no servidor.');
    }
  } catch (err) {
    console.error('Erro ao salvar nota:', err);
    alert('⚠️ Falha de conexão com o servidor FastAPI.');
  }
};

window.exportarRelatorioCSV = function() {
  const lista = window.relatorioCache.entregasFiltradas || [];
  if (lista.length === 0) {
    alert('Não há dados disponíveis para exportar no filtro atual.');
    return;
  }

  const cabecalho = ['Aluno', 'Turma', 'Atividade', 'Recursos Inclusivos Utilizados', 'Nota'];
  const linhas = lista.map(e => [
    `"${(e.nome_aluno || '').replace(/"/g, '""')}"`,
    `"${(e.nome_turma || '').replace(/"/g, '""')}"`,
    `"${(e.titulo_atividade || '').replace(/"/g, '""')}"`,
    `"${(e.recursos.join(', ') || 'Modo Padrão').replace(/"/g, '""')}"`,
    e.nota !== null && e.nota !== undefined ? String(e.nota).replace('.', ',') : 'Pendente'
  ].join(';'));

  const csvContent = '\uFEFF' + [cabecalho.join(';'), ...linhas].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio_notas_techadvisors_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};