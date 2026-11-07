import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import {
  Dispositivo,
  DispositivoCreatePayload,
  DispositivoFiltros,
  DispositivoUpdatePayload,
  Edificio,
  EstadoDispositivo,
  Reporte,
  Sala,
  TipoDispositivo,
} from '../models';

import { API } from './api';

@Injectable({ providedIn: 'root' })
export class DispositivosService {
  private readonly http = inject(HttpClient);

  getDispositivos(filtros: DispositivoFiltros = {}): Observable<Dispositivo[]> {
    let params = new HttpParams();
    if (filtros.q) {
      params = params.set('q', filtros.q);
    }
    if (filtros.estado) {
      params = params.set('estado', filtros.estado ?? 'todos');
    }
    if (filtros.tipo_id != null) {
      params = params.set('tipo_id', filtros.tipo_id);
    }
    if (filtros.sala_id != null) {
      params = params.set('sala_id', filtros.sala_id);
    }
    return this.http.get<Dispositivo[]>(`${API}/dispositivos`, { params });
  }

  getSalas(edificioId?: number): Observable<Sala[]> {
    let params = new HttpParams();
    if (edificioId != null) {
      params = params.set('edificio_id', edificioId);
    }
    return this.http.get<Sala[]>(`${API}/salas`, { params });
  }

  getEdificios(): Observable<Edificio[]> {
    return this.http.get<Edificio[]>(`${API}/edificios`);
  }

  getTiposDispositivo(): Observable<TipoDispositivo[]> {
    return this.http.get<TipoDispositivo[]>(`${API}/catalogos/tipos-dispositivo`);
  }
  getEstados() {
    return this.http.get<EstadoDispositivo[]>(`${API}/catalogos/estados-dispositivo`);
  }
  getDispositivo(id: number): Observable<Dispositivo> {
    return this.http.get<Dispositivo>(`${API}/dispositivos/${id}`);
  }

  getReportesDispositivo(id: number): Observable<Reporte[]> {
    return this.http.get<Reporte[]>(`${API}/dispositivos/${id}/reportes`);
  }

  crearDispositivo(payload: DispositivoCreatePayload): Observable<Dispositivo> {
    return this.http.post<Dispositivo>(`${API}/dispositivos`, payload);
  }

  actualizarDispositivo(id: number, payload: DispositivoUpdatePayload): Observable<Dispositivo> {
    return this.http.patch<Dispositivo>(`${API}/dispositivos/${id}`, payload);
  }

  eliminarDispositivo(id: number): Observable<void> {
    return this.http.delete<void>(`${API}/dispositivos/${id}`);
  }
}
