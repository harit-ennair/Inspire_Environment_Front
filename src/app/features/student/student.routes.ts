import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { NavbarComponent } from '../layout/navbar/navbar';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    component: NavbarComponent,
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
      {
        path: 'profile',
        loadComponent: () =>
          import('../profile/profile/profile').then(m => m.Profile),
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('../profile/profile-form/profile-form').then(m => m.ProfileForm),
      },
    ]
  },
];
