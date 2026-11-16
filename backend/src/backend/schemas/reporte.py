from datetime import datetime
from typing import Annotated, Literal

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, model_validator

from backend.schemas.catalogos import EstadoReporteOut, PrioridadOut
from backend.schemas.dispositivo import DispositivoOut
from backend.schemas.usuario import UsuarioResumenOut


def sin_espacios_extremos(v: str) -> str:
    v = v.strip()
    if not v:
        raise ValueError("No puede estar vacío")
    return v


class ReporteCreate(BaseModel):
    titulo: Annotated[
        str, Field(min_length=1, max_length=150), AfterValidator(sin_espacios_extremos)
    ]
    descripcion: Annotated[
        str, Field(min_length=1, max_length=2000), AfterValidator(sin_espacios_extremos)
    ]
    dispositivo_id: int
    latitud: float | None = Field(default=None, ge=-90, le=90)
    longitud: float | None = Field(default=None, ge=-180, le=180)

    @model_validator(mode="after")
    def ubicacion_completa(self) -> ReporteCreate:
        if (self.latitud is None) != (self.longitud is None):
            raise ValueError("latitud y longitud deben venir juntas")
        return self


class ReportePrioridadUpdate(BaseModel):
    prioridad_id: int


class ReporteEstadoUpdate(BaseModel):
    estado: Literal["en_proceso", "resuelto"]
    notas_resolucion: str | None = Field(default=None, max_length=1000)


class ReporteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    descripcion: str
    dispositivo: DispositivoOut
    creado_por: UsuarioResumenOut
    estado: EstadoReporteOut
    prioridad: PrioridadOut | None
    creado_en: datetime
    actualizado_en: datetime
    finalizado_en: datetime | None
    notas_resolucion: str | None = None
    latitud: float | None = None
    longitud: float | None = None
