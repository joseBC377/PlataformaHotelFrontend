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

}
