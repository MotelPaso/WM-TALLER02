from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.models.base import Base

if TYPE_CHECKING:
    from backend.models.catalogos import EstadoDispositivo, TipoDispositivo
    from backend.models.reporte import Reporte
    from backend.models.ubicacion import Sala


class Dispositivo(Base):
    __tablename__ = "dispositivos"

    id: Mapped[int] = mapped_column(primary_key=True)
    codigo_inventario: Mapped[str] = mapped_column(
        String(30), unique=True, nullable=False
    )
    tipo_dispositivo_id: Mapped[int] = mapped_column(
        ForeignKey("tipos_dispositivos.id", ondelete="RESTRICT"),
        nullable=False,
    )
    sala_id: Mapped[int] = mapped_column(
        ForeignKey("salas.id", ondelete="RESTRICT"),
        nullable=False,
    )
    estado_dispositivo_id: Mapped[int] = mapped_column(
        ForeignKey("estados_dispositivos.id", ondelete="RESTRICT"),
        nullable=False,
    )
    descripcion: Mapped[str | None] = mapped_column(Text)
    creado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    actualizado_en: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    tipo: Mapped[TipoDispositivo] = relationship()
    sala: Mapped[Sala] = relationship()
    estado: Mapped[EstadoDispositivo] = relationship()
    reportes: Mapped[list[Reporte]] = relationship(
        back_populates="dispositivo",
        passive_deletes=True,
    )
