from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database.config import settings
from backend.database.session import SessionLocal, engine
from backend.models import (
    Dispositivo,
    Edificio,
    EstadoDispositivo,
    EstadoReporte,
    Prioridad,
    Reporte,
    Rol,
    Sala,
    TipoDispositivo,
    Usuario,
)
from backend.security import hash_password
from backend.services import recalcular_estado_dispositivo

ROLES = ["usuario", "tecnico"]
ESTADOS_DISPOSITIVO = ["operativo", "con_falla", "en_reparacion", "fuera_de_servicio"]
ESTADOS_REPORTE = ["abierto", "en_proceso", "resuelto"]
PRIORIDADES = [("baja", 1), ("media", 2), ("alta", 3)]
TIPOS_DISPOSITIVO = [
    "Computador",
    "Monitor",
    "Proyector",
    "Impresora",
    "Pantalla",
    "Audio",
    "Cámara",
    "Punto WiFi",
]


def rango(desde: int, hasta: int) -> list[str]:
    return [str(n) for n in range(desde, hasta + 1)]


SALAS = {
    "B1/B2": rango(31, 35),
    "D1": rango(24, 28),
    "D2": ["102", "202", "203", "302", "303", "304"],
    "G": rango(10, 13),
    "G1": rango(6, 9),
    "G2": rango(4, 5),
    "G3": rango(1, 3),
    "G4": rango(14, 23),
    "G5": rango(36, 38),
    "G6": rango(45, 54),
    "X": ["104", "107", "204", "205", "206", "207"],
    "X1": rango(29, 30),
}

DISPOSITIVOS = [
    ("UCN-004501", "Proyector", "29", "operativo", "Proyector de techo"),
    ("UCN-004502", "Computador", "29", "operativo", "PC del docente"),
    ("UCN-004503", "Audio", "29", "operativo", "Parlantes y micrófono"),
    ("UCN-004504", "Proyector", "30", "operativo", "Proyector de techo"),
    ("UCN-004505", "Computador", "30", "operativo", "PC del docente"),
    ("UCN-004506", "Pantalla", "31", "operativo", "Pantalla interactiva"),
    ("UCN-004507", "Cámara", "31", "operativo", "Cámara para clases híbridas"),
    ("UCN-004508", "Computador", "104", "operativo", "Laboratorio, puesto 1"),
    ("UCN-004509", "Computador", "104", "operativo", "Laboratorio, puesto 2"),
    ("UCN-004510", "Monitor", "104", "operativo", "Monitor del puesto 1"),
    ("UCN-004511", "Impresora", "107", "operativo", "Impresora láser"),
    ("UCN-004512", "Punto WiFi", "107", "operativo", None),
    (
        "UCN-004513",
        "Proyector",
        "202",
        "fuera_de_servicio",
        "Lámpara quemada, pendiente de baja",
    ),
    ("UCN-004514", "Punto WiFi", "202", "operativo", None),
    ("UCN-004515", "Proyector", "24", "operativo", "Proyector de techo"),
    ("UCN-004516", "Computador", "10", "operativo", "PC del docente"),
    ("UCN-004517", "Proyector", "6", "operativo", "Proyector de techo"),
    ("UCN-004518", "Pantalla", "14", "operativo", "Televisor para presentaciones"),
    ("UCN-004519", "Audio", "36", "operativo", "Parlantes del auditorio"),
    ("UCN-004520", "Computador", "45", "operativo", "PC del docente"),
]

REPORTES = [
    (
        "UCN-004504",
        "No proyecta imagen",
        "El proyector enciende pero no muestra señal del PC.",
        "abierto",
        None,
    ),
    (
        "UCN-004514",
        "Señal intermitente",
        "El WiFi se corta cada pocos minutos en la sala.",
        "abierto",
        "baja",
    ),
    (
        "UCN-004508",
        "No enciende",
        "El computador del puesto 1 no da señal al presionar el botón.",
        "en_proceso",
        "alta",
    ),
    (
        "UCN-004511",
        "Atasco de papel",
        "La impresora se atasca con cada hoja.",
        "resuelto",
        "media",
    ),
]


def get_or_create(db: Session, model, defaults: dict | None = None, **unique):
    obj = db.scalars(select(model).filter_by(**unique)).first()
    if obj is None:
        obj = model(**unique, **(defaults or {}))
        db.add(obj)
        db.flush()
    return obj


def seed_catalogos(db: Session) -> None:
    for nombre in ROLES:
        get_or_create(db, Rol, nombre=nombre)
    for nombre in ESTADOS_DISPOSITIVO:
        get_or_create(db, EstadoDispositivo, nombre=nombre)
    for nombre in ESTADOS_REPORTE:
        get_or_create(db, EstadoReporte, nombre=nombre)
    for nombre, nivel in PRIORIDADES:
        get_or_create(db, Prioridad, nombre=nombre, defaults={"nivel": nivel})
    for nombre in TIPOS_DISPOSITIVO:
        get_or_create(db, TipoDispositivo, nombre=nombre)


def seed_tecnico(db: Session) -> Usuario | None:
    nombre = settings.seed_tecnico_nombre
    correo = settings.seed_tecnico_correo
    contrasena = settings.seed_tecnico_contrasena
    if not (nombre and correo and contrasena):
        print("Sin SEED_TECNICO_* en .env: no se crea el técnico inicial")
        return None

    rol = get_or_create(db, Rol, nombre="tecnico")
    return get_or_create(
        db,
        Usuario,
        correo=correo.strip().lower(),
        defaults={
            "nombre": nombre,
            "contrasena_hash": hash_password(contrasena.get_secret_value()),
            "rol": rol,
        },
    )


def seed_demo(db: Session) -> None:
    salas = {}
    for nombre_edificio, numeros in SALAS.items():
        edificio = get_or_create(db, Edificio, nombre=nombre_edificio)
        for numero in numeros:
            salas[numero] = get_or_create(
                db, Sala, numero=numero, defaults={"edificio": edificio}
            )

    tipos = {t.nombre: t for t in db.scalars(select(TipoDispositivo))}
    estados = {e.nombre: e for e in db.scalars(select(EstadoDispositivo))}
    for codigo, tipo, sala, estado, descripcion in DISPOSITIVOS:
        get_or_create(
            db,
            Dispositivo,
            codigo_inventario=codigo,
            defaults={
                "tipo": tipos[tipo],
                "sala": salas[sala],
                "estado": estados[estado],
                "descripcion": descripcion,
            },
        )


def seed_reportes(db: Session, autor: Usuario) -> None:
    estados = {e.nombre: e for e in db.scalars(select(EstadoReporte))}
    prioridades = {p.nombre: p for p in db.scalars(select(Prioridad))}

    for codigo, titulo, descripcion, estado, prioridad in REPORTES:
        dispositivo = db.scalars(
            select(Dispositivo).filter_by(codigo_inventario=codigo)
        ).one()
        get_or_create(
            db,
            Reporte,
            titulo=titulo,
            dispositivo_id=dispositivo.id,
            defaults={
                "descripcion": descripcion,
                "creado_por": autor,
                "estado": estados[estado],
                "prioridad": prioridades.get(prioridad),
                "finalizado_en": datetime.now(UTC) if estado == "resuelto" else None,
            },
        )
        recalcular_estado_dispositivo(db, dispositivo)


def main() -> None:
    with SessionLocal() as db:
        seed_catalogos(db)
        tecnico = seed_tecnico(db)
        seed_demo(db)
        if tecnico is not None:
            seed_reportes(db, tecnico)
        db.commit()
    engine.dispose()
    print("Seed completado")


if __name__ == "__main__":
    main()
