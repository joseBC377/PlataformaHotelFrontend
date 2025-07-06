import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reserva-habitacion',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reserva-habitacion.html',
  styleUrl: './reserva-habitacion.scss'
})
export class ReservaHabitacion {
  modoEdicion = false;
  idReservaEditar: number | null = null;

  reservasHabitacion: any[] = [
    { id: 1, precio: 150.0, id_reserva: 'R001', id_habitacion: 'H101' },
    { id: 2, precio: 200.0, id_reserva: 'R002', id_habitacion: 'H102' },
    { id: 3, precio: 180.0, id_reserva: 'R003', id_habitacion: 'H103' }
  ];
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
