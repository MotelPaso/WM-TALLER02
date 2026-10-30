// Contrato asumido con el backend (FastAPI). Si el backend usa

// otros nombres de campos, se ajustan aquí.
export type RolUsuario = 'usuario' | 'tecnico';

export interface EstadoReporte {
  id: number;
  nombre: string;
}

export interface PrioridadReporte {
  id: number;
  nivel: number;
  nombre: string;
}

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
  creado_en: string;
}

export interface Sala {
  id: number;
  codigo: string;
  numero: string;
  edificio: Edificio;
}

export interface Edificio {
  id: number;
  nombre: string;
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
  dispositivo: Dispositivo;
  creado_por: CreadoPor;
  estado: EstadoReporte;
  prioridad?: PrioridadReporte;
  creado_en: string;
  actualizado_en?: string;
  finalizado_en?: string;
}

export interface CreadoPor {
  id: number;
  nombre: string;
}

export const ESTADOS_REPORTE: string[] = ['abierto', 'en_proceso', 'resuelto'];
export const PRIORIDADES_REPORTE: string[] = ['baja', 'media', 'alta'];

export function etiquetaEstadoReporte(estado: string): string {
  switch (estado) {
    case 'abierto':
      return 'Abierto';
    case 'en_proceso':
      return 'En proceso';
    case 'resuelto':
      return 'Resuelto';
  }
  return '';
}

export function etiquetaPrioridad(prioridad: PrioridadReporte): string {
  return prioridad.nombre.charAt(0).toUpperCase() + prioridad.nombre.slice(1);
}
