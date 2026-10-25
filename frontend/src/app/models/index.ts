// Contrato asumido con el backend (FastAPI). Si el backend usa
// otros nombres de campos, se ajustan aquí.
export type RolUsuario = 'usuario' | 'tecnico';
export type EstadoDispositivo = 'operativo' | 'con_falla' | 'en_reparacion' | 'fuera_de_servicio';
export type EstadoReporte = 'abierto' | 'en_proceso' | 'resuelto';
export type PrioridadReporte = 'baja' | 'media' | 'alta';

export interface Rol {
  id: number;
  nombre: RolUsuario;
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
  nombre: string;
  tipo: string;
  edificio: string;
  sala: string;
  estado: EstadoDispositivo;
}

export interface DispositivoFiltros {
  q?: string;
  estado?: EstadoDispositivo | 'todos';
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

export interface EstadoDispositivoEtiqueta {
  valor: EstadoDispositivo;
  etiqueta: string;
}

export const ESTADOS_DISPOSITIVO: EstadoDispositivoEtiqueta[] = [
  { valor: 'operativo', etiqueta: 'Operativo' },
  { valor: 'con_falla', etiqueta: 'Con falla' },
  { valor: 'en_reparacion', etiqueta: 'En reparación' },
  { valor: 'fuera_de_servicio', etiqueta: 'Fuera de servicio' },
];

export const ESTADOS_REPORTE: EstadoReporte[] = ['abierto', 'en_proceso', 'resuelto'];
export const PRIORIDADES_REPORTE: PrioridadReporte[] = ['baja', 'media', 'alta'];

export function etiquetaEstadoDispositivo(estado: EstadoDispositivo): string {
  return ESTADOS_DISPOSITIVO.find((e) => e.valor === estado)?.etiqueta ?? estado;
}

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
