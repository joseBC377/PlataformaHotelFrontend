import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { Router } from '@angular/router';


let isRefreshing = false;
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // console.log("INTERCEPTOR EJECUTADO");

  const authServ = inject(AuthService);
  const router = inject(Router);
  let authReq = req;
  const access_token = authServ.getTokenAcces();

  // const token= authServ.getTokenAcces();
  // if (token) {
  //   const colnedReq= req.clone({
  //     headers: req.headers.set("Authorization", `Bearer ${token}`)
  //   });
  //   return next(colnedReq);
  // }
  // return next(req);
  if (access_token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${access_token}`)
    });
  }
  //manejar errores
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 || error.status === 403) {
        return handleTokenExpiration(authReq, next, authServ, router);
      }
      return throwError(() => error);
    })
  );
};
//manejar token
function handleTokenExpiration(request: HttpRequest<any>, next: HttpHandlerFn, authServ: AuthService, router: Router) {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);
    const refresh_token = authServ.getRefreshToken();
    if (refresh_token) {
      return authServ.refreshToken(refresh_token).pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          authServ['almacenarTokens'](response);
          refreshTokenSubject.next(response.access_token);
          return next(addTokenHeader(request, response.access_token));
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          console.error('Refresh token falló. Redirigiendo al login:', refreshError);
          authServ.clearTokens();
          router.navigate(['/login']);
          return throwError(() => refreshError);
        })
      );
    } else {
      console.error('No hay refresh token disponible, redirigiendo al login');
      authServ.clearTokens();
      router.navigate(['/login']);
      return throwError(() => new Error('No hay token de actualización disponible'));
    }
  } else {
    return refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => next(addTokenHeader(request, token)))
    );
  }
}
//clonar solicitud
function addTokenHeader(request: HttpRequest<any>, token: string) {
  return request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) });
}