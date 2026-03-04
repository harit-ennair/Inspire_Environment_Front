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
        loadComponent: () => import('./features/staff/dashboard/dashboard').then(m => m.Dashboard)
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
        path: 'students',
        loadComponent: () => import('./features/staff/students/studentsList/students').then(m => m.StudentsList)
      },
      {
        path: 'students/create',
        loadComponent: () => import('./features/staff/students/studentsForm/students').then(m => m.StudentsForm)
      },
      {
        path: 'students/edit/:id',
        loadComponent: () => import('./features/staff/students/studentsForm/students').then(m => m.StudentsForm)
      },
      {
        path: 'staff',
        loadComponent: () => import('./features/admin/staff/staffList/staff').then(m => m.StaffList)
      },
      {
        path: 'staff/create',
        loadComponent: () => import('./features/admin/staff/staffForm/staff').then(m => m.StaffForm)
      },
      {
        path: 'staff/edit/:id',
        loadComponent: () => import('./features/admin/staff/staffForm/staff').then(m => m.StaffForm)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users').then(m => m.Users)
      },
      {
        path: 'activities',
        loadChildren: () =>
          import('./features/staff/activities/activities.routes').then(m => m.ACTIVITIES_ROUTES),
      },
      {
        path: 'presence',
        loadComponent: () => import('./features/staff/presence/presence').then(m => m.Presence)
      },
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
        loadComponent: () => import('./features/staff/activities/activities-attendance/activities-attendance').then(m => m.ActivitiesAttendance)
      },
      {
        path: 'manage-activities',
        loadComponent: () => import('./features/staff/activities/activitiesManagedByStaff/activities-managed-by-staff').then(m => m.ActivitiesManagedByStaff)
      },
      {
        path: 'manage-tasks',
        loadComponent: () => import('./features/staff/activities/activitiesList/activities-list').then(m => m.ActivitiesList)
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
