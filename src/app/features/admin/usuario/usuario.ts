import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { map, Observable } from 'rxjs';
import { AdminServices } from '../services/admin.services';
import { UsuarioModel } from '../../auth/models/usuario';
import { RequestUserModel } from '../../auth/models/request-user-model';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ReactiveFormsModule, AsyncPipe, ReactiveFormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.scss'
})
export class Usuario {

  private authService = inject(AuthService);
  protected usuario$!: Observable<UsuarioModel[]>
  private serv = inject(AdminServices);
  private fb = inject(FormBuilder);


  public usuarioForm: FormGroup = this.fb.group({
    id_usuario: [null],
    nombre_usuario: ['', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
    apellido_paterno: ['', [Validators.required,Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
    apellido_materno: ['', [Validators.required,Validators.minLength(3), Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')]],
    correo: ['', [Validators.required, Validators.email]],
    fecha_nacimiento: ['', [Validators.required]],
    password: ['', [Validators.required,Validators.minLength(8)]],
    telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
    rol: ['', [Validators.required]]
  });



  get nombre_usuario() { return this.usuarioForm.get('nombre_usuario'); }
  get apellido_paterno() { return this.usuarioForm.get('apellido_paterno'); }
  get apellido_materno() { return this.usuarioForm.get('apellido_materno'); }
  get correo() { return this.usuarioForm.get('correo'); }
  get fecha_nacimiento() { return this.usuarioForm.get('fecha_nacimiento'); }
  get password() { return this.usuarioForm.get('password'); }
  get telefono() { return this.usuarioForm.get('telefono'); }
  get rol() { return this.usuarioForm.get('rol'); }

  getRolLabel(rol: string): string {
    switch (rol) {
      case 'ADMIN':
        return 'ADMINISTRADOR';
      case 'RECEPCION':
        return 'RECEPCIÓN';
      case 'CLIENT':
        return 'CLIENTE';
      default:
        return rol;
    }
  }

  rolLogueado: string = '';
  ngOnInit(): void {
    this.listarUsuarios();
    // this.setPasswordValidators();
    this.rolLogueado = this.authService.getRol() ?? '';
    if (this.rolLogueado === 'RECEPCION') {
      this.usuarioForm.patchValue({
        rol: 'CLIENT'
      });
    }
  }

  editando: boolean = false;
  idEditando!: number;


  listarUsuarios() {
      this.usuario$ = this.serv.getSeletAllUsers().pipe(
      map(users => {
        const rol = this.rolLogueado;

        if (rol === 'ADMIN') {
          return users; // ve todo
        }

        if (rol === 'RECEPCION') {
          return users.filter(u => u.rol === 'CLIENT');
        }

        return users;
      })
    );
  }


  editarUsuario(usuario: UsuarioModel) {
    this.editando = true;
    this.idEditando = usuario.id_usuario ?? 0;

    this.usuarioForm.patchValue({
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      apellido_paterno: usuario.apellido_paterno,
      apellido_materno: usuario.apellido_materno,
      correo: usuario.correo,
      fecha_nacimiento: usuario.fecha_nacimiento,
      telefono: usuario.telefono,
      rol: usuario.rol

    });
    // this.setPasswordValidators();

  }

  cancelarEdicion() {
    this.editando = false;
    this.idEditando = 0;
    this.usuarioForm.reset();
  }


  // private setPasswordValidators() {
  //   if (this.editando) {
  //     this.password?.clearValidators();
  //   } else {
  //     this.password?.setValidators([Validators.required, Validators.minLength(6)]);
  //   }
  //   this.password?.updateValueAndValidity();
  // }

  registroFn() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    const form = this.usuarioForm.value;

    const user: RequestUserModel & { rol: string } = {
      nombre_usuario: form.nombre_usuario,
      apellido_paterno: form.apellido_paterno,
      apellido_materno: form.apellido_materno,
      fecha_nacimiento: form.fecha_nacimiento,
      correo: form.correo,
      telefono: form.telefono,
      password: form.password?.trim() || undefined,
      rol: this.rolLogueado === 'RECEPCION'  ? 'CLIENT'
      : form.rol
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
