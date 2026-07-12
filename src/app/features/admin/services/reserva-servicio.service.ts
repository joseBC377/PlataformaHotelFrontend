import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ReservaServicio } from '../../auth/models/reservaServicio';

@Injectable({
  providedIn: 'root'
})
export class ReservaServicioService {
  private API_URL = `${environment.API_BASE_URL}/reserva-servicio`;
  private http = inject(HttpClient);

  listar(): Observable<ReservaServicio[]> {
    return this.http.get<ReservaServicio[]>(`${this.API_URL}/lista`);
  }
}
