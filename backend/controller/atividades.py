from fastapi import APIRouter, HTTPException, status
from database import supabase
from models.atividades import AtividadeCreate

router = APIRouter(prefix="/atividades", tags=["Atividades"])

@router.post("", status_code=status.HTTP_201_CREATED)
def criar_atividade(item: AtividadeCreate):
    try:
        dados = item.model_dump(mode="json") if hasattr(item, "model_dump") else item.dict()

        # Garante remoção de data_criacao para o Supabase usar DEFAULT CURRENT_DATE
        if not dados.get("data_criacao"):
            dados.pop("data_criacao", None)
            
        if not dados.get("id_tipo_atividade"):
            dados["id_tipo_atividade"] = 1  # 1 para Atividade Padrão / Quiz

        res = supabase.table("atividade").insert(dados).execute()
        return {"status": "sucesso", "dados": res.data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao salvar atividade: {str(e)}"
        )
    
@router.get("/turma/{id_turma}")
def listar_atividades_por_turma(id_turma: int):
    try:
        res = supabase.table("atividade").select("*").eq("id_turma", id_turma).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erro ao buscar atividades da turma: {str(e)}"
        )