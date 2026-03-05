import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Ne pas ajouter le token pour les routes d'authentification
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    console.log('Skipping auth interceptor for:', req.url);
    return next(req);
  }
  
  const token = sessionStorage.getItem('token');
  
  if (token) {
    console.log('Adding auth token to request:', req.url);
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }
  
  return next(req);
};
