const API_URL = 'http://127.0.0.1:8000';

window.iaEntregasCache = [];

document.addEventListener('DOMContentLoaded', () => {
  carregarDadosIniciaisIA();
});

async function carregarDadosIniciaisIA() {
  try {
    const [resTurmas, resAlunos, resAtividades, resRespostas] = await Promise.all([
      fetch(`${API_URL}/turmas`).catch(() => ({ ok: false })),
      fetch(`${API_URL}/alunos`).catch(() => ({ ok: false })),
      fetch(`${API_URL}/atividades`).catch(() => ({ ok: false })),
      fetch(`${API_URL}/respostas`).catch(() => ({ ok: false }))
    ]);

    const turmas = resTurmas.ok ? await resTurmas.json() : [];
    const alunos = resAlunos.ok ? await resAlunos.json() : [];
    const atividades = resAtividades.ok ? await resAtividades.json() : [];
    const respostas = resRespostas.ok ? await resRespostas.json() : [];

    // Preenche disciplinas reais no seletor de plano de aula
    const selDisc = document.getElementById('ia-plano-disciplina');
    if (selDisc && Array.isArray(turmas) && turmas.length > 0) {
      selDisc.innerHTML = turmas.map(t =>
        `<option value="${t.disciplina || t.nome_turma}">${t.nome_turma} — ${t.disciplina || 'Geral'}</option>`
      ).join('');
    }

    // Enriquece entregas para o seletor de análise IA
    window.iaEntregasCache = (Array.isArray(respostas) ? respostas : []).map(r => {
      const aluno = (Array.isArray(alunos) ? alunos : []).find(a => Number(a.id_aluno) === Number(r.id_aluno)) || {};
      const ativ = (Array.isArray(atividades) ? atividades : []).find(a => Number(a.id_atividade) === Number(r.id_atividade)) || {};
      const textoLimpo = (r.conteudo_resposta || '').split('|||ANEXO_ALUNO|||')[0];
      return {
        ...r,
        nome_aluno: aluno.nome || `Aluno #${r.id_aluno}`,
        titulo_atividade: ativ.titulo || `Atividade #${r.id_atividade}`,
        texto_limpo: textoLimpo
      };
    });

    const selResp = document.getElementById('ia-select-resposta');
    if (selResp) {
      if (window.iaEntregasCache.length === 0) {
        selResp.innerHTML = `<option value="">Nenhuma entrega registrada ainda</option>`;
      } else {
        selResp.innerHTML = `<option value="">Selecione uma entrega para analisar...</option>` +
          window.iaEntregasCache.map(e => {
            const notaTxt = (e.nota !== null && e.nota !== undefined) ? `Nota: ${e.nota}` : 'Sem nota';
            return `<option value="${e.id_resposta}">${e.nome_aluno} • ${e.titulo_atividade} (${notaTxt})</option>`;
          }).join('');
      }
    }
  } catch (err) {
    console.error('Erro ao carregar dados do Assistente IA:', err);
  }
}

window.carregarHistoricoAnaliseResposta = async function() {
  const idResp = document.getElementById('ia-select-resposta')?.value;
  const box = document.getElementById('ia-resultado-aluno-box');
  if (!idResp || !box) {
    if (box) box.classList.add('hidden');
    return;
  }

  try {
    const res = await fetch(`${API_URL}/analise-ia/resposta/${idResp}`);
    if (res.ok) {
      const lista = await res.json();
      if (Array.isArray(lista) && lista.length > 0) {
        const ultima = lista[lista.length - 1];
        box.classList.remove('hidden');
        box.innerHTML = `
          <div class="flex items-center justify-between flex-wrap gap-2">
            <span class="text-xs font-extrabold text-purple-900">📌 Análise Registrada no Banco (${ultima.modelo_utilizado})</span>
            <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">Salvo no Supabase</span>
          </div>
          <p class="text-xs text-slate-800 leading-relaxed"><strong>Diagnóstico:</strong> ${ultima.resultado}</p>
          ${ultima.sugestoes ? `<p class="text-xs text-purple-950 bg-white p-3 rounded-xl border border-purple-100"><strong>💡 Sugestão Pedagógica:</strong> ${ultima.sugestoes}</p>` : ''}
        `;
      } else {
        box.classList.add('hidden');
      }
    }
  } catch (e) {}
};

window.gerarESalvarAnaliseAluno = async function() {
  const idResp = document.getElementById('ia-select-resposta')?.value;
  const box = document.getElementById('ia-resultado-aluno-box');
  if (!idResp) {
    alert('Selecione primeiro uma entrega de aluno na lista.');
    return;
  }

  const entrega = window.iaEntregasCache.find(e => Number(e.id_resposta) === Number(idResp));
  if (!entrega) return;

  const nota = entrega.nota !== null && entrega.nota !== undefined ? Number(entrega.nota) : null;
  const matchApoio = entrega.texto_limpo.match(/\[Apoio:\s*(.*?)\]/);
  const recursoUsado = matchApoio ? matchApoio[1] : 'Modo Padrão';

  let diagnostico = '';
  let sugestao = '';

  if (nota !== null && nota >= 8) {
    diagnostico = `O(a) estudante ${entrega.nome_aluno} demonstrou excelente domínio na atividade "${entrega.titulo_atividade}" (Nota ${nota.toFixed(1).replace('.', ',')}), utilizando ${recursoUsado}.`;
    sugestao = `Manter a disponibilidade de ${recursoUsado} nas próximas avaliações e propor desafios progressivos com enunciados claros.`;
  } else if (nota !== null && nota >= 6) {
    diagnostico = `Desempenho satisfatório de ${entrega.nome_aluno} (Nota ${nota.toFixed(1).replace('.', ',')}) com apoio de ${recursoUsado}, indicando boa compreensão geral com pequenos pontos de atenção.`;
    sugestao = `Reforçar os conceitos principais com mapas visuais curtos e permitir tempo estendido ou revisão guiada antes da entrega.`;
  } else if (nota !== null) {
    diagnostico = `${entrega.nome_aluno} apresentou dificuldade nesta entrega (Nota ${nota.toFixed(1).replace('.', ',')}) utilizando ${recursoUsado}.`;
    sugestao = `Aplicar atividade de recuperação segmentada em etapas menores, ativando Leitura em Voz Alta (TTS), Divisão Silábica ou Modo TEA sem cronômetro.`;
  } else {
    diagnostico = `Entrega de ${entrega.nome_aluno} registrada (${recursoUsado}) e aguardando atribuição de nota pelo docente.`;
    sugestao = `Avaliar o conteúdo considerando a clareza conceitual e o recurso de acessibilidade escolhido pelo estudante.`;
  }

  try {
    const res = await fetch(`${API_URL}/analise-ia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelo_utilizado: 'Techadvisors-Inclusao-v1',
        id_resposta: Number(idResp),
        resultado: diagnostico,
        sugestoes: sugestao,
        data_analise: new Date().toISOString()
      })
    });

    if (res.ok) {
      box.classList.remove('hidden');
      box.innerHTML = `
        <div class="flex items-center justify-between flex-wrap gap-2">
          <span class="text-xs font-extrabold text-purple-900">✅ Nova Análise Gerada e Salva!</span>
          <span class="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">Gravado em analise_ia</span>
        </div>
        <p class="text-xs text-slate-800 leading-relaxed"><strong>Diagnóstico:</strong> ${diagnostico}</p>
        <p class="text-xs text-purple-950 bg-white p-3 rounded-xl border border-purple-100"><strong>💡 Sugestão Pedagógica:</strong> ${sugestao}</p>
      `;
    } else {
      alert('Não foi possível salvar a análise no servidor FastAPI.');
    }
  } catch (err) {
    console.error('Erro ao salvar análise IA:', err);
    alert('Falha de comunicação com o servidor.');
  }
};

window.adaptarTextoInclusivo = function() {
  const perfil = document.getElementById('ia-perfil-adaptacao')?.value || 'TEA';
  const textoOriginal = document.getElementById('ia-texto-original')?.value.trim();
  const box = document.getElementById('ia-texto-adaptado-box');
  const saida = document.getElementById('ia-texto-adaptado-saida');

  if (!textoOriginal) {
    alert('Cole ou digite um texto/enunciado para adaptar.');
    return;
  }

  let htmlAdaptado = '';

  if (perfil === 'TEA') {
    const frases = textoOriginal.split(/[.!?]+/).map(f => f.trim()).filter(Boolean);
    htmlAdaptado = `
      <p class="font-bold text-purple-900 mb-2">🧩 Roteiro Objetivo em Etapas (Sem Cronômetro):</p>
      <ol class="list-decimal pl-5 space-y-1.5">
        ${frases.map(f => `<li>${f}.</li>`).join('')}
      </ol>
      <p class="mt-3 text-[11px] text-slate-500"><strong>Instrução Final:</strong> Leia cada item com calma e selecione apenas uma resposta antes de confirmar.</p>
    `;
  } else if (perfil === 'TDAH') {
    const kwRegex = /^(não|nunca|exceto|incorreta|correta|falso|verdadeiro|calcule|identifique|assinale|principal|menor|maior|apenas|somente|sempre)$/i;
    const bionico = textoOriginal.split(/(\s+)/).map(tok => {
      if (/^\s+$/.test(tok)) return tok;
      const m = tok.match(/^([^\wÀ-ÿ]*)([\wÀ-ÿ-]+)([^\wÀ-ÿ]*)$/);
      if (!m) return tok;
      const [, pre, nuc, suf] = m;
      if (kwRegex.test(nuc)) {
        return `${pre}<mark class="bg-amber-200 text-amber-950 font-extrabold px-1 rounded">${nuc.toUpperCase()}</mark>${suf}`;
      }
      const corte = Math.ceil(nuc.length * 0.42);
      return `${pre}<strong>${nuc.slice(0, corte)}</strong>${nuc.slice(corte)}${suf}`;
    }).join('');

    htmlAdaptado = `
      <p class="font-bold text-indigo-900 mb-2">⚡ Foco Guiado (Leitura Biônica + Palavras-Chave):</p>
      <p class="leading-relaxed">${bionico}</p>
    `;
  } else {
    const silabico = textoOriginal.split(/(\s+)/).map(tok => {
      if (/^\s+$/.test(tok) || tok.length <= 4) return tok;
      return tok
        .replace(/([^aeiouáéíóúâêôãõü])([aeiouáéíóúâêôãõü])/gi, '·$1$2')
        .replace(/^·/, '')
        .replace(/([aeiouáéíóúâêôãõü])([bcdfgjklmnpqrstvwxz])([bcdfgjklmnpqrstvwxz])/gi, '$1$2·$3');
    }).join('');

    htmlAdaptado = `
      <div class="bg-[#fdf6e3] p-3 rounded-xl border border-amber-200 tracking-wide leading-loose">
        <p class="font-bold text-amber-950 mb-1">📖 Apoio Fonológico (Papel Creme + Divisão Silábica):</p>
        <p>${silabico}</p>
      </div>
    `;
  }

  if (saida && box) {
    saida.innerHTML = htmlAdaptado;
    box.classList.remove('hidden');
  }
};

window.copiarTextoAdaptado = function() {
  const texto = document.getElementById('ia-texto-adaptado-saida')?.innerText || '';
  if (!texto) return;
  navigator.clipboard.writeText(texto);
  alert('📋 Texto adaptado copiado para a área de transferência!');
};

window.gerarPlanoDeAulaInclusivo = function() {
  const disciplina = document.getElementById('ia-plano-disciplina')?.value || 'Disciplina';
  const tema = document.getElementById('ia-plano-tema')?.value.trim();
  const box = document.getElementById('ia-plano-aula-box');
  const saida = document.getElementById('ia-plano-aula-saida');

  if (!tema) {
    alert('Digite o tema da aula para gerar o roteiro inclusivo.');
    return;
  }

  if (saida && box) {
    saida.innerHTML = `
      <p class="font-extrabold text-emerald-900 text-sm">Plano de Aula: ${tema} (${disciplina})</p>
      <p><strong>1. Abertura Previsível (0–10 min • Apoio TEA):</strong> Apresentar no quadro a agenda visual da aula em 3 tópicos objetivos e revisar o conceito-base com exemplos concretos.</p>
      <p><strong>2. Exposição em Blocos Curtos (10–25 min • Apoio TDAH):</strong> Explicar "${tema}" em dois blocos de 7 minutos com pausa rápida de checagem e destaque para palavras-chave.</p>
      <p><strong>3. Prática Adaptada (25–40 min • Apoio Dislexia):</strong> Aplicar Quiz Inclusivo no Techadvisors permitindo uso de Leitura em Voz Alta (TTS), Papel Creme e tempo livre.</p>
      <p><strong>4. Fechamento & Feedback (40–45 min):</strong> Revisar os 3 pontos essenciais da aula e registrar dúvidas individuais.</p>
    `;
    box.classList.remove('hidden');
  }
};

window.copiarPlanoAula = function() {
  const texto = document.getElementById('ia-plano-aula-saida')?.innerText || '';
  if (!texto) return;
  navigator.clipboard.writeText(texto);
  alert('📋 Plano de aula copiado para a área de transferência!');
};