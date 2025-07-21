import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { ContactoModel } from '../../auth/models/contacto';
import { ContactoService } from '../services/contacto.services';
import { UsuarioModel } from '../../auth/models/usuario';

@Component({
  selector: 'app-contacto',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.scss'
})
export class Contacto {
  protected contacto$!:Observable<ContactoModel[]>;
  protected usuario$!:Observable<UsuarioModel[]>
  private serv = inject(ContactoService);
  private fb = inject(FormBuilder);
  ngOnInit():void{
    this.contacto$=this.serv.getSelectContact();
  }
}
