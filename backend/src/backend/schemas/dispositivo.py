from datetime import datetime
from typing import Annotated

from pydantic import AfterValidator, BaseModel, ConfigDict, Field, model_validator

from backend.schemas.catalogos import EstadoDispositivoOut, TipoDispositivoOut
from backend.schemas.ubicacion import SalaOut

def normalizar_codigo(v: str) -> str:
    v = v.strip().upper()
    if not v:
        raise ValueError("El código de inventario no puede estar vacío")
    return v

CodigoInventario = Annotated[str, Field(min_length=1, max_length=30), AfterValidator(normalizar_codigo)]
Descripcion = Annotated[str, Field(max_length=500)]

class DispositivoCreate(BaseModel):
    codigo_inventario: CodigoInventario
    tipo_dispositivo_id: int
    sala_id: int
    descripcion: Descripcion | None = None

class DispositivoUpdate(BaseModel):
    """Todos opcionales: solo se modifican los campos que vienen en el JSON."""
    codigo_inventario: CodigoInventario | None = None
    tipo_dispositivo_id: int | None = None
    sala_id: int | None = None
    estado_dispositivo_id: int | None = None
    descripcion: Descripcion | None = None

    @model_validator(mode="after")
    def sin_nulos_obligatorios(self) -> "DispositivoUpdate":
        for campo in ("codigo_inventario", "tipo_dispositivo_id", "sala_id", "estado_dispositivo_id"):
            if campo in self.model_fields_set and getattr(self, campo) is None:
                raise ValueError(f"{campo} no puede ser null")
        return self

class DispositivoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    codigo_inventario: str
    descripcion: str | None
    tipo: TipoDispositivoOut
    sala: SalaOut
    estado: EstadoDispositivoOut
    creado_en: datetime
    actualizado_en: datetime
