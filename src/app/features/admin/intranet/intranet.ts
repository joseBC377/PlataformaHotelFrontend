import { Component, inject } from '@angular/core';
import { AdminServices } from '../services/admin.services';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { ConteoRol } from '../../auth/models/conteo-rol';
import { UsuarioModel } from '../../auth/models/usuario';

@Component({
  selector: 'app-intranet',
  imports: [AsyncPipe],
  templateUrl: './intranet.html',
  styleUrl: './intranet.scss'
})
export class Intranet {
  protected usuario$!: Observable<UsuarioModel[]>;
  protected usuarioReserva$!: Observable<UsuarioModel[]>;
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
