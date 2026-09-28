from sqlalchemy import Column, Integer, String
from database import Base

# Classe que representa a tabela 'recurso_acessibilidade' no PostgreSQL
class RecursoAcessibilidade(Base):
    # Nome exato da tabela criada no banco de dados Supabase
    __tablename__ = "recurso_acessibilidade"

    # Mapeamento de cada coluna da tabela e seus tipos de dados:
    # id_recurso: Chave Primária (PK), numérica e gerada automaticamente (SERIAL/Autoincrement)
    id_recurso = Column(Integer, primary_key=True, index=True, autoincrement=True)
    
    # nome: Texto de até 150 caracteres, campo obrigatório (nullable=False)
    nome = Column(String(150), nullable=False)
    
    # descricao: Texto livre para detalhar o recurso (opcional / nullable=True)
    descricao = Column(String, nullable=True)
    
    # tipo: Categoria do recurso (ex: 'audio', 'texto', 'imagem') - até 50 caracteres
    tipo = Column(String(50), nullable=True)
    
    # formato: Formato digital do recurso (ex: 'MP3', 'PDF', 'TTF') - até 20 caracteres
    formato = Column(String(20), nullable=True)