// ==========================================
// CHAT DE DADOS — TechAdvisors (Porta 8001)
// ==========================================
const API_CHAT = 'http://127.0.0.1:8001';

const form       = document.getElementById('chat-form');
const seletor    = document.getElementById('chat-pergunta');
const botao      = document.getElementById('chat-enviar');
const statusChat = document.getElementById('chat-status');
const resposta   = document.getElementById('chat-resposta');
const lista      = document.getElementById('chat-dados');
const aviso      = document.getElementById('chat-aviso');

if (form) {
    // ==========================================
    // 1. Formatação de textos para a tela
    // ==========================================
    function rotulo(chave) {
        const mapa = {
            nota_media: 'Nota média',
            total_alunos: 'Total de alunos',
            total_atividades_realizadas: 'Atividades realizadas',
            total_respostas: 'Total de respostas',
            total_turmas: 'Total de turmas',
            tipo_deficiencia: 'Tipo de deficiência',
            recurso_acessibilidade: 'Recurso de acessibilidade',
            codigo_turma: 'Código da turma',
            nome_turma: 'Turma',
            data: 'Data',
            periodo_inicio: 'Início do período',
            periodo_fim: 'Fim do período',
        };
        return mapa[chave] || chave.replace(/_/g, ' ');
    }

    function valor(v) {
        if (v === null || v === undefined) return '—';
        if (typeof v === 'number') {
            return Number.isInteger(v) ? v : v.toFixed(2).replace('.', ',');
        }
        return String(v);
    }

    function formatarResultado(resultado) {
        const linhas = [];

        if (Array.isArray(resultado)) {
            resultado.forEach(item => {
                if (item && typeof item === 'object') {
                    const partes = Object.entries(item)
                        .map(([k, v]) => `${rotulo(k)}: ${valor(v)}`)
                        .join(' • ');
                    linhas.push(partes);
                } else {
                    linhas.push(String(item));
                }
            });
            return linhas.length ? linhas : ['Sem dados para essa consulta.'];
        }

        if (resultado && typeof resultado === 'object') {
            Object.entries(resultado).forEach(([k, v]) => {
                if (Array.isArray(v)) {
                    linhas.push(`${rotulo(k)}:`);
                    v.forEach(sub => {
                        const partes = Object.entries(sub)
                            .map(([k2, v2]) => `${rotulo(k2)}: ${valor(v2)}`)
                            .join(' • ');
                        linhas.push(`  – ${partes}`);
                    });
                } else if (v && typeof v === 'object') {
                    linhas.push(`${rotulo(k)}: ${JSON.stringify(v)}`);
                } else {
                    linhas.push(`${rotulo(k)}: ${valor(v)}`);
                }
            });
            return linhas.length ? linhas : ['Sem dados para essa consulta.'];
        }

        return [String(resultado)];
    }

    // ==========================================
    // 2. Carrega as perguntas do Backend
    // ==========================================
    async function carregarPerguntas() {
        try {
            const retorno = await fetch(API_CHAT + '/chat/perguntas');
            if (!retorno.ok) throw new Error('HTTP ' + retorno.status);
            const perguntas = await retorno.json();

            seletor.replaceChildren();
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.textContent = 'Escolha uma pergunta…';
            seletor.append(placeholder);

            for (const p of perguntas) {
                const opt = document.createElement('option');
                opt.value = p;
                opt.textContent = p;
                seletor.append(opt);
            }

            seletor.disabled = false;
            botao.disabled = false;
        } catch {
            statusChat.textContent = 'Não foi possível carregar as perguntas. Confira se a API está rodando na porta 8001.';
        }
    }

    // ==========================================
    // 3. Envia a pergunta e exibe a resposta
    // ==========================================
    async function enviarPergunta(pergunta) {
        if (!pergunta || botao.disabled) return;

        botao.disabled = true;
        resposta.hidden = true;

        statusChat.textContent = 'Consultando banco de dados e gerando explicação com Ollama local…';

        try {
            const retorno = await fetch(API_CHAT + '/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pergunta }),
            });
            if (!retorno.ok) throw new Error('HTTP ' + retorno.status);
            const dados = await retorno.json();

            document.querySelector('#chat-enunciado').textContent = pergunta;

            lista.replaceChildren();
            for (const linha of formatarResultado(dados.resultado)) {
                const item = document.createElement('li');
                item.textContent = linha;
                lista.append(item);
            }

            document.querySelector('#chat-explicacao').textContent =
                dados.explicacao || 'Explicação indisponível.';

            aviso.textContent = dados.aviso || '';
            aviso.hidden = !dados.aviso;

            resposta.hidden = false;
            statusChat.textContent = 'Resposta disponível abaixo.';
        } catch {
            statusChat.textContent = 'A consulta falhou. Confira a API (porta 8001) e tente novamente.';
        } finally {
            botao.disabled = false;
        }
    }

    // ==========================================
    // 4. Eventos de clique e envio
    // ==========================================
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        enviarPergunta(seletor.value);
    });

    document.querySelectorAll('.quick-card[data-question]').forEach(card => {
        card.addEventListener('click', () => {
            const pergunta = card.dataset.question;

            const existe = [...seletor.options].some(o => o.value === pergunta);
            if (!existe) {
                const opt = document.createElement('option');
                opt.value = pergunta;
                opt.textContent = pergunta;
                seletor.append(opt);
            }
            seletor.value = pergunta;

            enviarPergunta(pergunta);
        });
    });

    // ==========================================
    // 5. Inicialização
    // ==========================================
    carregarPerguntas();
}