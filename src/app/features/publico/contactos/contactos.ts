import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { ContactoModel } from '../../auth/models/contacto';
import { UsuarioModel } from '../../auth/models/usuario';
import { ContactoService } from '../../admin/services/contacto.services';
import { AdminServices } from '../../admin/services/admin.services';

@Component({
  selector: 'app-contactos',
  templateUrl: './contactos.html',
  styleUrls: ['./contactos.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // opcional si usas ngModel también
  ],
})
export class Contactos {
  protected contacto$!: Observable<ContactoModel[]>;
  protected usuario$!: Observable<UsuarioModel[]>;
  protected contactoForm!: FormGroup;
  private serv = inject(ContactoService);
  private auth = inject(AdminServices);
  private fb = inject(FormBuilder);
  ngOnInit(): void {
    this.iniciar();
    this.cargarContacto();
    this.setUsuarioSiExiste();
  }
  iniciar(): void {
    this.contactoForm = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      mensaje: ['', [Validators.required, Validators.minLength(10)]],
      usuario: [null]
    });
  }
  cargarContacto(): void {
    this.contacto$ = this.serv.getSelectContact();
  }

  setUsuarioSiExiste(): void {
  this.auth.getAllUsers().subscribe({
    next: (usuarios: UsuarioModel[]) => {
      if (usuarios.length > 0) {
        this.contactoForm.get('usuario')?.setValue({ id: usuarios[0].id });
      }
    },
    error: () => {
      console.error('Error al obtener usuarios');
    }
  });
}


  onSubmit() {
    if (this.contactoForm.invalid) {
      this.contactoForm.markAllAsTouched();
      return;
    }
    const data: ContactoModel = this.contactoForm.value;
    this.serv.postContactContact(data).subscribe({
      next: () => {
        alert('Mensaje enviado correctamente')
        this.contactoForm.reset();
        this.cargarContacto();
      },
      error: () => {
        alert('Error al enviar el mensaje');
      }
    });
  }
}
