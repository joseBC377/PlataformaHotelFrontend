import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reserva-habitacion',
  imports: [CommonModule, FormsModule],
  templateUrl: './reserva-habitacion.html',
  styleUrl: './reserva-habitacion.scss'
})
export class ReservaHabitacion {
  modoEdicion = false;
  idReservaEditar: number | null = null;

  reservasHabitacion: any[] = [];

  nuevaReserva = {
    precio: 0,
    id_reserva: '',
    id_habitacion: ''
  };

  agregarReserva() {
    const nueva = {
      ...this.nuevaReserva,
      id: this.reservasHabitacion.length + 1
    };
    this.reservasHabitacion.push(nueva);
    this.resetFormulario();
  }

  editarReserva(reserva: any) {
    this.nuevaReserva = { ...reserva };
    this.modoEdicion = true;
    this.idReservaEditar = reserva.id;
  }

  actualizarReserva() {
    if (this.idReservaEditar !== null) {
      const index = this.reservasHabitacion.findIndex(r => r.id === this.idReservaEditar);
      if (index !== -1) {
        this.reservasHabitacion[index] = { ...this.nuevaReserva, id: this.idReservaEditar };
      }
      this.modoEdicion = false;
      this.idReservaEditar = null;
      this.resetFormulario();
    }
  }

  eliminarReserva(id: number) {
    const confirmar = confirm('¿Deseas eliminar esta reserva?');
    if (confirmar) {
      this.reservasHabitacion = this.reservasHabitacion.filter(r => r.id !== id);
      if (this.idReservaEditar === id) {
        this.modoEdicion = false;
        this.idReservaEditar = null;
      }
    }
  }

  resetFormulario() {
    this.nuevaReserva = {
      precio: 0,
      id_reserva: '',
      id_habitacion: ''
    };
  }

}
