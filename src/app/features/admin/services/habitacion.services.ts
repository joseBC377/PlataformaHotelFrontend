import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Habitacion } from '../../auth/models/habitacion';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HabitacionServices {
  private API_URL = `${environment.API_BASE_URL}/habitacion`;
  private http = inject(HttpClient);

  getAllHabitaciones(): Observable<Habitacion[]> {
    return this.http.get<Habitacion[]>(`${this.API_URL}`);
  }

  getHabitacionById(id: number): Observable<Habitacion> {
    return this.http.get<Habitacion>(`${this.API_URL}/${id}`);
  }

  postInsertarHabitacion(habitacion: Habitacion): Observable<Habitacion> {
    return this.http.post<Habitacion>(`${this.API_URL}`, habitacion);
  }

  putEditarHabitacion(id: number, habitacion: Habitacion): Observable<Habitacion> {
    return this.http.put<Habitacion>(`${this.API_URL}/${id}`, habitacion);
  }

  deleteHabitacion(id: number): Observable<Habitacion> {
    return this.http.delete<Habitacion>(`${this.API_URL}/${id}`);
  }
}
