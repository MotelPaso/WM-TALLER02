from backend.routers.auth import router as auth_router
from backend.routers.catalogos import router as catalogos_router
from backend.routers.dispositivos import router as dispositivos_router
from backend.routers.reportes import router as reportes_router
from backend.routers.ubicacion import router as ubicacion_router

__all__ = ["auth_router", "catalogos_router", "dispositivos_router", "reportes_router", "ubicacion_router"]