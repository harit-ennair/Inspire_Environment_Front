import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { NavbarComponent } from '../layout/navbar/navbar';

export const STAFF_ROUTES: Routes = [
  {
    path: '',
    component: NavbarComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['staff', 'admin'] },
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'students',
        loadComponent: () =>
          import('./students/studentsList/students').then(m => m.StudentsList),
      },
      {
        path: 'students/create',
        loadComponent: () =>
          import('./students/studentsForm/students').then(m => m.StudentsForm),
      },
      {
        path: 'students/edit/:id',
        loadComponent: () =>
          import('./students/studentsForm/students').then(m => m.StudentsForm),
      },
      {
        path: 'activities',
        loadChildren: () =>
          import('./activities/activities.routes').then(m => m.ACTIVITIES_ROUTES),
      },
      {
        path: 'presence',
        loadComponent: () =>
          import('./presence/presenceList/presence').then(m => m.Presence),
      },
      {
        path: 'presence/create',
        loadComponent: () =>
          import('./presence/presence-form/presence-form').then(m => m.PresenceForm),
      },
      {
        path: 'presence/edit/:id',
        loadComponent: () =>
          import('./presence/presence-form/presence-form').then(m => m.PresenceForm),
      },
    ]
  },
];
