import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PagoModel } from '../../auth/models/pago';
import { Observable } from 'rxjs';
import { PagoReservaInfo } from '../../auth/models/pago-reserva-info';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PagoService {
  private API_URL = `${environment.API_BASE_URL}/pago`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<PagoModel[]> {
    return this.http.get<PagoModel[]>(`${this.API_URL}/lista`);
  }

  getById(id: number): Observable<PagoModel> {
    return this.http.get<PagoModel>(`${this.API_URL}/lista/${id}`);
  }

  post(pago: PagoModel): Observable<PagoModel> {
    return this.http.post<PagoModel>(`${this.API_URL}/insertar`, pago);
  }

  put(id: number, pago: PagoModel): Observable<PagoModel> {
    return this.http.put<PagoModel>(`${this.API_URL}/actualizar/${id}`, pago);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.API_URL}/eliminar/${id}`, { responseType: 'text' });
  }
}
