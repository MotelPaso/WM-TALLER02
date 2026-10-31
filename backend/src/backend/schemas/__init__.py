from backend.schemas.auth import Token
from backend.schemas.catalogos import (
    EstadoDispositivoOut,
    EstadoReporteOut,
    PrioridadOut,
    RolOut,
    TipoDispositivoOut,
)
from backend.schemas.dispositivo import (
    DispositivoCreate,
    DispositivoOut,
    DispositivoUpdate,
)
from backend.schemas.reporte import (
    ReporteCreate,
    ReporteEstadoUpdate,
    ReporteOut,
    ReportePrioridadUpdate,
)
from backend.schemas.ubicacion import EdificioOut, SalaOut
from backend.schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioResumenOut

__all__ = [
    "DispositivoCreate",
    "DispositivoOut",
    "DispositivoUpdate",
    "EdificioOut",
    "EstadoDispositivoOut",
    "EstadoReporteOut",
    "PrioridadOut",
    "ReporteCreate",
    "ReporteEstadoUpdate",
    "ReporteOut",
    "ReportePrioridadUpdate",
    "RolOut",
    "SalaOut",
    "TipoDispositivoOut",
    "Token",
    "UsuarioCreate",
    "UsuarioOut",
    "UsuarioResumenOut",
]
