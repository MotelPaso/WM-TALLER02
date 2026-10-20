import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Equipo, EquipoFiltros } from '../models';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class EquiposService {
  private readonly http = inject(HttpClient);

  listar(filtros: EquipoFiltros = {}): Observable<Equipo[]> {
    let params = new HttpParams();
    if (filtros.q) {
      params = params.set('q', filtros.q);
    }
    if (filtros.estado && filtros.estado !== 'todos') {
      params = params.set('estado', filtros.estado);
    }
    return this.http.get<Equipo[]>(`${API}/equipos`, { params });
  }
}
