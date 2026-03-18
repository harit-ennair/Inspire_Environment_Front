import { Routes } from '@angular/router';
import { NavbarComponent } from './features/layout/navbar/navbar';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  // ==========================================
  // DEFAULT REDIRECT
  // ==========================================
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  {
    path: 'dashboard',
    component: NavbarComponent,
    canActivate: [roleGuard],
    data: { roles: ['staff','admin'] },
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile/profile').then(m => m.Profile),
      },
      {
        path: 'profile/edit',
        loadComponent: () =>
          import('./features/profile/profile-form/profile-form').then(m => m.ProfileForm),
      }
    ]
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
    canActivate: [roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // ==========================================
  // STAFF ROUTES
  // ==========================================
  {
    path: 'staff',
    canActivate: [roleGuard],
    data: { roles: ['staff','admin'] },
    loadChildren: () =>
      import('./features/staff/staff.routes').then(m => m.STAFF_ROUTES)
  },

  // ==========================================
  // STUDENT ROUTES
  // ==========================================
  {
    path: 'student',
    canActivate: [roleGuard],
    data: { roles: ['student','staff','admin'] },
    loadChildren: () =>
      import('./features/student/student.routes').then(m => m.STUDENT_ROUTES)
  },

  // ==========================================
  // FALLBACK ROUTE
  // ==========================================
  {
    path: '403',
    loadComponent: () => import('./features/page-error403/page-error403').then(m => m.PageError403)
  },
  {
    path: '**',
    loadComponent: () => import('./features/page-error404/page-error404').then(m => m.PageError404)
  }
];
