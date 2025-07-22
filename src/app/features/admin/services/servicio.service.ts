import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Servicio } from '../../auth/models/servicio';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ServicioService {

  private URL = `${environment.API_BASE_URL}/servicio`;
  private http = inject(HttpClient);


  listar(): Observable<Servicio[]> {
    return this.http.get<Servicio[]>(`${this.URL}`);
  }

  insertar(servicio: Servicio): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.URL}`, servicio);
  }

  editar(id: number, servicio: Servicio): Observable<Servicio> {
    return this.http.put<Servicio>(`${this.URL}/${id}`, servicio);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${this.URL}/${id}`, { responseType: 'text' });
  }


}
