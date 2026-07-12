// recepcion.services.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RecepcionServices {
  private API_URL = `${environment.API_BASE_URL}/recepcion`;
  private http = inject(HttpClient);

  getStats(): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/stats`);
  }
}