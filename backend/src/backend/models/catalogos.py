from sqlalchemy import SmallInteger, String
from sqlalchemy.orm import Mapped, mapped_column

from backend.models.base import Base


class Rol(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)


class TipoDispositivo(Base):
    __tablename__ = "tipos_dispositivos"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)


class EstadoDispositivo(Base):
    __tablename__ = "estados_dispositivos"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)


class EstadoReporte(Base):
    __tablename__ = "estados_reportes"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(30), unique=True, nullable=False)


class Prioridad(Base):
    __tablename__ = "prioridades"

    id: Mapped[int] = mapped_column(primary_key=True)
    nombre: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    nivel: Mapped[int] = mapped_column(SmallInteger, unique=True, nullable=False)
