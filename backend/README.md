# Backend – ReportaUCN

API REST para reportar fallas en dispositivos tecnológicos de la UCN y hacer seguimiento a su reparación.

**Stack:** FastAPI · SQLAlchemy 2.0 · PostgreSQL 17 · Alembic · JWT (PyJWT) · Argon2 (pwdlib) · uv · Ruff

Para levantar el proyecto completo, ver el [README principal](../README.md).

## Estructura

```
backend/
├── alembic/                 # migraciones del esquema
├── docker-compose.yml       # PostgreSQL para desarrollo
├── Dockerfile               # imagen de la API (usada por el compose de la raíz)
└── src/backend/
    ├── main.py              # app FastAPI, CORS y routers
    ├── security.py          # hash de contraseñas y JWT
    ├── dependencies.py      # sesión de BD, usuario actual y rol técnico
    ├── database/            # configuración (.env), sesión y seed
    ├── models/              # modelos SQLAlchemy (tablas)
    ├── schemas/             # modelos Pydantic (entrada y salida JSON)
    ├── routers/             # endpoints HTTP
    └── services/            # reglas de negocio de estados
```

## Comandos

Desde `backend/`:

| Comando | Qué hace |
|---|---|
| `uv run fastapi dev src/backend/main.py` | API con recarga en http://localhost:8000 |
| `uv run alembic upgrade head` | Aplica las migraciones pendientes |
| `uv run seed` | Carga catálogos, técnico inicial y datos de demo (idempotente) |
| `uv run ruff check --fix .` | Linter (incluye orden de imports) |
| `uv run ruff format .` | Formatea el código |

### Cambiar el modelo de datos

1. Modifica el modelo en `src/backend/models/`.
2. Genera la migración: `uv run alembic revision --autogenerate -m "describe el cambio"`.
3. Revisa el archivo generado en `alembic/versions/` (el autogenerate no detecta renombres).
4. Aplícala: `uv run alembic upgrade head`.

Si tu base de datos se creó antes de usar Alembic, ejecuta una vez `uv run alembic stamp head` (o `docker compose down -v` para empezar de cero).

## Roles

| Rol | Puede |
|---|---|
| `usuario` | Ver dispositivos, reportar fallas, ver sus reportes y eliminar uno propio si sigue abierto |
| `tecnico` | Todo lo anterior, más CRUD de dispositivos, ver todos los reportes, asignar prioridad y cambiar estados |

El registro público siempre crea usuarios con rol `usuario`. El técnico inicial lo crea el seed con las variables `SEED_TECNICO_*` del `.env`.

## Endpoints

Documentación interactiva en http://localhost:8000/docs. Salvo `register`, `login` y `health`, todos requieren `Authorization: Bearer <token>`.

### Autenticación

| Método | Ruta | Detalle |
|---|---|---|
| POST | `/auth/register` | JSON `{nombre, correo, contrasena}` (mín. 8 caracteres) → 201 · 409 si el correo existe |
| POST | `/auth/login` | **Formulario** OAuth2: `username` = correo, `password` → `{access_token, token_type}` |
| GET | `/auth/me` | Usuario actual con su rol |

### Dispositivos

| Método | Ruta | Rol | Detalle |
|---|---|---|---|
| GET | `/dispositivos` | todos | Filtros: `q`, `estado`, `tipo_id`, `edificio_id`, `sala_id` |
| GET | `/dispositivos/{id}` | todos | Ficha del dispositivo |
| GET | `/dispositivos/{id}/reportes` | todos | Historial de reportes |
| POST | `/dispositivos` | técnico | Crea un dispositivo |
| PATCH | `/dispositivos/{id}` | técnico | Edita campos; `fuera_de_servicio: true/false` lo da de baja o lo reactiva |
| DELETE | `/dispositivos/{id}` | técnico | 409 si tiene reportes (se marca fuera de servicio) |

### Reportes

| Método | Ruta | Rol | Detalle |
|---|---|---|---|
| POST | `/reportes` | todos | `{titulo, descripcion, dispositivo_id}`; queda abierto y sin prioridad |
| GET | `/reportes` | todos | Usuario: solo los suyos · Técnico: todos. Filtros: `estado`, `prioridad`, `dispositivo_id` |
| GET | `/reportes/{id}` | todos | 403 si no es suyo y no es técnico |
| PATCH | `/reportes/{id}/prioridad` | técnico | `{prioridad_id}` |
| PATCH | `/reportes/{id}/estado` | técnico | `{estado: "en_proceso" \| "resuelto"}` |
| DELETE | `/reportes/{id}` | dueño | Solo si sigue abierto |

### Catálogos y ubicación

`GET /catalogos/tipos-dispositivo`, `/catalogos/estados-dispositivo`, `/catalogos/estados-reporte`, `/catalogos/prioridades`, `/edificios` y `/salas?edificio_id=`.

## Reglas de negocio

- Los estados de un reporte solo avanzan: `abierto` → `en_proceso` → `resuelto`. Para avanzar un reporte abierto, primero hay que asignarle prioridad.
- Al resolver un reporte se registra `finalizado_en`.
- El estado del dispositivo se recalcula con **todos** sus reportes pendientes: si alguno está en proceso queda `en_reparacion`, si solo hay abiertos queda `con_falla` y si no hay pendientes vuelve a `operativo`. `fuera_de_servicio` es manual y no se recalcula.
- Un dispositivo con reportes no se elimina, y un usuario se desactiva (`activo = false`) en vez de borrarse.

## Errores

`detail` siempre viene en español.

| Código | Cuándo |
|---|---|
| 401 | Sin token, token inválido o credenciales incorrectas |
| 403 | No tienes el rol o el recurso no es tuyo |
| 404 | El recurso no existe |
| 409 | Duplicado, regla de negocio o registro en uso |
| 422 | Datos inválidos (validación de Pydantic) |
