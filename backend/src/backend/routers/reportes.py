from fastapi import APIRouter, HTTPException, status
from sqlalchemy import Select, select
from sqlalchemy.orm import Session, joinedload

from backend.dependencies import CurrentUser, DbSession, TechnicianUser, is_technician
from backend.models import Dispositivo, EstadoReporte, Prioridad, Reporte, Sala
from backend.schemas import ReporteCreate, ReporteEstadoUpdate, ReporteOut, ReportePrioridadUpdate
from backend.services import cambiar_estado_reporte, obtener_por_nombre, recalcular_estado_dispositivo

router = APIRouter(prefix="/reportes", tags=["reportes"])

def select_reportes() -> Select[tuple[Reporte]]:
    dispositivo = joinedload(Reporte.dispositivo)
    return select(Reporte).options(
        dispositivo.joinedload(Dispositivo.tipo),
        dispositivo.joinedload(Dispositivo.estado),
        dispositivo.joinedload(Dispositivo.sala).joinedload(Sala.edificio),
        joinedload(Reporte.creado_por),
        joinedload(Reporte.estado),
        joinedload(Reporte.prioridad),
    )

def obtener_reporte(db: Session, reporte_id: int) -> Reporte:
    reporte = db.scalars(select_reportes().where(Reporte.id == reporte_id)).first()
    if reporte is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Reporte no encontrado")
    return reporte

@router.post("", response_model=ReporteOut, status_code=status.HTTP_201_CREATED)
def create_reporte(data: ReporteCreate, db: DbSession, user: CurrentUser):
    dispositivo = db.get(Dispositivo, data.dispositivo_id)
    if dispositivo is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="El dispositivo no existe")

    reporte = Reporte(
        titulo=data.titulo,
        descripcion=data.descripcion,
        dispositivo=dispositivo,
        creado_por=user,
        estado=obtener_por_nombre(db, EstadoReporte, "abierto"),
    )
    db.add(reporte)
    recalcular_estado_dispositivo(db, dispositivo)
    db.commit()
    return obtener_reporte(db, reporte.id)

@router.get("", response_model=list[ReporteOut])
def list_reportes(
    db: DbSession,
    user: CurrentUser,
    estado: str | None = None,
    prioridad: str | None = None,
    dispositivo_id: int | None = None,
):
    stmt = select_reportes()

    if not is_technician(user):
        stmt = stmt.where(Reporte.creado_por_id == user.id)
    if estado:
        stmt = stmt.where(Reporte.estado.has(EstadoReporte.nombre == estado))
    if prioridad:
        stmt = stmt.where(Reporte.prioridad.has(Prioridad.nombre == prioridad))
    if dispositivo_id is not None:
        stmt = stmt.where(Reporte.dispositivo_id == dispositivo_id)

    return db.scalars(stmt.order_by(Reporte.creado_en.desc())).all()

@router.get("/{reporte_id}", response_model=ReporteOut)
def get_reporte(reporte_id: int, db: DbSession, user: CurrentUser):
    reporte = obtener_reporte(db, reporte_id)
    if not is_technician(user) and reporte.creado_por_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes acceso a este reporte")
    return reporte

@router.patch("/{reporte_id}/prioridad", response_model=ReporteOut)
def update_prioridad(reporte_id: int, data: ReportePrioridadUpdate, db: DbSession, user: TechnicianUser):
    reporte = obtener_reporte(db, reporte_id)
    if reporte.estado.nombre == "resuelto":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El reporte ya está resuelto")

    prioridad = db.get(Prioridad, data.prioridad_id)
    if prioridad is None:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail="La prioridad no existe")

    reporte.prioridad = prioridad
    db.commit()
    return obtener_reporte(db, reporte_id)

@router.patch("/{reporte_id}/estado", response_model=ReporteOut)
def update_estado(reporte_id: int, data: ReporteEstadoUpdate, db: DbSession, user: TechnicianUser):
    reporte = obtener_reporte(db, reporte_id)
    cambiar_estado_reporte(db, reporte, data.estado)
    db.commit()
    return obtener_reporte(db, reporte_id)

@router.delete("/{reporte_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_reporte(reporte_id: int, db: DbSession, user: CurrentUser):
    reporte = obtener_reporte(db, reporte_id)
    if reporte.creado_por_id != user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Solo puedes eliminar tus propios reportes")
    if reporte.estado.nombre != "abierto":
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Solo se puede eliminar un reporte abierto")

    dispositivo = reporte.dispositivo
    db.delete(reporte)
    recalcular_estado_dispositivo(db, dispositivo)
    db.commit()
