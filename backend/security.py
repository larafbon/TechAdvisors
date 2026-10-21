from passlib.context import CryptContext


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def gerar_hash_senha(senha: str) -> str:
   """Gera o hash seguro de uma senha, garantindo o limite de 72 bytes do Bcrypt."""
   # Garante o limite de 72 bytes exigido pelo algoritmo bcrypt
   senha_bytes = senha.encode("utf-8")[:72]
   return pwd_context.hash(senha_bytes)


def verificar_senha(senha_plana: str, senha_hash: str) -> bool:
   """Compara a senha informada com o hash salvo no banco."""
   senha_bytes = senha_plana.encode("utf-8")[:72]
   return pwd_context.verify(senha_bytes, senha_hash)

