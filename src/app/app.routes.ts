import { Routes } from '@angular/router';
import { AuthGuard } from './auth/services/auth.guard';
import { inject } from '@angular/core';

// TODO togliere mock
// export const routes: Routes = [
//   {
//     path: '',
//     loadChildren: () => import('./auth/auth.routes').then((r) => r.authRoutes),
//   },
//   {
//     path: 'dashboard',
//     loadChildren: () =>
//       import('./dashboard/dashboard.routes').then((r) => r.dashboardRoutes),
//     canActivate: [() => inject(AuthGuard).canActivate()],
//   },
// ];

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./dashboard/dashboard.routes').then((r) => r.dashboardRoutes),
  },
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.routes').then((r) => r.authRoutes),
  },
];
