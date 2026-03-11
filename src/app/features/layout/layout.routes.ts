import { Routes } from '@angular/router';

export const LAYOUT_ROUTES: Routes = [
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin-layout/admin-layout').then(m => m.AdminLayout),
    children: []
  },
  {
    path: 'staff',
    loadComponent: () =>
      import('./staff-layout/staff-layout').then(m => m.StaffLayout),
    children: []
  },
  {
    path: 'student',
    loadComponent: () =>
      import('./student-layout/student-layout').then(m => m.StudentLayout),
    children: []
  }
];
