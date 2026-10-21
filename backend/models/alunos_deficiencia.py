from pydantic import BaseModel

class AlunoDeficienciaCreate(BaseModel):
    id_aluno: int
    id_tipo_deficiencia: int
    id_nivel_suporte: int

class AlunoDeficienciaResponse(BaseModel):
    id_aluno_deficiencia: int
    id_aluno: int
    id_tipo_deficiencia: int
    id_nivel_suporte: int