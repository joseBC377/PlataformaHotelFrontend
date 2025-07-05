import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.scss'
})
export class Usuario {
  usuarioForm!: FormGroup;
  usuarios: any[] = [];
  roles = ['Cliente', 'Administrador'];
  modoEdicion = false;

  constructor(private fb: FormBuilder) { }


  ngOnInit(): void {
    this.usuarioForm = this.fb.group({
      id_usuario: [null],
      nombre: ['', [Validators.required, Validators.minLength(3)],Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')],
      apellido: ['', Validators.required,Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$')],
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{9}$')]],
      rol: ['Cliente', Validators.required]
    });
  }


  guardarUsuario(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }

    if (this.modoEdicion) {
      this.actualizarUsuario();
    } else {
      this.agregarUsuario();
    }
  }

  agregarUsuario(): void {
    const nuevoId = this.usuarios.length > 0 ? Math.max(...this.usuarios.map(u => u.id_usuario)) + 1 : 1;
    const nuevoUsuario = { ...this.usuarioForm.value, id_usuario: nuevoId };
    this.usuarios.push(nuevoUsuario);
    this.resetFormulario();
  }

  actualizarUsuario(): void {
    const id = this.usuarioForm.value.id_usuario;
    const index = this.usuarios.findIndex(u => u.id_usuario === id);
    if (index !== -1) {
      const contrasena = this.usuarioForm.value.contrasena ? this.usuarioForm.value.contrasena : this.usuarios[index].contrasena;
      this.usuarios[index] = { ...this.usuarioForm.value, contrasena };
    }
    this.resetFormulario();
  }

  editarUsuario(usuario: any): void {
    this.modoEdicion = true;
    this.usuarioForm.patchValue(usuario);
    this.usuarioForm.get('contrasena')?.clearValidators();
    this.usuarioForm.get('contrasena')?.updateValueAndValidity();
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      this.usuarios = this.usuarios.filter(u => u.id_usuario !== id);
      if (this.usuarioForm.value.id_usuario === id) {
        this.resetFormulario();
      }
    }
  }

  resetFormulario(): void {
    this.modoEdicion = false;
    this.usuarioForm.reset({
      rol: 'Cliente'
    });

    this.usuarioForm.get('contrasena')?.setValidators([Validators.required]);
    this.usuarioForm.get('contrasena')?.updateValueAndValidity();
  }

  get nombre() { return this.usuarioForm.get('nombre'); }
  get apellido() { return this.usuarioForm.get('apellido'); }
  get correo() { return this.usuarioForm.get('correo'); }
  get contrasena() { return this.usuarioForm.get('contrasena'); }
  get telefono() { return this.usuarioForm.get('telefono'); }
}