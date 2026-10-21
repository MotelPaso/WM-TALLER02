from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.models.base import Base


class Edificio(Base):
    __tablename__ = "edificios"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    salas: Mapped[list["Sala"]] = relationship(back_populates="edificio", passive_deletes=True)


class Sala(Base):
    __tablename__ = "salas"

    id: Mapped[int] = mapped_column(primary_key=True)
    numero: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    edificio_id: Mapped[int] = mapped_column(ForeignKey("edificios.id", ondelete="RESTRICT"), nullable=False)

    edificio: Mapped["Edificio"] = relationship(back_populates="salas")