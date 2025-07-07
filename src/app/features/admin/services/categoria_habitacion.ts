import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriaHabitacion } from '../../auth/models/categoria_habitacion';

@Injectable({
  providedIn: 'root'
})
export class CategoriaHabitacionServices {
  private API_URL = 'http://localhost:8081/api/categoria_habitacion';
  private http = inject(HttpClient);

  getAllCategorias(): Observable<CategoriaHabitacion[]> {
    return this.http.get<CategoriaHabitacion[]>(`${this.API_URL}/listar`);
  }

  getCategoriaById(id: number): Observable<CategoriaHabitacion> {
    return this.http.get<CategoriaHabitacion>(`${this.API_URL}/lista/${id}`);
  }

  postInsertarCategoria(cat: CategoriaHabitacion): Observable<CategoriaHabitacion> {
    return this.http.post<CategoriaHabitacion>(`${this.API_URL}/insertar`, cat);
  }

  putEditarCategoria(id: number, cat: CategoriaHabitacion): Observable<CategoriaHabitacion> {
    return this.http.put<CategoriaHabitacion>(`${this.API_URL}/actualizar/${id}`, cat);
  }

  deleteCategoria(id: number): Observable<CategoriaHabitacion> {
    return this.http.delete<CategoriaHabitacion>(`${this.API_URL}/eliminar/${id}`);
  }
}
