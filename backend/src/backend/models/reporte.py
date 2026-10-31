from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.models.base import Base

if TYPE_CHECKING:
    from backend.models.catalogos import EstadoReporte, Prioridad
    from backend.models.dispositivo import Dispositivo
    from backend.models.usuario import Usuario


class Reporte(Base):
    __tablename__ = "reportes"

    id: Mapped[int] = mapped_column(primary_key=True)
    titulo: Mapped[str] = mapped_column(String(150), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    dispositivo_id: Mapped[int] = mapped_column(
        ForeignKey("dispositivos.id", ondelete="RESTRICT"),
        nullable=False,
    )
    creado_por_id: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False,
    )
    estado_reporte_id: Mapped[int] = mapped_column(
        ForeignKey("estados_reportes.id", ondelete="RESTRICT"),
        nullable=False,
    )
    prioridad_id: Mapped[int | None] = mapped_column(
        ForeignKey("prioridades.id", ondelete="RESTRICT"),
    )
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
    finalizado_en: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    dispositivo: Mapped[Dispositivo] = relationship(back_populates="reportes")
    creado_por: Mapped[Usuario] = relationship()
    estado: Mapped[EstadoReporte] = relationship()
    prioridad: Mapped[Prioridad | None] = relationship()
