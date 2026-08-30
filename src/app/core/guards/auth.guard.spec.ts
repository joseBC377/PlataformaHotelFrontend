import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { authGuard } from './auth-guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let isAuthSubject: BehaviorSubject<boolean>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    isAuthSubject = new BehaviorSubject<boolean>(false);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { 
          provide: AuthService, 
          useValue: { isAuth$: isAuthSubject.asObservable() } 
        },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('debe permitir el acceso cuando isAuth$ emite true', (done) => {
    isAuthSubject.next(true);

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as Observable<boolean>;

    result$.subscribe((permitido) => {
      expect(permitido).toBeTrue();
      expect(routerSpy.navigate).not.toHaveBeenCalled();
      done();
    });
  });

  it('debe denegar el acceso y redirigir a /login cuando isAuth$ emite false', (done) => {
    isAuthSubject.next(false);

    const result$ = TestBed.runInInjectionContext(() => authGuard({} as any, {} as any)) as Observable<boolean>;

    result$.subscribe((permitido) => {
      expect(permitido).toBeFalse();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      done();
    });
  });
});