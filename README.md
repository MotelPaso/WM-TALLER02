# WM-TALLER02

Proyecto con frontend en Angular y backend en FastAPI.

## Requisitos

- Node.js y npm
- Angular CLI (`npm install -g @angular/cli`)
- Python 3.14
- [uv](https://docs.astral.sh/uv/)

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

### Crear el entorno e instalar dependencias

```bash
cd backend
uv venv
uv sync
```

### Correr el backend

```bash
uv run backend
```
