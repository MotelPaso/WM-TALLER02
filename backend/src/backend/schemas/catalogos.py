from pydantic import BaseModel, ConfigDict


class RolOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str


class TipoDispositivoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str


class EstadoDispositivoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str


class EstadoReporteOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str


class PrioridadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    nivel: int
