from fastapi import APIRouter, HTTPException, status
from sqlalchemy import Select, or_, select
from sqlalchemy.orm import contains_eager

from backend.dependencies import CurrentUser, DbSession
from backend.models import Dispositivo, Edificio, EstadoDispositivo, Sala, TipoDispositivo
from backend.schemas import DispositivoOut

router = APIRouter(prefix="/dispositivos", tags=["dispositivos"])

def select_dispositivos() -> Select[tuple[Dispositivo]]:
    return (
        select(Dispositivo)
        .join(Dispositivo.tipo)
        .join(Dispositivo.estado)
        .join(Dispositivo.sala)
        .join(Sala.edificio)
        .options(
            contains_eager(Dispositivo.tipo),
            contains_eager(Dispositivo.estado),
            contains_eager(Dispositivo.sala).contains_eager(Sala.edificio),
        )
    )

@router.get("", response_model=list[DispositivoOut])
def list_dispositivos(
    db: DbSession,
    user: CurrentUser,
    q: str | None = None,
    estado: str | None = None,
    tipo_id: int | None = None,
    edificio_id: int | None = None,
    sala_id: int | None = None,
):
    stmt = select_dispositivos()

    if q and q.strip():
        patron = f"%{q.strip()}%"
        stmt = stmt.where(or_(
            Dispositivo.codigo_inventario.ilike(patron),
            Dispositivo.descripcion.ilike(patron),
            TipoDispositivo.nombre.ilike(patron),
            Sala.numero.ilike(patron),
            Edificio.nombre.ilike(patron),
        ))
    if estado:
        stmt = stmt.where(EstadoDispositivo.nombre == estado)
    if tipo_id is not None:
        stmt = stmt.where(Dispositivo.tipo_dispositivo_id == tipo_id)
    if edificio_id is not None:
        stmt = stmt.where(Sala.edificio_id == edificio_id)
    if sala_id is not None:
        stmt = stmt.where(Dispositivo.sala_id == sala_id)

    return db.scalars(stmt.order_by(Dispositivo.codigo_inventario)).all()

@router.get("/{dispositivo_id}", response_model=DispositivoOut)
def get_dispositivo(dispositivo_id: int, db: DbSession, user: CurrentUser):
    dispositivo = db.scalars(select_dispositivos().where(Dispositivo.id == dispositivo_id)).first()
    if dispositivo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    return dispositivo
