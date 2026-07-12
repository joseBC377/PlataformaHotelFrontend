import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ConteoRol } from '../../auth/models/conteo-rol';
import { UsuarioModel } from '../../auth/models/usuario';
import { RequestUserModel } from '../../auth/models/request-user-model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminServices {

  // URL para el controlador de Autenticación / Registro público
  private URL = `${environment.API_BASE_URL}/v1/auth`;
  
  // URL para tu UsuarioRestController (/api/usuario)
  private API_URL = `${environment.API_BASE_URL}/usuario`;
  
  private http = inject(HttpClient);

  // ==========================================
  // MÉTODOS DE USUARIO (UsuarioRestController)
  // ==========================================

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

  putUpdateUser(id: number, usuario: UsuarioModel | RequestUserModel): Observable<UsuarioModel> {
    return this.http.put<UsuarioModel>(`${this.API_URL}/actualizar/${id}`, usuario);
  }

  deleteIdUser(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/eliminar/${id}`);
  }

  // ==========================================
  // MÉTODOS DE AUTENTICACIÓN / REGISTRO
  // ==========================================

  insertIdClient(request: RequestUserModel): Observable<UsuarioModel> {
    return this.http.post<UsuarioModel>(`${this.URL}/registro`, request);
  }

}