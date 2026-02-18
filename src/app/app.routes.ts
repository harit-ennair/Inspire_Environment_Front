import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default redirect
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },

  // Auth routes
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
  },

  // Admin routes
  {
    path: 'admin',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'program',
        loadComponent: () => import('./features/admin/program/program').then(m => m.Program)
      },
      {
        path: 'roles',
        loadComponent: () => import('./features/admin/role/rolesList/roles').then(m => m.RolesList)
      },
      {
        path: 'roles/create',
        loadComponent: () => import('./features/admin/role/rolesForm/roles').then(m => m.RolesForm)
      },
      {
        path: 'roles/edit/:id',
        loadComponent: () => import('./features/admin/role/rolesForm/roles').then(m => m.RolesForm)
      },
      {
        path: 'departments',
        loadComponent: () => import('./features/admin/departments/departmentsList/departments').then(m => m.DepartmentsList)
      },
      {
        path: 'departments/create',
        loadComponent: () => import('./features/admin/departments/departmentsForm/departments').then(m => m.DepartmentsForm)
      },
      {
        path: 'departments/edit/:id',
        loadComponent: () => import('./features/admin/departments/departmentsForm/departments').then(m => m.DepartmentsForm)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users').then(m => m.Users)
      }
    ]
  },

  // Staff routes
  {
    path: 'staff',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/staff/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'attendance',
        loadComponent: () => import('./features/staff/attendance/attendance').then(m => m.Attendance)
      },
      {
        path: 'manage-activities',
        loadComponent: () => import('./features/staff/manage-activities/manage-activities').then(m => m.ManageActivities)
      },
      {
        path: 'manage-tasks',
        loadComponent: () => import('./features/staff/manage-tasks/manage-tasks').then(m => m.ManageTasks)
      }
    ]
  },

  // Student routes
  {
    path: 'student',
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/student/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'activities',
        loadComponent: () => import('./features/student/activities/activities').then(m => m.Activities)
      },
      {
        path: 'tasks',
        loadComponent: () => import('./features/student/tasks/tasks').then(m => m.Tasks)
      },
      {
        path: 'submissions',
        loadComponent: () => import('./features/student/submissions/submissions').then(m => m.Submissions)
      }
    ]
  },

  // Fallback route
  {
    path: '**',
    redirectTo: '/login'
  }
];
