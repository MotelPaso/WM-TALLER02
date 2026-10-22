import { Routes } from '@angular/router';

import { authGuard } from './guards/auth.guard';
import { Login } from './pages/login/login';
import { DispositivosList } from './pages/dispositivos-list/dispositivos-list';
import { Reportes } from './pages/reportes/reportes';

export const routes: Routes = [
  { path: 'login', component: Login, title: 'Iniciar sesión' },
  { path: 'dispositivos', component: DispositivosList, title: 'Dispositivos', canActivate: [authGuard] },
  { path: 'reportes', component: Reportes, title: 'Reportes', canActivate: [authGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'dispositivos' },
  { path: '**', redirectTo: 'dispositivos' },
];
