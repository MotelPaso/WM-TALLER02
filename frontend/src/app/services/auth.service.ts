import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';

import { LoginResponse, User } from '../models';

const API = '/api';
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
    return this._usuario()?.rol === 'tecnico';
  }

  login(correo: string, contrasena: string) {
    return this.http
      .post<LoginResponse>(`${API}/auth/login`, { correo, contrasena })
      .pipe(tap((res) => this.guardarSesion(res.user, res.token)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._usuario.set(null);
  }

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private guardarSesion(user: User, token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
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
