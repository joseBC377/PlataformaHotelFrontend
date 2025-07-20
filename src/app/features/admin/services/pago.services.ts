import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PagoModel } from '../../auth/models/pago';
import { Observable } from 'rxjs';
import { PagoReservaInfo } from '../../auth/models/pago-reserva-info';

@Injectable({
  providedIn: 'root'
})
export class PagoService {
  private API_URL = "http://localhost:8081/api/pago"
  private http = inject(HttpClient);
    getSelectPago():Observable<PagoModel[]>{
      return this.http.get<PagoModel[]>(`${this.API_URL}/lista`);
    }
    getSelectPagoId(id:number):Observable<PagoModel>{
      return this.http.get<PagoModel>(`${this.API_URL}/lista/${id}`);
    }
    postInsertarPagoConReserva(data: PagoReservaInfo): Observable<any> {
    return this.http.post(`${this.API_URL}/completo`, data);
  }
    putUpdatePago(id:number, pago:PagoModel):Observable<PagoModel>{
      return this.http.put<PagoModel>(`${this.API_URL}/actualizar/${id}`,pago);
    }
    deleteIdPago(id:number):Observable<PagoModel>{
      return this.http.delete<PagoModel>(`${this.API_URL}/eliminar/${id}`);
    }
    postReservaPago(pago:PagoReservaInfo):Observable<PagoReservaInfo>{
      return this.http.post<PagoReservaInfo>(`${this.API_URL}/completo`,pago);
    }
}
