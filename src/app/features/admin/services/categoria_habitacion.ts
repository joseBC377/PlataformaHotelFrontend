import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriaHabitacion } from '../../auth/models/categoria_habitacion';

@Injectable({
  providedIn: 'root'
})
export class CategoriaHabitacionServices {
  private API_URL = 'http://localhost:8081/api/categoriaHabitacion';
  private http = inject(HttpClient);

  getAllCategorias(): Observable<CategoriaHabitacion[]> {
    return this.http.get<CategoriaHabitacion[]>(`${this.API_URL}`);
  }

  getCategoriaById(id: number): Observable<CategoriaHabitacion> {
    return this.http.get<CategoriaHabitacion>(`${this.API_URL}/${id}`);
  }

  postInsertarCategoria(cat: CategoriaHabitacion): Observable<CategoriaHabitacion> {
    return this.http.post<CategoriaHabitacion>(`${this.API_URL}`, cat);
  }

  putEditarCategoria(id: number, cat: CategoriaHabitacion): Observable<CategoriaHabitacion> {
    return this.http.put<CategoriaHabitacion>(`${this.API_URL}/${id}`, cat);
  }

  deleteCategoria(id: number): Observable<CategoriaHabitacion> {
    return this.http.delete<CategoriaHabitacion>(`${this.API_URL}/${id}`);
  }
}
