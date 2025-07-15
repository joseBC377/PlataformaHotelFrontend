import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminServices } from '../services/admin.services';
import { UsuarioModel } from '../../auth/models/usuario';
import { RequestUserModel } from '../../auth/models/request-user-model';


@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ReactiveFormsModule, AsyncPipe, ReactiveFormsModule],
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
    nombre: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
    apellido: ['', [Validators.required, Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
  });



  get nombre() { return this.usuarioForm.get('nombre'); }
  get apellido() { return this.usuarioForm.get('apellido'); }
  get correo() { return this.usuarioForm.get('correo'); }
  get password() { return this.usuarioForm.get('password'); }
  get telefono() { return this.usuarioForm.get('telefono'); }


  ngOnInit(): void {
    this.listarUsuarios();
    this.setPasswordValidators();
  }

  editando: boolean = false;
  idEditando!: number;

  listarUsuarios() {
    this.usuario$ = this.serv.getAllUsers();
  }


  editarUsuario(usuario: UsuarioModel) {
    this.editando = true;
    this.idEditando = usuario.id ?? 0;

    this.usuarioForm.patchValue({
      id_usuario: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      correo: usuario.correo,
      telefono: usuario.telefono,
      password: '',

    });
    this.setPasswordValidators();

  }

  cancelarEdicion() {
    this.editando = false;
    this.idEditando = 0;
    this.usuarioForm.reset();
  }


  private setPasswordValidators() {
    if (this.editando) {
      this.password?.clearValidators();
    } else {
      this.password?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.password?.updateValueAndValidity();
  }

  registroFn() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const form = this.usuarioForm.value;

    const user: RequestUserModel = {
      firstname: form.nombre,
      lastname: form.apellido,
      email: form.correo,
      telefono: form.telefono,
      password: form.password?.trim() || undefined
    };

    if (this.editando) {
      this.serv.updateIdClient(this.idEditando, user).subscribe({
        next: () => {
          this.editando = false,
            this.idEditando = 0,
            this.usuarioForm.reset();
          this.listarUsuarios();
        },
        error: (err) => {
          alert("Error al editar");

        }
      })
    } else {
      this.serv.insertIdClient(user).subscribe({
        next: () => {
          this.usuarioForm.reset();
          this.listarUsuarios();
        },
        error: (errr) => {
          alert("Error al registrar usuario")
        }
      });
    }
  }

  eliminarUsuario(id: number) {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.serv.deleteIdUser(id).subscribe({
        next: () => {
          alert('Usuario eliminado correctamente');
          this.listarUsuarios();
        },
        error: () => {
          alert('Error al eliminar el usuario');
        }
      });
    }
  }




}