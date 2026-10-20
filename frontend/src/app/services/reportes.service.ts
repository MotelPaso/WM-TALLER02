import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { EstadoReporte, Reporte } from '../models';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);

  listar(): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(`${API}/reportes`);
  }

  /** Cambia el estado del reporte; el backend debe validar que sea técnico. */
  cambiarEstado(id: number, estado: EstadoReporte): Observable<Reporte> {
    return this.http.patch<Reporte>(`${API}/reportes/${id}`, { estado });
  }

  /** Solo permitido para reportes propios que sigan "abiertos". */
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/reportes/${id}`);
  }
}
