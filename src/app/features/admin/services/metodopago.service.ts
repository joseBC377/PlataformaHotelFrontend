// src/app/admin/services/metodo-pago.services.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagoModel } from '../../auth/models/pago';
import { MetodoPagoModel } from '../../auth/models/metodopago';


@Injectable({ providedIn: 'root' })

export class MetodoPagoService {
  private API_URL = `${environment.API_BASE_URL}/metodopago`; // ← singular

  constructor(private http: HttpClient) { }

  getAll(): Observable<MetodoPagoModel[]> {
    return this.http.get<MetodoPagoModel[]>(this.API_URL);
  }

  post(data: MetodoPagoModel): Observable<MetodoPagoModel> {
    return this.http.post<MetodoPagoModel>(this.API_URL, data);
  }

  put(id: number, data: MetodoPagoModel): Observable<MetodoPagoModel> {
    return this.http.put<MetodoPagoModel>(`${this.API_URL}/${id}`, data);
  }

  delete(id: number): Observable<string> {
    return this.http.delete(`${this.API_URL}/${id}`, { responseType: 'text' });
  }
}