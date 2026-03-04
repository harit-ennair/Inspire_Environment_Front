import { Routes } from '@angular/router';

export const routes: Routes = [
  // ==========================================
  // DEFAULT REDIRECT
  // ==========================================
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // ==========================================
  // AUTHENTICATION ROUTES
  // ==========================================
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },

  // ==========================================
  // ADMIN ROUTES
  // ==========================================
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // ==========================================
  // STAFF ROUTES
  // ==========================================
  {
    path: 'staff',
    loadChildren: () =>
      import('./features/staff/staff.routes').then(m => m.STAFF_ROUTES)
  },

  // ==========================================
  // STUDENT ROUTES
  // ==========================================
  {
    path: 'student',
    loadChildren: () =>
      import('./features/student/student.routes').then(m => m.STUDENT_ROUTES)
  },

  // ==========================================
  // FALLBACK ROUTE
  // ==========================================
  {
    path: '**',
    loadComponent: () => import('./features/page-error404/page-error404').then(m => m.PageError404)
  }
];
