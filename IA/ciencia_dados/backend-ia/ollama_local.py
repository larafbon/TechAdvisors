"""Cliente HTTP para o Ollama rodando localmente na porta 11434."""
import json
import os
from urllib.request import ProxyHandler, Request, build_opener


def explicar(pergunta, resultado):
    modelo = os.getenv("OLLAMA_MODELO", "llama3.2:1b").strip()
    prompt = (
        "Explique o resultado abaixo em português em até duas frases curtas. "
        "Use somente os dados recebidos. Não invente números nem atribua causas.\n\n"
        f"Pergunta: {pergunta}\n"
        f"Dados: {json.dumps(resultado, ensure_ascii=False)}"
    )

    corpo = {
        "model": modelo,
        "prompt": prompt,
        "stream": False,
        "options": {"temperature": 0, "num_predict": 160},
    }

    pedido = Request(
        "http://127.0.0.1:11435/api/generate",
        data=json.dumps(corpo).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    # Ignora qualquer proxy da rede para falar direto com o localhost
    opener = build_opener(ProxyHandler({}))

    try:
        with opener.open(pedido, timeout=90) as resposta:
            dados = json.load(resposta)
            texto = dados.get("response", "")
            if not isinstance(texto, str) or not texto.strip():
                raise ValueError("O modelo não devolveu uma explicação.")
            return texto.strip()
    except Exception as erro:
        print("ERRO OLLAMA DETALHADO:", repr(erro))
        raise