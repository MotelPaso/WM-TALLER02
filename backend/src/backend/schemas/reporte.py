from datetime import datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, Field

from backend.schemas.catalogos import EstadoReporteOut, PrioridadOut
from backend.schemas.dispositivo import DispositivoOut
from backend.schemas.usuario import UsuarioResumenOut

def sin_espacios_extremos(v: str) -> str:
    v = v.strip()
    if not v:
        raise ValueError("No puede estar vacío")
    return v

class ReporteCreate(BaseModel):
    titulo: Annotated[str, Field(min_length=1, max_length=150), AfterValidator(sin_espacios_extremos)]
    descripcion: Annotated[str, Field(min_length=1, max_length=2000), AfterValidator(sin_espacios_extremos)]
    dispositivo_id: int

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
