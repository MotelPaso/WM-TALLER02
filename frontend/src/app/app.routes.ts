import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { Login } from './pages/login/login';
import { EquiposList } from './pages/equipos-list/equipos-list';
import { Reportes } from './pages/reportes/reportes';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Iniciar sesión' },
  { path: 'equipos', component: EquiposList, title: 'Equipos', canActivate: [authGuard] },
  { path: 'reportes', component: Reportes, title: 'Reportes', canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'equipos' },
  { path: '**', redirectTo: 'equipos' },
];
