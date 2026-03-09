import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../staff/dashboard/dashboard').then(m => m.Dashboard),
      },
      {
        path: 'roles',
        loadComponent: () =>
          import('./role/rolesList/roles').then(m => m.RolesList),
      },
      {
        path: 'roles/create',
        loadComponent: () =>
          import('./role/rolesForm/roles').then(m => m.RolesForm),
      },
      {
        path: 'roles/edit/:id',
        loadComponent: () =>
          import('./role/rolesForm/roles').then(m => m.RolesForm),
      },
      {
        path: 'departments',
        loadComponent: () =>
          import('./departments/departmentsList/departments').then(m => m.DepartmentsList),
      },
      {
        path: 'departments/create',
        loadComponent: () =>
          import('./departments/departmentsForm/departments').then(m => m.DepartmentsForm),
      },
      {
        path: 'departments/edit/:id',
        loadComponent: () =>
          import('./departments/departmentsForm/departments').then(m => m.DepartmentsForm),
      },
      {
        path: 'staff',
        loadComponent: () =>
          import('./staff/staffList/staff').then(m => m.StaffList),
      },
      {
        path: 'staff/create',
        loadComponent: () =>
          import('./staff/staffForm/staff').then(m => m.StaffForm),
      },
      {
        path: 'staff/edit/:id',
        loadComponent: () =>
          import('./staff/staffForm/staff').then(m => m.StaffForm),
      },
      {
        path: 'students',
        loadComponent: () =>
          import('../staff/students/studentsList/students').then(m => m.StudentsList),
      },
      {
        path: 'students/create',
        loadComponent: () =>
          import('../staff/students/studentsForm/students').then(m => m.StudentsForm),
      },
      {
        path: 'students/edit/:id',
        loadComponent: () =>
          import('../staff/students/studentsForm/students').then(m => m.StudentsForm),
      },
      {
        path: 'activities',
        loadChildren: () =>
          import('../staff/activities/activities.routes').then(m => m.ACTIVITIES_ROUTES),
      },
      {
        path: 'presence',
        loadComponent: () =>
          import('../staff/presence/presence').then(m => m.Presence),
      },
    ]
  },
];
