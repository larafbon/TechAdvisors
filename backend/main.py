from fastapi import FastAPI
from database import engine, Base
import routes.recursos as recursos

app = FastAPI(title="TechAdvisors API")

# Registra as rotas
app.include_router(recursos.router)

@app.get("/")
def home():
    return {"mensagem": "API TechAdvisors rodando com sucesso!"}