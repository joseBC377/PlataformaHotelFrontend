import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReservaModel } from '../../auth/models/reserva';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private API_URL = 'http://localhost:8081/api/reservas';
  private http = inject(HttpClient);

  getAllReservas(): Observable<ReservaModel[]> {
    return this.http.get<ReservaModel[]>(`${this.API_URL}`);
  }

  getReservaById(id: number): Observable<ReservaModel> {
    return this.http.get<ReservaModel>(`${this.API_URL}/${id}`);
  }

  postInsertReserva(reserva: ReservaModel): Observable<ReservaModel> {
    return this.http.post<ReservaModel>(`${this.API_URL}`, reserva);
  }

  putUpdateReserva(id: number, reserva: ReservaModel): Observable<ReservaModel> {
    return this.http.put<ReservaModel>(`${this.API_URL}/${id}`, reserva);
  }

<<<<<<< HEAD
  deleteIdReserva(id: number): Observable<string> { 
    return this.http.delete(`${this.API_URL}/${id}`, { responseType: 'text' });
  }
=======

deleteReserva(id: number): Observable<{ message: string }> {
  return this.http.delete<{ message: string }>(
    `${this.API_URL}/${id}`
  );
}





>>>>>>> 2ea861184b833c6a7f8dc79dc1a0317266ef688c
}
