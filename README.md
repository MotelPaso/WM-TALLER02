# WM-TALLER02 – ReportaUCN

App web para reportar fallas en dispositivos tecnológicos de la UCN (computadores, proyectores, impresoras, etc.) y hacer seguimiento a su reparación. Los usuarios reportan fallas y los técnicos gestionan los dispositivos, asignan prioridades y cambian el estado de los reportes.

**Stack:** Angular + Angular Material · FastAPI · PostgreSQL 17 con SQLAlchemy y Alembic · JWT

## Estructura del proyecto

- `frontend/` — aplicación Angular
- `backend/` — API con FastAPI (endpoints y reglas de negocio en [backend/README.md](backend/README.md))
- `scripts/dev.sh` — levanta todo en modo desarrollo
- `docs/` — diagrama entidad-relación

## Opción 1: levantar todo con Docker

Solo requiere [Docker](https://www.docker.com/products/docker-desktop/). Funciona en Linux, macOS y Windows. Desde la raíz del proyecto:

```bash
cp backend/.env.example backend/.env   # Windows: copy backend\.env.example backend\.env
```

Completa `backend/.env`: `SECRET_KEY` (mínimo 32 caracteres) y los datos del técnico inicial (`SEED_TECNICO_*`). Luego:

```bash
docker compose up -d --build
```

- Frontend: http://localhost:4200
- API: http://localhost:8000 · Documentación: http://localhost:8000/docs

Al arrancar se aplican las migraciones y se cargan los datos iniciales. Para apagar: `docker compose down` (con `-v` también borra la base de datos).

## Cuentas para probar

- **Técnico:** el correo y la contraseña de `SEED_TECNICO_CORREO` y `SEED_TECNICO_CONTRASENA` en `backend/.env`.
- **Usuario:** créalo desde la pantalla de registro. El registro siempre crea cuentas con rol `usuario`.

## Opción 2: desarrollo

### Requisitos

- Node.js y npm
- Python 3.14
- [uv](https://docs.astral.sh/uv/)
- [Docker](https://www.docker.com/products/docker-desktop/) (para PostgreSQL)

No uses esta opción al mismo tiempo que la de Docker: las dos ocupan los puertos 4200 y 8000.

### Uso rápido

Con Docker corriendo y `backend/.env` creado (ver [Backend](#backend)), desde la raíz del proyecto:

```bash
./scripts/dev.sh
```

El script:

- levanta PostgreSQL con Docker y espera a que esté sano,
- instala las dependencias si faltan (`uv sync` y `npm install`),
- aplica las migraciones (`alembic upgrade head`) y carga el seed solo si la base está vacía,
- inicia la API y el frontend con recarga automática y logs etiquetados `[api]` y `[web]`.

- Frontend: http://localhost:4200
- API: http://localhost:8000 · Documentación: http://localhost:8000/docs

`Ctrl+C` detiene la API y el frontend; PostgreSQL sigue corriendo para el próximo arranque. Para apagarlo: `cd backend && docker compose down`.

Para volver a cargar el seed aunque la base ya tenga datos: `./scripts/dev.sh --init`.

El script es para bash y no funciona en Windows nativo. En Windows usa WSL, la opción con Docker o los comandos manuales de abajo.

### Frontend

Desde `frontend/`:

```bash
npm install
npm start
```

La aplicación queda en http://localhost:4200. `npm start` usa `proxy.conf.json` para redirigir `/api` al backend en `localhost:8000`; con `ng serve` a secas las llamadas a la API fallan.

| Comando | Qué hace |
|---|---|
| `npm run build` | Build de producción |
| `npm test` | Tests |
| `npx ng generate component nombre` | Genera un componente |

### Backend

Todos los comandos se ejecutan desde `backend/`.

```bash
cd backend
```

#### 1. Instalar dependencias

```bash
uv sync
```

#### 2. Configurar variables de entorno

```bash
cp .env.example .env      # Windows: copy .env.example .env
```

Completa `.env` con tus valores. Este archivo no se sube al repositorio.

#### 3. Levantar la base de datos

```bash
docker compose up -d --wait
```

#### 4. Crear las tablas y cargar datos iniciales

```bash
uv run alembic upgrade head
uv run seed
```

`seed` carga los catálogos, el técnico inicial (`SEED_TECNICO_*` del `.env`) y dispositivos de demo. Se puede ejecutar varias veces sin duplicar datos.

#### 5. Levantar la API

```bash
uv run fastapi dev src/backend/main.py
```

- API: http://localhost:8000
- Documentación: http://localhost:8000/docs
- Estado: http://localhost:8000/health

#### Uso diario

```bash
docker compose up -d
uv run alembic upgrade head   # aplica migraciones nuevas que hayan subido otros
uv run fastapi dev src/backend/main.py
```

#### Apagar la base de datos

```bash
docker compose down        # conserva los datos
docker compose down -v     # borra todos los datos
```
