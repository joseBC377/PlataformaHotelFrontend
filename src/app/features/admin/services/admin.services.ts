import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConteoRol } from '../../auth/models/conteo-rol';
import { UsuarioModel } from '../../auth/models/usuario';
import { RequestUserModel } from '../../auth/models/request-user-model';

@Injectable({
  providedIn: 'root'
})
export class AdminServices {

  private URL = "http://localhost:8081/api/v1/auth"
  private API_URL = "http://localhost:8081/api/usuario"
  private http = inject(HttpClient);

  getAllUsers(): Observable<UsuarioModel[]> {
    return this.http.get<UsuarioModel[]>(`${this.API_URL}/todosCliente`);
  }
  getAllUserReservas(): Observable<UsuarioModel[]> {
    return this.http.get<UsuarioModel[]>(`${this.API_URL}/TodosUsuarioReserva`);
  }
  getCountUsersRol(): Observable<ConteoRol[]> {
    return this.http.get<ConteoRol[]>(`${this.API_URL}/contarUsuariosRol`);
  }


  getSeletAllUsers(): Observable<UsuarioModel[]> {
    return this.http.get<UsuarioModel[]>(`${this.API_URL}/lista`);
  }
  getSelectIdUser(id: number): Observable<UsuarioModel> {
    return this.http.get<UsuarioModel>(`${this.API_URL}/lista/${id}`);
  }
  postInsertIdUser(usuario: UsuarioModel): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(`${this.API_URL}/insertar`, usuario);
  }
  putUpdateUser(id: number, usuario: UsuarioModel): Observable<UsuarioModel> {
    return this.http.put<UsuarioModel>(`${this.API_URL}/actualizar/${id}`, usuario);
  }
  deleteIdUser(id: number): Observable<UsuarioModel> {
    return this.http.delete<UsuarioModel>(`${this.API_URL}/eliminar/${id}`)
  }


  insertIdClient(request: RequestUserModel): Observable<any> {
    return this.http.post(`${this.URL}/registro`, request);
  }
  
  updateIdClient(id: number, usuario: RequestUserModel): Observable<string> {
    return this.http.put<string>(`${this.URL}/editar/${id}`, usuario);
  }

}