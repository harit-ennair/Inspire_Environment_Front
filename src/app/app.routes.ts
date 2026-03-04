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
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadComponent: () => import('./features/student/dashboard/dashboard').then(m => m.Dashboard)
      },

      // Activities
      {
        path: 'activities',
        loadComponent: () => import('./features/student/activities/activities').then(m => m.Activities)
      },

      // Tasks
      {
        path: 'tasks',
        loadComponent: () => import('./features/student/tasks/tasks').then(m => m.Tasks)
      },

      // Submissions
      {
        path: 'submissions',
        loadComponent: () => import('./features/student/submissions/submissions').then(m => m.Submissions)
      }
    ]
  },

  // ==========================================
  // FALLBACK ROUTE
  // ==========================================
  {
    path: '**',
    redirectTo: '/login'
  }
];
