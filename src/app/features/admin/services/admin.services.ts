import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Usuario } from '../../auth/models/usuario';
import { Observable } from 'rxjs';
import { ConteoRol } from '../../auth/models/conteo-rol';

@Injectable({
  providedIn: 'root'
})
export class AdminServices {
  private API_URL = "http://localhost:8081/api/usuario"
  private http = inject(HttpClient);

  getAllUsers(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.API_URL}/todosCliente`);
  }

  getAllUserReservas(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.API_URL}/TodosUsuarioReserva`);
  }

  getCountUsersRol(): Observable<ConteoRol[]> {
    return this.http.get<ConteoRol[]>(`${this.API_URL}/contarUsuariosRol`);
  }

  getSelectAllUsers(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.API_URL}/lista`);
  }

  getSelectIdUser(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URL}/lista/${id}`);
  }

  postInsertIdUser(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.API_URL}/insertar`, usuario);
  }

  putUpdateUser(id: number, usuario: Usuario): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URL}/actualizar/${id}`, usuario);
  }

  deleteIdUser(id: number): Observable<Usuario> {
    return this.http.delete<Usuario>(`${this.API_URL}/eliminar/${id}`);
  }
}
