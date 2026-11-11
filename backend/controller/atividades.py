from fastapi import APIRouter, HTTPException, status
from database import supabase  # Ajusta conforme o teu projeto
from models.atividades import AtividadeCreate

router = APIRouter(prefix="/atividades", tags=["Atividades"])

# 3. EXCLUIR ATIVIDADE (CASCATA NO SUPABASE)
@router.delete("/{id_atividade}")
def deletar_atividade(id_atividade: int):
    try:
        res = supabase.table('atividade').delete().eq('id_atividade', id_atividade).execute()
        return {"status": "sucesso", "removido": res.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException, status
from database import supabase
from models.atividades import AtividadeCreate

router = APIRouter(prefix="/atividades", tags=["Atividades"])

# 1. LISTAR ATIVIDADES DA TURMA
@router.get("/turma/{id_turma}")
def listar_atividades_por_turma(id_turma: int):
    try:
        res = supabase.table('atividade').select('*').eq('id_turma', id_turma).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 2. SALVAR RESPOSTA DO ALUNO NA TABELA 'resposta'
@router.post("/resposta", status_code=status.HTTP_201_CREATED)
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

# 3. LISTAR RESPOSTAS DE UMA ATIVIDADE (PARA O PROFESSOR E PARA O ALUNO VERIFICAR SE JÁ RESPONDEU)
@router.get("/{id_atividade}/respostas")
def obter_respostas_da_atividade(id_atividade: int):
    try:
        res = supabase.table('resposta').select('*, aluno(nome)').eq('id_atividade', id_atividade).execute()
        return res.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))