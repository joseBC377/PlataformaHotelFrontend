import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminServices } from '../services/admin.services';
import { UsuarioModel } from '../../auth/models/usuario';


@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.scss'
})
export class Usuario {
  protected usuario$!: Observable<UsuarioModel[]>
  // protected usuarioId$!: Observable<UsuarioService>
  // protected usuarioPost$!: Observable<Usuario>
  // protected usuarioPut$!: Observable<Usuario>
  // protected usuarioDel$!: Observable<Usuario>

  private serv = inject(AdminServices)
  private fb = inject(FormBuilder);

  public usuarioForm: FormGroup = this.fb.group({
    id_usuario: [null],
    nombre: ['', [Validators.required, Validators.minLength(3)], Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')],
    apellido: ['', Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')],
    correo: ['', [Validators.required, Validators.email]],
    contrasena: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
    rol: ['', Validators.required]
  });

  get nombre() { return this.usuarioForm.get('nombre'); }
  get apellido() { return this.usuarioForm.get('apellido'); }
  get correo() { return this.usuarioForm.get('correo'); }
  get contrasena() { return this.usuarioForm.get('contrasena'); }
  get telefono() { return this.usuarioForm.get('telefono'); }

  registroFn() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      console.log('Formulario de registro invalido')
      return;
    }
    console.log('formulario de registro valido', this.usuarioForm.value)
  }
  ngOnInit(): void {
    this.usuario$ = this.serv.getSeletAllUsers();
  }
}