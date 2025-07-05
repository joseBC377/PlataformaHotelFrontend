import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Resena {
  id: number;
  calificacion: number;
  fecha: string;
  id_usuario: number;
  id_habitacion: number;
}

interface NuevaResena {
  calificacion: number | null;
  fecha: string;
  id_usuario: number | null;
  id_habitacion: number | null;
}

@Component({
  selector: 'app-resena-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resenas.html',
  styleUrls: ['./resenas.scss']
})
export class ResenaAdminComponent {
  resenas: Resena[] = [
    { id: 1, calificacion: 4.5, fecha: '2025-07-01', id_usuario: 1, id_habitacion: 1 },
    { id: 2, calificacion: 5.0, fecha: '2025-07-02', id_usuario: 2, id_habitacion: 2 },
    { id: 3, calificacion: 5.0, fecha: '2025-07-02', id_usuario: 2, id_habitacion: 5 }
  ];

  usuarios = [
    { id: 1 },
    { id: 2 },
    { id: 3 }
  ];

  habitaciones = [
    { id: 1 },
    { id: 2 },
    { id: 3 }
  ];

  nuevaResena: NuevaResena = {
    calificacion: null,
    fecha: '',
    id_usuario: null,
    id_habitacion: null
  };

  modoEdicion = false;
  idEditar: number | null = null;

  agregarResena() {
    if (
      this.nuevaResena.calificacion === null ||
      this.nuevaResena.fecha === '' ||
      this.nuevaResena.id_usuario === null ||
      this.nuevaResena.id_habitacion === null
    ) return;

    if (this.modoEdicion && this.idEditar !== null) {
      const index = this.resenas.findIndex(r => r.id === this.idEditar);
      if (index !== -1) {
        this.resenas[index] = {
          ...this.nuevaResena as Resena,
          id: this.idEditar
        };
      }
    } else {
      const nueva: Resena = {
        ...this.nuevaResena as Resena,
        id: this.generarNuevoId()
      };
      this.resenas.push(nueva);
    }

    this.resetFormulario();
  }

  editarResena(r: Resena) {
    this.nuevaResena = {
      calificacion: r.calificacion,
      fecha: r.fecha,
      id_usuario: r.id_usuario,
      id_habitacion: r.id_habitacion
    };
    this.idEditar = r.id;
    this.modoEdicion = true;
  }

  eliminarResena(id: number) {
    this.resenas = this.resenas.filter(r => r.id !== id);
    if (this.idEditar === id) this.resetFormulario();
  }

  actualizarResena() {
    this.agregarResena();
  }

  private resetFormulario() {
    this.nuevaResena = {
      calificacion: null,
      fecha: '',
      id_usuario: null,
      id_habitacion: null
    };
    this.modoEdicion = false;
    this.idEditar = null;
  }

  private generarNuevoId(): number {
    return this.resenas.length > 0 ? Math.max(...this.resenas.map(r => r.id)) + 1 : 1;
  }
}