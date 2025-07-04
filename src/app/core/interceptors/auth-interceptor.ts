import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  console.log("INTERCEPTOR EJECUTADO");//De prueba solo para ver si el interceptor logra ejecutarse

  const authServ = inject(AuthService);
  const token= authServ.getTokenAcces();
  console.log("TOKEN ENVIADO:", token);

  if (token) {
    const colnedReq= req.clone({
      headers: req.headers.set("Authorization", `Bearer ${token}`)
    });
    return next(colnedReq);
  }
  return next(req);
};
