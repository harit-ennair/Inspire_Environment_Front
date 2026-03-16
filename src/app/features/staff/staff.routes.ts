import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';
import { NavbarComponent } from '../layout/navbar/navbar';

export const STAFF_ROUTES: Routes = [
  {
    path: '',
    component: NavbarComponent,
    canActivate: [roleGuard],
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
          import('./presence/presence').then(m => m.Presence),
      },
    ]
  },
];
