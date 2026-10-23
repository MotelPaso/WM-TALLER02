from datetime import datetime

from pydantic import BaseModel, ConfigDict

from backend.schemas.catalogos import EstadoDispositivoOut, TipoDispositivoOut
from backend.schemas.ubicacion import SalaOut

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
