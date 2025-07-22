import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ContactoModel } from '../../auth/models/contacto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactoService {
  private API_URL = "http://localhost:8081/api/contacto"
  private http = inject(HttpClient);
  getSelectContact(): Observable<ContactoModel[]> {
    return this.http.get<ContactoModel[]>(`${this.API_URL}/lista`);
  }
  getSelectContactId(id: number): Observable<ContactoModel> {
    return this.http.get<ContactoModel>(`${this.API_URL}/lista/${id}`);
  }
  postContactContact(contacto: ContactoModel): Observable<ContactoModel> {
    return this.http.post<ContactoModel>(`${this.API_URL}/insertar`, contacto);
  }
  putUpdateContact(id: number, contacto: ContactoModel): Observable<ContactoModel> {
    return this.http.put<ContactoModel>(`${this.API_URL}/actualizar/${id}`, contacto);
  }
  deleteIdContact(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/eliminar/${id}`,{responseType:'text'});
  }
}
