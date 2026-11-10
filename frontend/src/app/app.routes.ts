import { Routes } from '@angular/router';

import { authGuard, logged, tecnicoGuard } from './guards/auth.guard';
import { Login } from './pages/login/login';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
    title: 'Iniciar sesión',
    canActivate: [logged],
  },
  {
    path: 'registro',
    loadComponent: () => import('./pages/registro/registro').then((m) => m.Registro),
    title: 'Registrar',
  },
  {
    path: 'dispositivos',
    loadComponent: () =>
      import('./pages/dispositivos-list/dispositivos-list').then((m) => m.DispositivosList),
    title: 'Dispositivos',
    canActivate: [authGuard],
  },
  {
    path: 'dispositivos/nuevo',
    loadComponent: () =>
      import('./pages/dispositivo-form/dispositivo-form').then((m) => m.DispositivoForm),
    title: 'Nuevo dispositivo',
    canActivate: [authGuard, tecnicoGuard],
  },
  {
    path: 'dispositivos/:id',
    loadComponent: () =>
      import('./pages/dispositivo-ficha/dispositivo-ficha').then((m) => m.DispositivoFicha),
    title: 'Dispositivo',
    canActivate: [authGuard],
  },
  {
    path: 'dispositivos/:id/editar',
    loadComponent: () =>
      import('./pages/dispositivo-form/dispositivo-form').then((m) => m.DispositivoForm),
    title: 'Editar dispositivo',
    canActivate: [authGuard, tecnicoGuard],
  },
  {
    path: 'reportes',
    loadComponent: () => import('./pages/reportes/reportes').then((m) => m.Reportes),
    title: 'Reportes',
    canActivate: [authGuard],
  },
  { path: '', pathMatch: 'full', redirectTo: 'dispositivos' },
  { path: '**', redirectTo: 'dispositivos' },
];
