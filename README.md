# WM-TALLER02

Proyecto con frontend en Angular y backend en FastAPI.

## Requisitos

- Node.js y npm
- Angular CLI (`npm install -g @angular/cli`)
- Python 3.14
- [uv](https://docs.astral.sh/uv/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

## Estructura del proyecto

- `frontend/` — aplicación Angular
- `backend/` — API con FastAPI

## Frontend

### Instalar dependencias

```bash
cd frontend
npm install
```

### Correr el frontend

```bash
ng serve
```

La aplicación queda disponible en http://localhost:4200

### Build

```bash
ng build
```

### Tests

```bash
ng test
```

### Generar componentes

```bash
ng generate component nombre
```

## Backend

Todos los comandos se ejecutan desde `backend/`.

```bash
cd backend
```

### 1. Instalar dependencias

```bash
uv sync
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env      # Windows: copy .env.example .env
```

Completa `.env` con tus valores. Este archivo no se sube al repositorio.

### 3. Levantar la base de datos

```bash
docker compose up -d --wait
```

### 4. Crear las tablas y cargar datos iniciales

```bash
uv run init-db
uv run seed
```

`seed` carga los catálogos, el técnico inicial (`SEED_TECNICO_*` del `.env`) y dispositivos de demo.

### 5. Levantar la API

```bash
uv run fastapi dev src/backend/main.py
```

- API: http://localhost:8000
- Documentación: http://localhost:8000/docs
- Estado: http://localhost:8000/health

### Uso diario

```bash
docker compose up -d
uv run fastapi dev src/backend/main.py
```

### Apagar la base de datos

```bash
docker compose down        # conserva los datos
docker compose down -v     # borra todos los datos
```
