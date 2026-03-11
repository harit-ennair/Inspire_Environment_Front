import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/api/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  const token = authService.getToken();
  const userRole = authService.getRole()?.toLowerCase();
  const requiredRoles = route.data['roles'];
  
  // Check if user is authenticated
  if (!token) {
    router.navigate(['/login']);
    return false;
  }
  
  // Check if user has the required role(s)
  if (requiredRoles) {
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    const allowedRoles = roles.map(r => r.toLowerCase());
    
    if (!allowedRoles.includes(userRole)) {
      router.navigate(['/403']);
      return false;
    }
  }
  
  return true;
};
