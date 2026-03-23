import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';
import { NavbarComponent } from '../layout/navbar/navbar';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: NavbarComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: '',
        redirectTo: '/dashboard',
        pathMatch: 'full'
      },
      {
        path: 'roles',
        children: [
          {
            path: '',
            loadComponent: () => import('./role/rolesList/roles').then(m => m.RolesList),
          },
          {
            path: 'create',
            loadComponent: () => import('./role/rolesForm/roles').then(m => m.RolesForm),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./role/rolesForm/roles').then(m => m.RolesForm),
          },
        ]
      },
      {
        path: 'departments',
        children: [
          {
            path: '',
            loadComponent: () => import('./departments/departmentsList/departments').then(m => m.DepartmentsList),
          },
          {
            path: 'create',
            loadComponent: () => import('./departments/departmentsForm/departments').then(m => m.DepartmentsForm),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./departments/departmentsForm/departments').then(m => m.DepartmentsForm),
          },
        ]
      },
      {
        path: 'staff',
        children: [
          {
            path: '',
            loadComponent: () => import('./staff/staffList/staff').then(m => m.StaffList),
          },
          {
            path: 'create',
            loadComponent: () => import('./staff/staffForm/staff').then(m => m.StaffForm),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('./staff/staffForm/staff').then(m => m.StaffForm),
          },
        ]
      },
      {
        path: 'students',
        children: [
          {
            path: '',
            loadComponent: () => import('../staff/students/studentsList/students').then(m => m.StudentsList),
          },
          {
            path: 'create',
            loadComponent: () => import('../staff/students/studentsForm/students').then(m => m.StudentsForm),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('../staff/students/studentsForm/students').then(m => m.StudentsForm),
          },
        ]
      },
      {
        path: 'activities',
        loadChildren: () =>
          import('../staff/activities/activities.routes').then(m => m.ACTIVITIES_ROUTES),
      },
      {
        path: 'presence',
        children: [
          {
            path: '',
            loadComponent: () => import('../staff/presence/presenceList/presence').then(m => m.Presence),
          },
          {
            path: 'create',
            loadComponent: () => import('../staff/presence/presence-form/presence-form').then(m => m.PresenceForm),
          },
          {
            path: 'edit/:id',
            loadComponent: () => import('../staff/presence/presence-form/presence-form').then(m => m.PresenceForm),
          },
        ]
      },
    ]
  },
];
