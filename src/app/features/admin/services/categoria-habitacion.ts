import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriaHabitacion } from '../../auth/models/categoria-habitacion';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoriaHabitacionServices {
  private API_URL = `${environment.API_BASE_URL}/categoriaHabitacion`;
  private http = inject(HttpClient);

  getAllCategorias(): Observable<CategoriaHabitacion[]> {
    return this.http.get<CategoriaHabitacion[]>(`${this.API_URL}`);
  }

  getCategoriaById(id: number): Observable<CategoriaHabitacion> {
    return this.http.get<CategoriaHabitacion>(`${this.API_URL}/${id}`);
  }

  postInsertarCategoria(data: FormData): Observable<any> {
  return this.http.post('http://localhost:8081/api/categoriaHabitacion', data);
}

  
putEditarCategoria(id: number, data: FormData): Observable<any> {
  return this.http.put(`http://localhost:8081/api/categoriaHabitacion/${id}`, data);
}
  deleteCategoria(id: number): Observable<CategoriaHabitacion> {
    return this.http.delete<CategoriaHabitacion>(`${this.API_URL}/${id}`);
  }
}
