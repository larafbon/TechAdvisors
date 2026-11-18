from fastapi import APIRouter, HTTPException, status
from typing import Optional
from datetime import datetime
from database import supabase
from models.atividades import AtividadeCreate

router = APIRouter(prefix="/atividades", tags=["Atividades"])

# 1. LISTAR TODAS AS ATIVIDADES (Usado por dashboard.js, assistente-ia.js e relatorios-professor.js)
@router.get("")
@router.get("/")
def listar_todas_atividades(id_turma: Optional[int] = None):
    try:
        query = supabase.table("atividade").select("*")
        if id_turma:
            query = query.eq("id_turma", id_turma)
        res = query.order("id_atividade", desc=True).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. LISTAR ATIVIDADES DA TURMA ESPECÍFICA (Corrigido o filtro .eq("id_turma", id_turma))
@router.get("/turma/{id_turma}")
def listar_atividades_por_turma(id_turma: int):
    try:
        res = (
            supabase.table("atividade")
            .select("*")
            .eq("id_turma", id_turma)
            .order("id_atividade", desc=True)
            .execute()
        )
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 3. CRIAR NOVA ATIVIDADE
@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_atividade(item: AtividadeCreate):
    try:
        dados = item.model_dump(mode="json") if hasattr(item, "model_dump") else item.dict()
        if not dados.get("id_turma"):
            dados["id_turma"] = 1
        res = supabase.table("atividade").insert(dados).execute()
        if not res.data:
            raise HTTPException(status_code=400, detail="Falha ao inserir atividade.")
        return {"status": "sucesso", "dados": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar atividade: {str(e)}")

# 4. EXCLUIR ATIVIDADE
@router.delete("/{id_atividade}")
def deletar_atividade(id_atividade: int):
    try:
        res = supabase.table("atividade").delete().eq("id_atividade", id_atividade).execute()
        return {"status": "sucesso", "removido": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao excluir atividade: {str(e)}")

# 5. SALVAR RESPOSTA DO ALUNO (Compatibilidade com rota legada)
@router.post("/resposta", status_code=status.HTTP_201_CREATED)
@router.post("/resposta/", status_code=status.HTTP_201_CREATED)
def salvar_resposta_aluno(payload: dict):
    try:
        dados = {
            "id_aluno": int(payload.get("id_aluno", 1)),
            "id_atividade": int(payload.get("id_atividade")),
            "conteudo_resposta": str(payload.get("conteudo_resposta", "")),
            "data_resposta": payload.get("data_resposta") or datetime.utcnow().isoformat(),
            "nota": payload.get("nota")
        }
        res = supabase.table("resposta").insert(dados).execute()
        return {"status": "sucesso", "dados": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar resposta: {str(e)}")

# 6. LISTAR RESPOSTAS DE UMA ATIVIDADE
@router.get("/{id_atividade}/respostas")
def obter_respostas_da_atividade(id_atividade: int):
    try:
        res = supabase.table("resposta").select("*, aluno(nome)").eq("id_atividade", id_atividade).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))