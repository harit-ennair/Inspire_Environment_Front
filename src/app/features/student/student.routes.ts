import { Routes } from '@angular/router';
import { LAYOUT_ROUTES } from '../layout/layout.routes';
import { roleGuard } from '../../core/guards/role.guard';

export const STUDENT_ROUTES: Routes = [
  {
    ...LAYOUT_ROUTES.find(r => r.path === 'student')!,
    path: '',
    canActivate: [roleGuard],
    data: { roles: ['student', 'staff','admin'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'presence',
        loadComponent: () =>
          import('./presence/presence').then(m => m.Presence),
      },
      {
        path: 'activities',
        loadComponent: () =>
          import('./activities/activities').then(m => m.Activities),
      },
    ]
  },
];
