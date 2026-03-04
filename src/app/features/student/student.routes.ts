import { Routes } from '@angular/router';

export const STUDENT_ROUTES: Routes = [
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
    path: 'tasks',
    loadComponent: () =>
      import('./tasks/tasks').then(m => m.Tasks),
  },
  {
    path: 'submissions',
    loadComponent: () =>
      import('./submissions/submissions').then(m => m.Submissions),
  },
];
