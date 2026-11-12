from fastapi import APIRouter, HTTPException, status
from database import supabase
from models.atividades import AtividadeCreate

router = APIRouter(prefix="/atividades", tags=["Atividades"])

# 1. LISTAR ATIVIDADES DA TURMA
@router.get("/turma/{id_turma}")
def listar_atividades_por_turma(id_turma: int):
    try:
        res = supabase.table('atividade').select('*').execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. CRIAR NOVA ATIVIDADE (FALTAVA ESTA ROTA NO TEU FICHEIRO)
@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def criar_atividade(item: AtividadeCreate):
    try:
        dados = item.model_dump(mode="json") if hasattr(item, "model_dump") else item.dict()
        if not dados.get("id_turma"):
            dados["id_turma"] = 1
        res = supabase.table('atividade').insert(dados).execute()
        return {"status": "sucesso", "dados": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao criar atividade: {str(e)}")

# 3. EXCLUIR ATIVIDADE
@router.delete("/{id_atividade}")
def deletar_atividade(id_atividade: int):
    try:
        res = supabase.table('atividade').delete().eq('id_atividade', id_atividade).execute()
        return {"status": "sucesso", "removido": res.data}
    except Exception as e:
        return {"status": "ignorado", "detalhe": str(e)}

# 4. SALVAR RESPOSTA DO ALUNO NA TABELA 'resposta'
@router.post("/resposta", status_code=status.HTTP_201_CREATED)
@router.post("/resposta/", status_code=status.HTTP_201_CREATED)
def salvar_resposta_aluno(payload: dict):
    try:
        dados = {
            "id_aluno": int(payload.get("id_aluno", 1)),
            "id_atividade": int(payload.get("id_atividade")),
            "conteudo_resposta": str(payload.get("conteudo_resposta"))
        }
        res = supabase.table('resposta').insert(dados).execute()
        return {"status": "sucesso", "dados": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao salvar resposta: {str(e)}")

# 5. LISTAR RESPOSTAS DE UMA ATIVIDADE
@router.get("/{id_atividade}/respostas")
def obter_respostas_da_atividade(id_atividade: int):
    try:
        res = supabase.table('resposta').select('*, aluno(nome)').eq('id_atividade', id_atividade).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))