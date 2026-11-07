import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Reporte } from '../models';

import { API } from './api';

export interface ReporteFiltros {
  estado?: string;
  prioridad?: string;
  dispositivo_id?: number;
}

export interface ReporteCreatePayload {
  titulo: string;
  descripcion: string;
  dispositivo_id: number;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);

  listar(filtros?: ReporteFiltros): Observable<Reporte[]> {
    let params = new HttpParams();
    if (filtros?.estado && filtros.estado !== 'todos') {
      params = params.set('estado', filtros.estado);
    }
    if (filtros?.prioridad && filtros.prioridad !== 'todas') {
      params = params.set('prioridad', filtros.prioridad);
    }
    if (filtros?.dispositivo_id != null) {
      params = params.set('dispositivo_id', filtros.dispositivo_id);
    }
    return this.http.get<Reporte[]>(`${API}/reportes`, { params });
  }

  obtener(id: number): Observable<Reporte> {
    return this.http.get<Reporte>(`${API}/reportes/${id}`);
  }

  crear(payload: ReporteCreatePayload): Observable<Reporte> {
    return this.http.post<Reporte>(`${API}/reportes`, payload);
  }

  /** Cambia la prioridad del reporte; el backend valida que sea técnico. */
  cambiarPrioridad(id: number, prioridad_id: number): Observable<Reporte> {
    return this.http.patch<Reporte>(`${API}/reportes/${id}/prioridad`, { prioridad_id });
  }

  /** Cambia el estado del reporte; el backend valida que sea técnico. */
  cambiarEstado(id: number, estado: string): Observable<Reporte> {
    return this.http.patch<Reporte>(`${API}/reportes/${id}/estado`, { estado });
  }

  /** Solo permitido para reportes propios que sigan "abiertos". */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/reportes/${id}`);
  }
}
