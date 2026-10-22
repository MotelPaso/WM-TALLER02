import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Dispositivo, DispositivoFiltros } from '../models';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class DispositivosService {
  private readonly http = inject(HttpClient);

  listar(filtros: DispositivoFiltros = {}): Observable<Dispositivo[]> {
    let params = new HttpParams();
    if (filtros.q) {
      params = params.set('q', filtros.q);
    }
    if (filtros.estado && filtros.estado !== 'todos') {
      params = params.set('estado', filtros.estado);
    }
    return this.http.get<Dispositivo[]>(`${API}/dispositivos`, { params });
  }
}
