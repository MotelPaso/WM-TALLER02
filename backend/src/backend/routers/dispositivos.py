from fastapi import APIRouter, HTTPException, status
from sqlalchemy import Select, exists, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, contains_eager

from backend.dependencies import CurrentUser, DbSession, TechnicianUser
from backend.models import Dispositivo, Edificio, EstadoDispositivo, Reporte, Sala, TipoDispositivo
from backend.routers.reportes import select_reportes
from backend.schemas import DispositivoCreate, DispositivoOut, DispositivoUpdate, ReporteOut
from backend.services import cambiar_fuera_de_servicio, obtener_por_nombre

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

def obtener_dispositivo(db: Session, dispositivo_id: int) -> Dispositivo:
    dispositivo = db.scalars(select_dispositivos().where(Dispositivo.id == dispositivo_id)).first()
    if dispositivo is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dispositivo no encontrado")
    return dispositivo

def validar_referencias(db: Session, datos: dict) -> None:
    referencias = {
        "tipo_dispositivo_id": (TipoDispositivo, "El tipo de dispositivo no existe"),
        "sala_id": (Sala, "La sala no existe"),
    }
    for campo, (modelo, mensaje) in referencias.items():
        if campo in datos and db.get(modelo, datos[campo]) is None:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, detail=mensaje)

def guardar(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un dispositivo con ese código de inventario",
        )

@router.get("/{dispositivo_id}", response_model=DispositivoOut)
def get_dispositivo(dispositivo_id: int, db: DbSession, user: CurrentUser):
    return obtener_dispositivo(db, dispositivo_id)

@router.get("/{dispositivo_id}/reportes", response_model=list[ReporteOut])
def list_reportes_dispositivo(dispositivo_id: int, db: DbSession, user: CurrentUser):
    obtener_dispositivo(db, dispositivo_id)
    stmt = select_reportes().where(Reporte.dispositivo_id == dispositivo_id)
    return db.scalars(stmt.order_by(Reporte.creado_en.desc())).all()

@router.post("", response_model=DispositivoOut, status_code=status.HTTP_201_CREATED)
def create_dispositivo(data: DispositivoCreate, db: DbSession, user: TechnicianUser):
    datos = data.model_dump()
    validar_referencias(db, datos)

    operativo = obtener_por_nombre(db, EstadoDispositivo, "operativo")
    dispositivo = Dispositivo(**datos, estado=operativo)
    db.add(dispositivo)
    guardar(db)
    return obtener_dispositivo(db, dispositivo.id)

@router.patch("/{dispositivo_id}", response_model=DispositivoOut)
def update_dispositivo(dispositivo_id: int, data: DispositivoUpdate, db: DbSession, user: TechnicianUser):
    dispositivo = obtener_dispositivo(db, dispositivo_id)

    cambios = data.model_dump(exclude_unset=True)
    fuera_de_servicio = cambios.pop("fuera_de_servicio", None)
    validar_referencias(db, cambios)
    for campo, valor in cambios.items():
        setattr(dispositivo, campo, valor)
    if fuera_de_servicio is not None:
        cambiar_fuera_de_servicio(db, dispositivo, fuera_de_servicio)

    guardar(db)
    return obtener_dispositivo(db, dispositivo_id)

@router.delete("/{dispositivo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dispositivo(dispositivo_id: int, db: DbSession, user: TechnicianUser):
    dispositivo = obtener_dispositivo(db, dispositivo_id)

    tiene_reportes = db.scalar(select(exists().where(Reporte.dispositivo_id == dispositivo_id)))
    if tiene_reportes:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="El dispositivo tiene reportes asociados; márcalo como fuera de servicio",
        )

    db.delete(dispositivo)
    db.commit()
