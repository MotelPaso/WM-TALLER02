from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.database.config import settings
from backend.database.session import SessionLocal, engine
from backend.models import (
    Dispositivo, Edificio, EstadoDispositivo, EstadoReporte,
    Prioridad, Rol, Sala, TipoDispositivo, Usuario,
)
from backend.security import hash_password

ROLES = ["usuario", "tecnico"]
ESTADOS_DISPOSITIVO = ["operativo", "con_falla", "en_reparacion", "fuera_de_servicio"]
ESTADOS_REPORTE = ["abierto", "en_proceso", "resuelto"]
PRIORIDADES = [("baja", 1), ("media", 2), ("alta", 3)]
TIPOS_DISPOSITIVO = [
    "Computador", "Monitor", "Proyector", "Impresora",
    "Pantalla", "Audio", "Cámara", "Punto WiFi",
]

SALAS = {
    "X1": ["29", "30", "31"],
    "Y1": ["101", "102"],
    "LC": ["201"],
}

DISPOSITIVOS = [
    ("UCN-004501", "Proyector", "29", "operativo", "Proyector de techo"),
    ("UCN-004502", "Computador", "29", "operativo", "PC del docente"),
    ("UCN-004503", "Audio", "29", "operativo", "Parlantes y micrófono"),
    ("UCN-004504", "Proyector", "30", "operativo", "Proyector de techo"),
    ("UCN-004505", "Computador", "30", "operativo", "PC del docente"),
    ("UCN-004506", "Pantalla", "31", "operativo", "Pantalla interactiva"),
    ("UCN-004507", "Cámara", "31", "operativo", "Cámara para clases híbridas"),
    ("UCN-004508", "Computador", "101", "operativo", "Laboratorio, puesto 1"),
    ("UCN-004509", "Computador", "101", "operativo", "Laboratorio, puesto 2"),
    ("UCN-004510", "Monitor", "101", "operativo", "Monitor del puesto 1"),
    ("UCN-004511", "Impresora", "102", "operativo", "Impresora láser"),
    ("UCN-004512", "Punto WiFi", "102", "operativo", None),
    ("UCN-004513", "Proyector", "201", "fuera_de_servicio", "Lámpara quemada, pendiente de baja"),
    ("UCN-004514", "Punto WiFi", "201", "operativo", None),
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


def seed_tecnico(db: Session) -> None:
    nombre = settings.seed_tecnico_nombre
    correo = settings.seed_tecnico_correo
    contrasena = settings.seed_tecnico_contrasena
    if not (nombre and correo and contrasena):
        print("Sin SEED_TECNICO_* en .env: no se crea el técnico inicial")
        return

    rol = get_or_create(db, Rol, nombre="tecnico")
    get_or_create(
        db, Usuario, correo=correo.strip().lower(),
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
            salas[numero] = get_or_create(db, Sala, numero=numero, defaults={"edificio": edificio})

    tipos = {t.nombre: t for t in db.scalars(select(TipoDispositivo))}
    estados = {e.nombre: e for e in db.scalars(select(EstadoDispositivo))}
    for codigo, tipo, sala, estado, descripcion in DISPOSITIVOS:
        get_or_create(
            db, Dispositivo, codigo_inventario=codigo,
            defaults={
                "tipo": tipos[tipo],
                "sala": salas[sala],
                "estado": estados[estado],
                "descripcion": descripcion,
            },
        )


def main() -> None:
    with SessionLocal() as db:
        seed_catalogos(db)
        seed_tecnico(db)
        seed_demo(db)
        db.commit()
    engine.dispose()
    print("Seed completado")


if __name__ == "__main__":
    main()
