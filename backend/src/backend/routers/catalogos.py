from fastapi import APIRouter
from sqlalchemy import select

from backend.dependencies import CurrentUser, DbSession
from backend.models import EstadoDispositivo, EstadoReporte, Prioridad, TipoDispositivo
from backend.schemas import EstadoDispositivoOut, EstadoReporteOut, PrioridadOut, TipoDispositivoOut

router = APIRouter(prefix="/catalogos", tags=["catalogos"])

@router.get("/tipos-dispositivo", response_model=list[TipoDispositivoOut])
def list_tipos_dispositivo(db: DbSession, user: CurrentUser):
    return db.scalars(select(TipoDispositivo).order_by(TipoDispositivo.nombre)).all()

@router.get("/estados-dispositivo", response_model=list[EstadoDispositivoOut])
def list_estados_dispositivo(db: DbSession, user: CurrentUser):
    return db.scalars(select(EstadoDispositivo).order_by(EstadoDispositivo.id)).all()

@router.get("/estados-reporte", response_model=list[EstadoReporteOut])
def list_estados_reporte(db: DbSession, user: CurrentUser):
    return db.scalars(select(EstadoReporte).order_by(EstadoReporte.id)).all()

@router.get("/prioridades", response_model=list[PrioridadOut])
def list_prioridades(db: DbSession, user: CurrentUser):
    return db.scalars(select(Prioridad).order_by(Prioridad.nivel)).all()
