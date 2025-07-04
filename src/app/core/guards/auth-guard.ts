import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router);
  // const permitido = false;
  return authService.isAuth$.pipe(
    take(1),
    map(isAuth => {
      if (isAuth) {
        return true;
      } else {
        router.navigate(['/login'])
        return false;
      }
    })
  )

};
