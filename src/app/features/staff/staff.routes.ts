import { Routes } from '@angular/router';

export const STAFF_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/staff-layout').then(m => m.StaffLayout),
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
