import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReservaModel } from '../../auth/models/reserva';
import { ReservaHabitacion } from '../../auth/models/reservaHabitacion';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private API_URL = `${environment.API_BASE_URL}/reservas`;
  private http = inject(HttpClient);

  getAllReservas(): Observable<ReservaModel[]> {
    return this.http.get<ReservaModel[]>(`${this.API_URL}`);
  }

  getReservasHabitaciones(): Observable<ReservaHabitacion[]> {
    return this.http.get<ReservaHabitacion[]>(`${this.API_URL}/habitaciones`);
  }

  getReservaById(id: number): Observable<ReservaModel> {
    return this.http.get<ReservaModel>(`${this.API_URL}/${id}`);
  }

  postInsertReserva(reserva: ReservaModel): Observable<ReservaModel> {
    return this.http.post<ReservaModel>(`${this.API_URL}`, reserva);
  }

  postInsertReservaHabitacion(reservaHabitacion: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/habitaciones`, reservaHabitacion);
  }

  putUpdateReserva(id: number, reserva: ReservaModel): Observable<ReservaModel> {
    return this.http.put<ReservaModel>(`${this.API_URL}/${id}`, reserva);
  }

  deleteIdReserva(id: number): Observable<string> {
    return this.http.delete(`${this.API_URL}/${id}`, { responseType: 'text' });
  }

  getHistorialPorUsuario(idUsuario: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/historial/${idUsuario}`);
  }
}

