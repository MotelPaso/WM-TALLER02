from datetime import UTC, datetime

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.models import Dispositivo, EstadoDispositivo, EstadoReporte, Reporte

ORDEN_ESTADOS_REPORTE = ["abierto", "en_proceso", "resuelto"]

def obtener_por_nombre(db: Session, modelo, nombre: str):
    valor = db.scalars(select(modelo).where(modelo.nombre == nombre)).first()
    if valor is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falta '{nombre}' en {modelo.__tablename__}; ejecuta uv run seed",
        )
    return valor

def recalcular_estado_dispositivo(db: Session, dispositivo: Dispositivo) -> None:

    if dispositivo.estado.nombre == "fuera_de_servicio":
        return

    pendientes = set(db.scalars(
        select(EstadoReporte.nombre)
        .select_from(Reporte)
        .join(Reporte.estado)
        .where(Reporte.dispositivo_id == dispositivo.id, EstadoReporte.nombre != "resuelto")
    ))

    if "en_proceso" in pendientes:
        nuevo = "en_reparacion"
    elif "abierto" in pendientes:
        nuevo = "con_falla"
    else:
        nuevo = "operativo"

    dispositivo.estado = obtener_por_nombre(db, EstadoDispositivo, nuevo)

def cambiar_estado_reporte(db: Session, reporte: Reporte, nuevo: str) -> None:
    actual = reporte.estado.nombre
    if ORDEN_ESTADOS_REPORTE.index(nuevo) <= ORDEN_ESTADOS_REPORTE.index(actual):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Un reporte '{actual}' no puede pasar a '{nuevo}'",
        )
    if actual == "abierto" and reporte.prioridad_id is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Asigna una prioridad antes de avanzar el reporte",
        )

    reporte.estado = obtener_por_nombre(db, EstadoReporte, nuevo)
    if nuevo == "resuelto":
        reporte.finalizado_en = datetime.now(UTC)

    recalcular_estado_dispositivo(db, reporte.dispositivo)
