import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-usuario',
  imports: [CommonModule,FormsModule],
  templateUrl: './usuario.html',
  styleUrl: './usuario.scss'
})
export class Usuario {
  // modo simulado 
  modoEdicion = false;
  idUsuarioEditar: number | null = null;

  usuarios: any[] = [];

  nuevoUsuario = {
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    telefono: '',
    rol: 'Cliente'
  };

  roles = ['Cliente', 'Administrador'];

  agregarUsuario() {
    const nuevo = {
      ...this.nuevoUsuario,
      id_usuario: this.usuarios.length + 1
    };
    this.usuarios.push(nuevo);
    this.resetFormulario();
  }

  editarUsuario(usuario: any) {
    this.nuevoUsuario = { ...usuario };
    this.modoEdicion = true;
    this.idUsuarioEditar = usuario.id_usuario;
  }

  actualizarUsuario() {
    if (this.idUsuarioEditar !== null) {
      const index = this.usuarios.findIndex(u => u.id_usuario === this.idUsuarioEditar);
      if (index !== -1) {
        this.usuarios[index] = { ...this.nuevoUsuario, id_usuario: this.idUsuarioEditar };
      }
      this.modoEdicion = false;
      this.idUsuarioEditar = null;
      this.resetFormulario();
    }
  }

  eliminarUsuario(id: number) {
    const confirmar = confirm('¿Deseas eliminar este usuario?');
    if (confirmar) {
      this.usuarios = this.usuarios.filter(u => u.id_usuario !== id);
      if (this.idUsuarioEditar === id) {
        this.modoEdicion = false;
        this.idUsuarioEditar = null;
      }
    }
  }

  resetFormulario() {
    this.nuevoUsuario = {
      nombre: '',
      apellido: '',
      correo: '',
      contrasena: '',
      telefono: '',
      rol: 'Cliente'
    };
  }
}

