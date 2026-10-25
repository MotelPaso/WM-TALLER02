import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { switchMap, tap } from 'rxjs';

import { LoginResponse, User } from '../models';

import { API } from './api';

const TOKEN_KEY = 'reportaucn.token';
const USER_KEY = 'reportaucn.usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  // Regenera la sesión desde localStorage para sobrevivir recargas de página.
  private readonly _usuario = signal<User | null>(this.restaurarSesion());

  /** Usuario de la sesión actual, o null si nadie inició sesión. */
  readonly usuario = this._usuario.asReadonly();

  get sesionIniciada(): boolean {
    return this._usuario() !== null;
  }

  get esTecnico(): boolean {
    return this._usuario()?.rol.nombre === 'tecnico';
  }

  login(correo: string, contrasena: string) {
    const body = new HttpParams().set('username', correo).set('password', contrasena);
    return this.http.post<LoginResponse>(`${API}/auth/login`, body).pipe(
      tap((res) => localStorage.setItem(TOKEN_KEY, res.access_token)),
      switchMap(() => this.http.get<User>(`${API}/auth/me`)),
      tap((user) => this.guardarSesion(user)),
    );
  }

  register(nombre: string, correo: string, contrasena: string) {
    const body = { nombre: nombre, correo: correo, contrasena: contrasena };
    return this.http
      .post<User>(`${API}/auth/register`, body)
      .pipe(switchMap(() => this.login(correo, contrasena)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._usuario.set(null);
  }

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private guardarSesion(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this._usuario.set(user);
  }

  private restaurarSesion(): User | null {
    const guardado = localStorage.getItem(USER_KEY);
    if (!guardado) return null;
    try {
      return JSON.parse(guardado) as User;
    } catch {
      return null;
    }
  }
}
