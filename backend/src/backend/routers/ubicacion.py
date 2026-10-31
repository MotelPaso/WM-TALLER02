from fastapi import APIRouter
from sqlalchemy import select
from sqlalchemy.orm import contains_eager

from backend.dependencies import CurrentUser, DbSession
from backend.models import Edificio, Sala
from backend.schemas import EdificioOut, SalaOut

router = APIRouter(tags=["ubicacion"])


@router.get("/edificios", response_model=list[EdificioOut])
def list_edificios(db: DbSession, user: CurrentUser):
    return db.scalars(select(Edificio).order_by(Edificio.nombre)).all()


@router.get("/salas", response_model=list[SalaOut])
def list_salas(db: DbSession, user: CurrentUser, edificio_id: int | None = None):
    stmt = (
        select(Sala)
        .join(Sala.edificio)
        .options(contains_eager(Sala.edificio))
        .order_by(Edificio.nombre, Sala.numero)
    )
    if edificio_id is not None:
        stmt = stmt.where(Sala.edificio_id == edificio_id)
    return db.scalars(stmt).all()
