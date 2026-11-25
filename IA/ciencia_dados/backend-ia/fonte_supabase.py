"""Conexão via API REST (HTTPS) com o Supabase lendo a view analítica."""
import os
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(Path(__file__).with_name(".env"))

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")


def get_supabase() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError("SUPABASE_URL ou SUPABASE_KEY não configurados no .env")
    return create_client(SUPABASE_URL, SUPABASE_KEY)


def buscar_dados_view():
    """Busca todas as linhas da view vw_respostas_analiticas via HTTPS."""
    supabase = get_supabase()
    resposta = supabase.table("vw_respostas_analiticas").select("*").execute()
    return resposta.data or []