from sqlalchemy import Column, Integer, String, Text
from database import Base

class TipoDeficiencia(Base):
    __tablename__ = "tipo_deficiencia"

    id_tipo_deficiencia = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo = Column(String(50), unique=True, nullable=False, index=True)
    descricao = Column(Text, nullable=False)