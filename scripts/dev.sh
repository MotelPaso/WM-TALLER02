#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/backend"
FRONTEND="$ROOT/frontend"
FORCE_INIT=false
API_HOST="${API_HOST:-0.0.0.0}"
SERVICE_PIDS=()
CLEANED=0

usage() {
  cat <<'EOF'
Uso: ./scripts/dev.sh [--init]

  --init   Fuerza la creación de tablas y la carga de datos iniciales (seed).
  -h, --help
           Muestra esta ayuda.

Variables de entorno:
  API_HOST Interfaz donde escucha la API (por defecto 0.0.0.0, accesible desde
           la red). Usa API_HOST=127.0.0.1 para dejarla solo en localhost.

Levanta PostgreSQL (Docker), la API (FastAPI) y el frontend (Angular) con
logs etiquetados [api] y [web]. Ctrl+C detiene la API y el frontend; la base
de datos sigue corriendo.
EOF
}

die() {
  printf '[dev] Error: %s\n' "$*" >&2
  exit 1
}

for arg in "$@"; do
  case "$arg" in
    --init) FORCE_INIT=true ;;
    -h|--help) usage; exit 0 ;;
    *) usage >&2; die "opción desconocida: $arg" ;;
  esac
done

for cmd in docker uv npm sed pgrep; do
  command -v "$cmd" >/dev/null 2>&1 || die "no se encontró '$cmd' en el PATH"
done

docker info >/dev/null 2>&1 || die "Docker no está corriendo. Inicia Docker Desktop y vuelve a intentarlo."
[[ -f "$BACKEND/.env" ]] || die "falta backend/.env. Créalo con: cp backend/.env.example backend/.env"

compose() {
  (cd "$BACKEND" && docker compose "$@")
}

port_in_use() {
  (exec 3<>"/dev/tcp/127.0.0.1/$1") >/dev/null 2>&1
}

for port in 8000 4200; do
  if port_in_use "$port"; then
    die "el puerto $port ya está en uso. Detén el proceso que lo ocupa y vuelve a intentarlo."
  fi
done

kill_tree() {
  local pid="$1" child
  for child in $(pgrep -P "$pid" 2>/dev/null || true); do
    kill_tree "$child"
  done
  kill -TERM "$pid" 2>/dev/null || true
}

cleanup() {
  (( CLEANED )) && return
  CLEANED=1
  trap - EXIT INT TERM
  printf '\n[dev] Deteniendo API y frontend...\n'
  if (( ${#SERVICE_PIDS[@]} )); then
    for pid in "${SERVICE_PIDS[@]}"; do
      kill_tree "$pid"
    done
  fi
  wait 2>/dev/null || true
  for _ in {1..25}; do
    port_in_use 8000 || port_in_use 4200 || break
    sleep 0.2
  done
  printf '[dev] Listo. PostgreSQL sigue corriendo (para apagarlo: cd backend && docker compose down).\n'
}

trap cleanup EXIT
trap 'cleanup; exit 130' INT
trap 'cleanup; exit 143' TERM

start_service() {
  local name="$1" dir="$2"
  shift 2
  (cd "$dir" && exec "$@") > >(sed -u "s/^/[$name] /") 2>&1 &
  SERVICE_PIDS+=("$!")
}

if [[ ! -d "$BACKEND/.venv" ]]; then
  printf '[dev] Instalando dependencias del backend (uv sync)...\n'
  (cd "$BACKEND" && uv sync)
fi

if [[ ! -d "$FRONTEND/node_modules" ]]; then
  printf '[dev] Instalando dependencias del frontend (npm install)...\n'
  (cd "$FRONTEND" && npm install)
fi

printf '[dev] Levantando PostgreSQL...\n'
compose up -d --wait

printf '[dev] Preparando la base de datos...\n'
(cd "$BACKEND" && uv run alembic upgrade head)

roles_count="$(compose exec -T db sh -lc 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -tAc "SELECT COUNT(*) FROM roles"' 2>/dev/null | tr -d '[:space:]' || true)"
if [[ "$FORCE_INIT" == true || -z "$roles_count" || "$roles_count" == "0" ]]; then
  printf '[dev] Cargando datos iniciales (seed)...\n'
  (cd "$BACKEND" && uv run seed)
fi

printf '[dev] Iniciando API en http://localhost:8000 (docs en /docs)\n'
if [[ "$API_HOST" != "127.0.0.1" && "$API_HOST" != "localhost" ]]; then
  api_ip="$(tailscale ip -4 2>/dev/null | head -n1 || true)"
  [[ -n "$api_ip" ]] && printf '[dev] API accesible por Tailscale: http://%s:8000 (docs en /docs)\n' "$api_ip"
fi
start_service api "$BACKEND" uv run fastapi dev src/backend/main.py --host "$API_HOST" --port 8000

printf '[dev] Iniciando frontend en http://localhost:4200\n'
start_service web "$FRONTEND" npm start

printf '[dev] Todo listo. Ctrl+C para detener API y frontend.\n'

set +e
wait -n
status=$?
set -e

if (( status != 0 )); then
  printf '[dev] Un servicio terminó con código %s. Deteniendo el resto...\n' "$status"
fi

exit "$status"
