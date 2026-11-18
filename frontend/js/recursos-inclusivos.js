const API_URL = 'http://127.0.0.1:8000';

const TEXTO_BASE_EXEMPLO =
  'A fotossíntese é o processo realizado pelas plantas para produzir energia a partir da luz solar, água e gás carbônico. Identifique qual alternativa NÃO representa um elemento necessário para esse processo.';

document.addEventListener('DOMContentLoaded', () => {
  carregarRecomendacoesAluno();
});

async function carregarRecomendacoesAluno() {
  const userStr = localStorage.getItem('tech_user');
  const user = userStr ? JSON.parse(userStr) : {};
  const idAluno = Number(user.id_aluno || user.id || 0);

  const tituloEl = document.getElementById('rec-aluno-titulo');
  if (tituloEl && user.nome) {
    tituloEl.innerText = `🎧 Recursos Inclusivos — ${user.nome}`;
  }

  // Mostra perfil salvo localmente
  const perfilSalvo = localStorage.getItem('tech_perfil_inclusivo_nome') || 'Modo Padrão';
  const badgeNome = document.getElementById('rec-perfil-atual-nome');
  if (badgeNome) badgeNome.innerText = perfilSalvo;

  const sugTitulo = document.getElementById('rec-sugestao-titulo');
  const sugTexto = document.getElementById('rec-sugestao-texto');

  try {
    let respostas = [];
    if (idAluno > 0) {
      const res = await fetch(`${API_URL}/respostas?id_aluno=${idAluno}`).catch(() => ({ ok: false }));
      if (res.ok) {
        const dados = await res.json();
        respostas = Array.isArray(dados) ? dados : (dados.respostas || []);
      }
    }

    // Analisa qual recurso gerou melhor nota para o aluno
    const stats = {};
    respostas.forEach(r => {
      const match = (r.conteudo_resposta || '').match(/\[Apoio:\s*(.*?)\]/);
      const nota = r.nota !== null && r.nota !== undefined ? Number(r.nota) : null;
      if (match && match[1]) {
        match[1].split(',').forEach(recRaw => {
          const nome = recRaw.trim();
          if (!nome) return;
          if (!stats[nome]) stats[nome] = { usos: 0, soma: 0, qtdNotas: 0 };
          stats[nome].usos++;
          if (nota !== null && !isNaN(nota)) {
            stats[nome].soma += nota;
            stats[nome].qtdNotas++;
          }
        });
      }
    });

    const ranking = Object.entries(stats)
      .map(([nome, s]) => ({
        nome,
        usos: s.usos,
        media: s.qtdNotas > 0 ? s.soma / s.qtdNotas : null
      }))
      .sort((a, b) => (b.media ?? 0) - (a.media ?? 0) || b.usos - a.usos);

    if (ranking.length > 0 && sugTitulo && sugTexto) {
      const melhor = ranking[0];
      const mediaTxt = melhor.media !== null ? ` com média ${melhor.media.toFixed(1).replace('.', ',')}` : '';
      sugTitulo.innerText = `✨ Melhor desempenho com: ${melhor.nome}`;
      sugTexto.innerText = `Você já utilizou "${melhor.nome}" em ${melhor.usos} atividade(s)${mediaTxt}. Recomendamos manter esse recurso ativado nos próximos quizzes ou experimentar a Leitura em Voz Alta abaixo.`;
    } else if (sugTitulo && sugTexto) {
      sugTitulo.innerText = '💡 Descubra qual modo combina mais com você!';
      sugTexto.innerText = 'Experimente os modos TEA (passos objetivos), TDAH (Leitura Biônica) ou Dislexia (Papel Creme) no laboratório abaixo e clique em "Usar como Padrão" no seu favorito.';
    }
  } catch (e) {
    console.error('Erro ao carregar recomendações:', e);
  }
}

window.testarModoNaCaixa = function(modo) {
  const caixa = document.getElementById('caixa-demonstracao-recurso');
  if (!caixa) return;

  caixa.className = 'p-5 rounded-2xl border text-sm leading-relaxed transition-all';

  if (modo === 'TEA') {
    caixa.classList.add('bg-sky-50', 'border-sky-200', 'text-slate-800');
    caixa.innerHTML = `
      <p class="text-xs font-extrabold text-sky-900 mb-2">🧩 Visualização no Modo TEA (Passos Objetivos & Sem Cronômetro):</p>
      <ol class="list-decimal pl-5 space-y-1.5">
        <li>A fotossíntese é o processo das plantas para produzir energia.</li>
        <li>Ela usa luz solar, água e gás carbônico.</li>
        <li><strong>Tarefa:</strong> Identifique qual alternativa <u>NÃO</u> faz parte desse processo.</li>
      </ol>
    `;
  } else if (modo === 'TDAH') {
    caixa.classList.add('bg-amber-50/50', 'border-amber-200', 'text-slate-900');
    const kwRegex = /^(não|identifique|alternativa|energia|solar)$/i;
    const bionico = TEXTO_BASE_EXEMPLO.split(/(\s+)/).map(tok => {
      if (/^\s+$/.test(tok)) return tok;
      const m = tok.match(/^([^\wÀ-ÿ]*)([\wÀ-ÿ-]+)([^\wÀ-ÿ]*)$/);
      if (!m) return tok;
      const [, pre, nuc, suf] = m;
      if (kwRegex.test(nuc)) {
        return `${pre}<mark class="bg-amber-300 text-amber-950 font-extrabold px-1 rounded">${nuc.toUpperCase()}</mark>${suf}`;
      }
      const corte = Math.ceil(nuc.length * 0.42);
      return `${pre}<strong>${nuc.slice(0, corte)}</strong>${nuc.slice(corte)}${suf}`;
    }).join('');

    caixa.innerHTML = `
      <p class="text-xs font-extrabold text-amber-900 mb-2">⚡ Visualização no Modo TDAH (Leitura Biônica + Palavras-Chave):</p>
      <p>${bionico}</p>
    `;
  } else if (modo === 'DISLEXIA') {
    caixa.classList.add('bg-[#fdf6e3]', 'border-amber-300', 'text-stone-900', 'tracking-wide', 'leading-loose');
    const silabico = TEXTO_BASE_EXEMPLO.split(/(\s+)/).map(tok => {
      if (/^\s+$/.test(tok) || tok.length <= 4) return tok;
      return tok
        .replace(/([^aeiouáéíóúâêôãõü])([aeiouáéíóúâêôãõü])/gi, '·$1$2')
        .replace(/^·/, '')
        .replace(/([aeiouáéíóúâêôãõü])([bcdfgjklmnpqrstvwxz])([bcdfgjklmnpqrstvwxz])/gi, '$1$2·$3');
    }).join('');

    caixa.innerHTML = `
      <p class="text-xs font-extrabold text-amber-950 mb-2">📖 Visualização no Modo Dislexia (Papel Creme + Divisão Silábica):</p>
      <p>${silabico}</p>
    `;
  } else {
    caixa.classList.add('bg-slate-50', 'border-slate-200', 'text-slate-800');
    caixa.innerText = TEXTO_BASE_EXEMPLO;
  }
};

window.ouvirTextoExemplo = function() {
  if (!('speechSynthesis' in window)) {
    alert('Seu navegador não suporta leitura em voz alta.');
    return;
  }
  window.speechSynthesis.cancel();
  const fala = new SpeechSynthesisUtterance(TEXTO_BASE_EXEMPLO);
  fala.lang = 'pt-BR';
  fala.rate = 0.95;
  window.speechSynthesis.speak(fala);
};

window.definirPerfilPreferido = function(codigo, nomeAmigavel) {
  localStorage.setItem('tech_perfil_inclusivo', codigo);
  localStorage.setItem('tech_perfil_inclusivo_nome', nomeAmigavel);

  const badgeNome = document.getElementById('rec-perfil-atual-nome');
  if (badgeNome) badgeNome.innerText = nomeAmigavel;

  alert(`✅ Perfil "${nomeAmigavel}" definido como seu padrão de acessibilidade!`);
};