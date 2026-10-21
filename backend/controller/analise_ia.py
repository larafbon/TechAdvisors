from fastapi import APIRouter
from database import supabase
from models.analise_ia import AnaliseIaCreate, AnaliseIaResponse

router = APIRouter(prefix="/analise-ia", tags=["Análise IA"])

@router.post("", response_model=AnaliseIaResponse)
def criar_analise_ia(item: AnaliseIaCreate):
    dados = item.model_dump() if hasattr(item, "model_dump") else item.dict()
    dados["data_analise"] = str(dados["data_analise"])
    res = supabase.table("analise_ia").insert(dados).execute()
    return res.data[0]

@router.get("/resposta/{id_resposta}")
def obter_analise_ia(id_resposta: int):
    res = supabase.table("analise_ia").select("*").eq("id_resposta", id_resposta).execute()
    return res.data or []