from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import auth_router, catalogos_router, dispositivos_router, ubicacion_router

app = FastAPI(title="WM-TALLER02 API")

app.add_middleware(
    CORSMiddleware, allow_origins=["http://localhost:4200"],
    allow_credentials=True, allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_router)
app.include_router(dispositivos_router)
app.include_router(catalogos_router)
app.include_router(ubicacion_router)

@app.get("/health")
def health_check():
    return {"status": "ok"}