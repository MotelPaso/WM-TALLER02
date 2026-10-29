// Contrato asumido con el backend (FastAPI). Si el backend usa

// otros nombres de campos, se ajustan aquí.
export type RolUsuario = 'usuario' | 'tecnico';

export type EstadoReporte = 'abierto' | 'en_proceso' | 'resuelto';
export type PrioridadReporte = 'baja' | 'media' | 'alta';

export interface Rol {
  id: number;
  nombre: RolUsuario;
}

export interface TipoDispositivo {
  id: number;
  nombre: string;
}

export interface EstadoDispositivo {
  id: number;
  nombre: string;
}
export interface OpcionFiltro {
  id: number;
  label: string;
}

export interface User {
  id: number;
  nombre: string;
  correo: string;
  activo: boolean;
  rol: Rol;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface Dispositivo {
  id: number;
  codigo_inventario: string;
  descripcion: string;
  tipo: TipoDispositivo;
  sala: Sala;
  estado: EstadoDispositivo;
}

export interface Sala {
  id: number;
  codigo: string;
  numero: string;
  edificio: Edificio;
}

export interface Edificio {
  id: number;
  numero: string;
}

export interface DispositivoFiltros {
  sala_id?: number;
  tipo_id?: number;
  q?: string;
  estado?: string;
}

export interface Reporte {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadReporte;
  estado: EstadoReporte;
  dispositivo_id: number;
  usuario_id: number;
  usuario_nombre?: string;
  dispositivo_nombre?: string;
  creado_en: string;
}

export const ESTADOS_REPORTE: EstadoReporte[] = ['abierto', 'en_proceso', 'resuelto'];
export const PRIORIDADES_REPORTE: PrioridadReporte[] = ['baja', 'media', 'alta'];

export function etiquetaEstadoReporte(estado: EstadoReporte): string {
  switch (estado) {
    case 'abierto':
      return 'Abierto';
    case 'en_proceso':
      return 'En proceso';
    case 'resuelto':
      return 'Resuelto';
  }
}

export function etiquetaPrioridad(prioridad: PrioridadReporte): string {
  return prioridad.charAt(0).toUpperCase() + prioridad.slice(1);
}
