import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ReservaModel } from '../../auth/models/reserva'; 

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  private API_URL = 'http://localhost:8081/api/reserva'; 
  private http = inject(HttpClient);

  getAllReservas(): Observable<ReservaModel[]> {
    return this.http.get<ReservaModel[]>(`${this.API_URL}`);
  }

  getReservaById(id: number): Observable<ReservaModel> {
    return this.http.get<ReservaModel>(`${this.API_URL}/${id}`);
  }

  postInsertReserva(data: ReservaModel): Observable<ReservaModel> {
    return this.http.post<ReservaModel>(`${this.API_URL}`, data);
  }

  putUpdateReserva(id: number, data: ReservaModel): Observable<ReservaModel> {
    return this.http.put<ReservaModel>(`${this.API_URL}/${id}`, data);
  }

  deleteIdReserva(id: number): Observable<ReservaModel> {
    return this.http.delete<ReservaModel>(`${this.API_URL}/${id}`);
  }
}
