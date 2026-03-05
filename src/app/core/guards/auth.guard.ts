import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('token');
  
  if (token) {
    return true;
  }
  
  // Redirect to login if no token
  router.navigate(['/login']);
  return false;
};
