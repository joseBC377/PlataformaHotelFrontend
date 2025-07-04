import { Component, inject } from '@angular/core';
import { AdminServices } from '../services/admin.services';
import { Observable } from 'rxjs';
import { Usuario } from '../../auth/models/usuario';
import { AsyncPipe, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-intranet',
  imports: [AsyncPipe,JsonPipe],
  templateUrl: './intranet.html',
  styleUrl: './intranet.scss'
})
export class Intranet {
  protected usuario$!: Observable<Usuario[]>;
  private serv = inject(AdminServices);
  ngOnInit(){
    this.getUsuario();
  }
  getUsuario() {
    this.usuario$ = this.serv.getAllUsers();
  }

}
