import { Component, inject } from '@angular/core';
import { AdminServices } from '../services/admin.services';
import { Observable } from 'rxjs';
import { Usuario } from '../../auth/models/usuario';
import { AsyncPipe } from '@angular/common';
import { ConteoRol } from '../../auth/models/conteo-rol';

@Component({
  selector: 'app-intranet',
  imports: [AsyncPipe],
  templateUrl: './intranet.html',
  styleUrl: './intranet.scss'
})
export class Intranet {
  protected usuario$!: Observable<Usuario[]>;
  protected usuarioReserva$!: Observable<Usuario[]>;
  protected contero$!: Observable<ConteoRol[]>;
  private serv = inject(AdminServices);
  ngOnInit() {
    this.getUsuario();
    this.usuarioReserva$ = this.serv.getAllUserReservas();
    this.contero$ = this.serv.getCountUsersRol();
  }
  getUsuario() {
    this.usuario$ = this.serv.getAllUsers();
  }

}
