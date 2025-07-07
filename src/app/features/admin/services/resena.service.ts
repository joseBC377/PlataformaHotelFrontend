import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Resena } from '../../auth/models/resena';

@Injectable({
  providedIn: 'root'
})
export class ResenaService {

  private URL = "http://localhost:8081/api/resena"
  private http = inject(HttpClient)

  listar(): Observable <Resena[]>{
    return this.http.get<Resena[]>(`${this.URL}`);
  }

  insertar(resena: Resena): Observable<Resena> {
    return this.http.post<Resena>(`${this.URL}`, resena);
  }

 
  editar(id: number, resena:Resena): Observable<Resena>{
    return this.http.put<Resena>(`${this.URL}${id}`, resena);
  }

  eliminar(id: number): Observable<string> {
    return this.http.delete(`${this.URL}${id}`,{ responseType: 'text' });
  }


}
