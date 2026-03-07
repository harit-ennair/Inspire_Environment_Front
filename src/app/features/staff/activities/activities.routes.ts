import { Routes } from '@angular/router';

export const ACTIVITIES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./activitiesList/activities-list').then(m => m.ActivitiesList),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./activityCreate/activity-create').then(m => m.ActivityCreate),
  },
  {
    path: 'student',
    loadComponent: () =>
      import('./activitiesByStudent/activities-by-student').then(m => m.ActivitiesByStudent),
  },
  {
    path: 'department',
    loadComponent: () =>
      import('./activitiesByDepartment/activities-by-department').then(m => m.ActivitiesByDepartment),
  },
  {
    path: 'staff',
    loadComponent: () =>
      import('./activitiesManagedByStaff/activities-managed-by-staff').then(m => m.ActivitiesManagedByStaff),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./activityDetails/activity-details').then(m => m.ActivityDetails),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./activityEdit/activity-edit').then(m => m.ActivityEdit),
  },
  {
    path: ':id/assign',
    loadComponent: () =>
      import('./activityAssign/activity-assign').then(m => m.ActivityAssign),
  },
  {
    path: ':id/attendance',
    loadComponent: () =>
      import('./activities-attendance/activities-attendance').then(m => m.ActivitiesAttendance),
  },
];
