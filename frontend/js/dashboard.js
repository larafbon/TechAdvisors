const API_URL = 'http://127.0.0.1:8000';

document.addEventListener('DOMContentLoaded', () => {
  carregarBoletimAluno();
});

function formatarDataBR(dataStr) {
  if (!dataStr) return 'Hoje';
  if (typeof dataStr === 'string' && dataStr.includes('/')) return dataStr;
  const d = new Date(dataStr);
  if (isNaN(d.getTime())) return String(dataStr).split('T')[0];
  return d.toLocaleDateString('pt-BR');
}

function extrairRecursosDaResposta(resp, recursosBanco = [], logsLocais = []) {
  const tags = new Set();

  // 1. Recursos vindos da tabela resposta_recurso do Supabase
  if (Array.isArray(recursosBanco)) {
    recursosBanco.forEach(item => {
      const nomeRec =
        item.recurso_acessibilidade?.nome_recurso ||
        item.recurso_acessibilidade?.nome ||
        item.nome_recurso ||
        item.nome;
      if (nomeRec) tags.add(nomeRec);
    });
  }

  // 2. Recursos gravados na entrega local do aluno
  if (Array.isArray(resp.recursos_locais)) {
    resp.recursos_locais.forEach(r => tags.add(r));
  }

  // 3. Recursos gravados dentro de conteudo_resposta (texto ou JSON)
  if (typeof resp.conteudo_resposta === 'string') {
    const matchApoio = resp.conteudo_resposta.match(/\[Apoio:\s*(.*?)\]/);
    if (matchApoio && matchApoio[1]) {
      matchApoio[1].split(',').forEach(r => {
        if (r.trim()) tags.add(r.trim());
      });
    }

    if (resp.conteudo_resposta.includes('{')) {
      try {
        const parsed = JSON.parse(resp.conteudo_resposta);
        if (Array.isArray(parsed.recursos_usados)) {
          parsed.recursos_usados.forEach(r => tags.add(r));
        }
        if (parsed.perfil_inclusivo && parsed.perfil_inclusivo !== 'padrao') {
          tags.add(`Modo ${parsed.perfil_inclusivo.toUpperCase()}`);
        }
      } catch (e) {}
    }
  }

  // 4. Histórico salvo no localStorage pelo quiz inclusivo
  const logLocal = logsLocais.find(
    l => Number(l.id_atividade) === Number(resp.id_atividade) &&
         (!l.id_aluno || Number(l.id_aluno) === Number(resp.id_aluno))
  );
  if (logLocal && Array.isArray(logLocal.recursos)) {
    logLocal.recursos.forEach(r => tags.add(r));
  }

  return Array.from(tags);
}

async function carregarBoletimAluno() {
  const userString = localStorage.getItem('tech_user');
  if (!userString) {
    window.location.href = 'index.html';
    return;
  }

  const user = JSON.parse(userString);
  const idAluno = Number(user.id_aluno || user.id);

  const tituloEl = document.getElementById('boletim-titulo');
  if (tituloEl && user.nome) {
    tituloEl.innerText = `📊 Notas & Frequência — ${user.nome}`;
  }

  try {
    const [resTurmas, resAtividades, resRespostas] = await Promise.all([
      fetch(`${API_URL}/turmas`).catch(() => ({ ok: false })),
      fetch(`${API_URL}/atividades`).catch(() => ({ ok: false })),
      fetch(`${API_URL}/respostas?id_aluno=${idAluno}`).catch(() => ({ ok: false }))
    ]);

    const rawTurmas = resTurmas.ok ? await resTurmas.json() : [];
    const rawAtividades = resAtividades.ok ? await resAtividades.json() : [];
    const rawRespostas = resRespostas.ok ? await resRespostas.json() : [];

    const turmas = Array.isArray(rawTurmas) ? rawTurmas : (rawTurmas.turmas || rawTurmas.data || []);
    const todasAtividades = Array.isArray(rawAtividades) ? rawAtividades : (rawAtividades.atividades || rawAtividades.data || []);
    const respostasAluno = Array.isArray(rawRespostas) ? rawRespostas : (rawRespostas.respostas || rawRespostas.data || []);

    // Combina respostas do Supabase + entregas salvas localmente pelo aluno
    const storageLocalAluno = JSON.parse(localStorage.getItem(`tech_student_answers_${idAluno}`) || '{}');
    const respostasLocaisArray = Object.entries(storageLocalAluno).flatMap(([idAtv, lista]) =>
      (Array.isArray(lista) ? lista : []).map(item => ({
        id_atividade: Number(idAtv),
        id_aluno: idAluno,
        conteudo_resposta: item.respostaTexto || '',
        data_resposta: item.data || new Date().toISOString(),
        nota: item.nota ?? null,
        recursos_locais: item.recursos || []
      }))
    );

    const respostasCombinadas = [...respostasAluno];
    respostasLocaisArray.forEach(localItem => {
      if (!respostasCombinadas.some(r => Number(r.id_atividade) === Number(localItem.id_atividade))) {
        respostasCombinadas.push(localItem);
      }
    });

    // Descobre todas as turmas vinculadas ao aluno (banco + adminMeta)
    const adminMeta = JSON.parse(localStorage.getItem('tech_admin_meta') || '{}');
    const idsTurmasAluno = new Set();
    if (user.id_turma) idsTurmasAluno.add(Number(user.id_turma));
    const extras = adminMeta.alunos?.[idAluno]?.turmasIds;
    if (Array.isArray(extras)) extras.forEach(id => idsTurmasAluno.add(Number(id)));

    const turmasDoAluno = idsTurmasAluno.size > 0
      ? turmas.filter(t => idsTurmasAluno.has(Number(t.id_turma)))
      : turmas;

    const idsTurmasSet = new Set(turmasDoAluno.map(t => Number(t.id_turma)));
    const atividadesDoAluno = todasAtividades.filter(a => idsTurmasSet.has(Number(a.id_turma)));

    // Busca os recursos inclusivos vinculados a cada resposta no banco
    const recursosPorResposta = {};
    await Promise.all(
      respostasCombinadas.map(async (r) => {
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

    // Enriquecer cada resposta com dados da atividade, disciplina e recursos usados
    const contagemRecursos = {};
    const historicoEnriquecido = respostasCombinadas.map(r => {
      const ativ = todasAtividades.find(a => Number(a.id_atividade) === Number(r.id_atividade)) || {};
      const turma = turmas.find(t => Number(t.id_turma) === Number(ativ.id_turma)) || {};
      const recursos = extrairRecursosDaResposta(r, recursosPorResposta[r.id_resposta], logsLocais);

      recursos.forEach(rec => {
        contagemRecursos[rec] = (contagemRecursos[rec] || 0) + 1;
      });

      return {
        ...r,
        titulo_atividade: ativ.titulo || `Atividade #${r.id_atividade}`,
        disciplina: turma.disciplina || ativ.disciplina || 'Geral',
        nome_turma: turma.nome_turma || 'Turma Principal',
        id_turma: ativ.id_turma,
        recursos
      };
    });

    // ==========================================
    // 1. ATUALIZAR CARDS DE RESUMO
    // ==========================================
    const notasValidas = historicoEnriquecido
      .map(r => r.nota)
      .filter(n => n !== null && n !== undefined && !isNaN(Number(n)))
      .map(Number);

    const mediaGeralEl = document.getElementById('dash-media-geral');
    const mediaStatusEl = document.getElementById('dash-media-status');
    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((acc, val) => acc + val, 0);
      const media = soma / notasValidas.length;
      if (mediaGeralEl) mediaGeralEl.innerText = media.toFixed(1).replace('.', ',');
      if (mediaStatusEl) {
        if (media >= 7) {
          mediaStatusEl.innerText = 'Desempenho Excelente';
          mediaStatusEl.className = 'text-xs text-emerald-600 font-bold mt-1';
        } else if (media >= 6) {
          mediaStatusEl.innerText = 'Na Média Escolar';
          mediaStatusEl.className = 'text-xs text-amber-600 font-bold mt-1';
        } else {
          mediaStatusEl.innerText = 'Atenção: Reforço Recomendado';
          mediaStatusEl.className = 'text-xs text-rose-600 font-bold mt-1';
        }
      }
    } else {
      if (mediaGeralEl) mediaGeralEl.innerText = '--';
      if (mediaStatusEl) {
        mediaStatusEl.innerText = 'Nenhuma nota lançada ainda';
        mediaStatusEl.className = 'text-xs text-slate-400 font-bold mt-1';
      }
    }

    const totalAtiv = Math.max(atividadesDoAluno.length, historicoEnriquecido.length);
    const totalEntregues = new Set(historicoEnriquecido.map(r => Number(r.id_atividade))).size;
    const pendentes = Math.max(0, totalAtiv - totalEntregues);

    const entreguesEl = document.getElementById('dash-entregues');
    const pendentesEl = document.getElementById('dash-pendentes-texto');
    if (entreguesEl) entreguesEl.innerText = `${totalEntregues}/${totalAtiv}`;
    if (pendentesEl) {
      pendentesEl.innerText = pendentes === 0
        ? 'Todas as tarefas em dia!'
        : `${pendentes} atividade(s) pendente(s)`;
    }

    // Recurso inclusivo mais utilizado
    const recursoFavoritoEl = document.getElementById('dash-recurso-favorito');
    const rankingRecursos = Object.entries(contagemRecursos).sort((a, b) => b[1] - a[1]);
    if (recursoFavoritoEl) {
      recursoFavoritoEl.innerText = rankingRecursos.length > 0 ? rankingRecursos[0][0] : 'Modo Padrão';
    }

    // ==========================================
    // 2. TABELA POR DISCIPLINA
    // ==========================================
    const tbodyDisc = document.getElementById('tbody-disciplinas-aluno');
    if (tbodyDisc) {
      if (turmasDoAluno.length === 0 && historicoEnriquecido.length === 0) {
        tbodyDisc.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-400">Nenhuma disciplina vinculada à sua matrícula ainda.</td></tr>`;
      } else {
        const listaBase = turmasDoAluno.length > 0
          ? turmasDoAluno
          : [{ id_turma: 0, nome_turma: 'Geral', disciplina: 'Atividades Gerais' }];

        tbodyDisc.innerHTML = listaBase.map(t => {
          const entregasDaTurma = historicoEnriquecido.filter(r => Number(r.id_turma) === Number(t.id_turma));
          const notasDisc = entregasDaTurma
            .map(r => r.nota)
            .filter(n => n !== null && n !== undefined && !isNaN(Number(n)))
            .map(Number);

          const mediaDisc = notasDisc.length > 0
            ? (notasDisc.reduce((a, b) => a + b, 0) / notasDisc.length).toFixed(1).replace('.', ',')
            : '--';

          let badgeSituacao = `<span class="bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Sem Notas</span>`;
          if (notasDisc.length > 0) {
            const numMedia = notasDisc.reduce((a, b) => a + b, 0) / notasDisc.length;
            badgeSituacao = numMedia >= 6
              ? `<span class="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Aprovado</span>`
              : `<span class="bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full text-[10px]">Em Recuperação</span>`;
          }

          return `
            <tr class="border-b border-slate-100 hover:bg-slate-50">
              <td class="p-3 font-semibold text-slate-800">${t.disciplina || 'Disciplina'}</td>
              <td class="p-3 text-slate-500">${t.nome_turma}</td>
              <td class="p-3 font-semibold">${entregasDaTurma.length} entregue(s)</td>
              <td class="p-3 font-black text-purple-900">${mediaDisc}</td>
              <td class="p-3">96%</td>
              <td class="p-3">${badgeSituacao}</td>
            </tr>
          `;
        }).join('');
      }
    }

    // ==========================================
    // 3. TABELA DE HISTÓRICO + RECURSOS USADOS
    // ==========================================
    const tbodyHist = document.getElementById('tbody-historico-respostas');
    if (tbodyHist) {
      if (historicoEnriquecido.length === 0) {
        tbodyHist.innerHTML = `<tr><td colspan="5" class="p-6 text-center text-slate-400">Você ainda não enviou nenhuma atividade ou quiz.</td></tr>`;
      } else {
        tbodyHist.innerHTML = historicoEnriquecido
          .slice()
          .reverse()
          .map(r => {
            const notaFormatada = (r.nota !== null && r.nota !== undefined)
              ? Number(r.nota).toFixed(1).replace('.', ',')
              : 'Aguardando';

            const notaCor = (r.nota !== null && r.nota !== undefined)
              ? (Number(r.nota) >= 6 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50')
              : 'text-slate-600 bg-slate-100';

            const recursosHtml = r.recursos.length > 0
              ? `<div class="flex flex-wrap gap-1">${r.recursos.map(rec =>
                  `<span class="bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full text-[10px]">✨ ${rec}</span>`
                ).join('')}</div>`
              : `<span class="text-slate-400 text-[11px]">Modo Padrão</span>`;

            return `
              <tr class="border-b border-slate-100 hover:bg-slate-50">
                <td class="p-3 font-bold text-slate-800">${r.titulo_atividade}</td>
                <td class="p-3 text-slate-600">${r.disciplina}</td>
                <td class="p-3 text-slate-500">${formatarDataBR(r.data_resposta)}</td>
                <td class="p-3">${recursosHtml}</td>
                <td class="p-3 text-right">
                  <span class="font-black px-2.5 py-1 rounded-lg ${notaCor}">${notaFormatada}</span>
                </td>
              </tr>
            `;
          }).join('');
      }
    }
  } catch (error) {
    console.error('Erro ao carregar boletim do aluno:', error);
  }
}