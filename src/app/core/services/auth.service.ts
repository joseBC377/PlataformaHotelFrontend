import { HttpClient } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { Credenciales } from '../../features/auth/models/credenciales';

import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Token } from '../../features/auth/models/token';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private URL = "http://localhost:8081/api/v1/auth"
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID); // ¡Inyectar PLATFORM_ID!

  private isAuth = new BehaviorSubject<boolean>(isPlatformBrowser(this.platformId) ? this.hasToken() : false);
  public isAuth$ = this.isAuth.asObservable();
  iniciarSesion(credenciales: Credenciales): Observable<Token> {
    return this.http.post<Token>(`${this.URL}/autenticarse`, credenciales).pipe(tap(resp => {
      this.almacenarTokens(resp);
      this.isAuth.next(true);
      this.router.navigate(['/admin/intranet'])
    }));
  }
  //refrescar token
  refreshToken(refresh_token: string): Observable<Token> {
    return this.http.post<Token>(`${this.URL}/refresh-token`, { refreshToken: refresh_token }).pipe(
      tap(resp => {
        this.almacenarTokens(resp);
        this.isAuth.next(true);
      })
    )
  }
  clearTokens(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }
  cerrarSesion(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('nombre');
    localStorage.removeItem('apellido');
    localStorage.removeItem('id');
    localStorage.removeItem('rol');
    this.clearTokens();
    this.isAuth.next(false);
    this.router.navigate(['/login']);
  }



  // cerrarSesion() {
  //   if (isPlatformBrowser(this.platformId)) {
  //     localStorage.removeItem('access_token');
  //     localStorage.removeItem('refresh_token');
  //   }
  //   this.isAuth.next(false);
  //   this.router.navigate(['/login']);
  // }


  public almacenarTokens(token: Token) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('access_token', token.access_token);
      localStorage.setItem('refresh_token', token.refresh_token);
      localStorage.setItem('nombre', token.nombre);
      localStorage.setItem('apellido', token.apellido);
      localStorage.setItem('id', token.id.toString());
      localStorage.setItem('rol', token.rol);
    }
  }
  getTokenAcces(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }
  getRefreshToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }
  hasToken(): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return !!localStorage.getItem('access_token');
    }
    return false;
  }

  //METODO PERSONALIZADO DEL USUARIO
  getNombre(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('nombre') : null;
  }

  getApellido(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('apellido') : null;
  }

  getId(): number | null {
    const id = isPlatformBrowser(this.platformId) ? localStorage.getItem('id') : null;
    return id ? Number(id) : null;
  }

  getRol(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem('rol') : null;
  }

}
