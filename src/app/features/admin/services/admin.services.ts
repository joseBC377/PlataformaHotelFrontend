import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Usuario } from '../../auth/models/usuario';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminServices {
  private API_URL="http://localhost:8081"
  private URL= "/api/subarid";
  private http= inject(HttpClient);
  getAllUsers():Observable<Usuario[]>{
    return this.http.get<Usuario[]>(`${this.API_URL}${this.URL}/todosCliente`);
  }

}
