// Contrato asumido con el backend (FastAPI). Si el equipo de backend usa
// otros nombres de campos, se ajustan aquí.
export type RolUsuario = 'usuario' | 'tecnico';
export type EstadoEquipo = 'operativo' | 'con_falla' | 'en_reparacion' | 'fuera_de_servicio';
export type EstadoReporte = 'abierto' | 'en_proceso' | 'resuelto';
export type PrioridadReporte = 'baja' | 'media' | 'alta';

export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: RolUsuario;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Equipo {
  id: number;
  nombre: string;
  tipo: string;
  edificio: string;
  sala: string;
  estado: EstadoEquipo;
}

export interface EquipoFiltros {
  q?: string;
  estado?: EstadoEquipo | 'todos';
}

export interface Reporte {
  id: number;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadReporte;
  estado: EstadoReporte;
  equipo_id: number;
  usuario_id: number;
  usuario_nombre?: string;
  equipo_nombre?: string;
  creado_en: string;
}

export interface EstadoEquipoEtiqueta {
  valor: EstadoEquipo;
  etiqueta: string;
}

export const ESTADOS_EQUIPO: EstadoEquipoEtiqueta[] = [
  { valor: 'operativo', etiqueta: 'Operativo' },
  { valor: 'con_falla', etiqueta: 'Con falla' },
  { valor: 'en_reparacion', etiqueta: 'En reparación' },
  { valor: 'fuera_de_servicio', etiqueta: 'Fuera de servicio' },
];

export const ESTADOS_REPORTE: EstadoReporte[] = ['abierto', 'en_proceso', 'resuelto'];
export const PRIORIDADES_REPORTE: PrioridadReporte[] = ['baja', 'media', 'alta'];

export function etiquetaEstadoEquipo(estado: EstadoEquipo): string {
  return ESTADOS_EQUIPO.find((e) => e.valor === estado)?.etiqueta ?? estado;
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
