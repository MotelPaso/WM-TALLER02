import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { Login } from './pages/login/login';
import { DispositivosList } from './pages/dispositivos-list/dispositivos-list';
import { DispositivoFicha } from './pages/dispositivo-ficha/dispositivo-ficha';
import { DispositivoForm } from './pages/dispositivo-form/dispositivo-form';
import { Reportes } from './pages/reportes/reportes';
import { Registro } from './pages/registro/registro';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Iniciar sesión' },
  { path: 'registro', component: Registro, title: 'Registrar' },
  {
    path: 'dispositivos',
    component: DispositivosList,
    title: 'Dispositivos',
    canActivate: [authGuard],
  },
  {
    path: 'dispositivos/nuevo',
    component: DispositivoForm,
    title: 'Nuevo dispositivo',
    canActivate: [authGuard],
  },
  {
    path: 'dispositivos/:id',
    component: DispositivoFicha,
    title: 'Dispositivo',
    canActivate: [authGuard],
  },
  {
    path: 'dispositivos/:id/editar',
    component: DispositivoForm,
    title: 'Editar dispositivo',
    canActivate: [authGuard],
  },
  { path: 'reportes', component: Reportes, title: 'Reportes', canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dispositivos' },
  { path: '**', redirectTo: 'dispositivos' },
];
