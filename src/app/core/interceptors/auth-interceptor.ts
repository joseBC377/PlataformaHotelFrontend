import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';

let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authServ = inject(AuthService);
  const router = inject(Router);

  // 1. EXCLUSIÓN CRÍTICA: No interceptar peticiones de login o refresh para evitar bucles o 403
  if (req.url.includes('/autenticarse') || req.url.includes('/refresh')) {
    return next(req);
  }

  const access_token = authServ.getTokenAcces();
  let authReq = req;

  if (access_token) {
    authReq = addTokenHeader(req, access_token);
  }

  // 2. Manejo de errores de autenticación
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        return handleTokenExpiration(authReq, next, authServ, router);
      }
      return throwError(() => error);
    })
  );
};

// 3. Manejar lógica de expiración y cola de peticiones
function handleTokenExpiration(request: HttpRequest<any>, next: HttpHandlerFn, authServ: AuthService, router: Router) {
  if (isRefreshing) {
    // Si ya se está refrescando, esperamos a que el BehaviorSubject emita el nuevo token
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addTokenHeader(request, token!)))
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  const refresh_token = authServ.getRefreshToken();

  if (!refresh_token) {
    authServ.clearTokens();
    router.navigate(['/login']);
    return throwError(() => new Error('No hay refresh token disponible'));
  }

  return authServ.refreshToken(refresh_token).pipe(
    switchMap((response: any) => {
      isRefreshing = false;
      // Guardamos tokens (ajusta el método según tu AuthService)
      authServ['almacenarTokens'](response); 
      refreshTokenSubject.next(response.access_token);
      return next(addTokenHeader(request, response.access_token));
    }),
    catchError((refreshError) => {
      isRefreshing = false;
      authServ.clearTokens();
      router.navigate(['/login']);
      return throwError(() => refreshError);
    })
  );
}

// 4. Utilidad para clonar la petición con el nuevo header
function addTokenHeader(request: HttpRequest<any>, token: string) {
  return request.clone({ 
    headers: request.headers.set('Authorization', `Bearer ${token}`) 
  });
}