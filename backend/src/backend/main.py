from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.database.config import settings
from backend.routers import (
    auth_router,
    catalogos_router,
    dispositivos_router,
    reportes_router,
    ubicacion_router,
)

app = FastAPI(title="WM-TALLER02 API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(dispositivos_router)
app.include_router(reportes_router)
app.include_router(catalogos_router)
app.include_router(ubicacion_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
