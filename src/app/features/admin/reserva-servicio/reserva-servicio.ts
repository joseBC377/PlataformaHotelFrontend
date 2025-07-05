import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReservaServicio {
  id: number;
  id_reserva: number;
  id_servicio: number;
}

interface NuevaReservaServicio {
  id_reserva: number | null;
  id_servicio: number | null;
}

@Component({
  selector: 'app-reserva-servicio-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reserva-servicio.html',
  styleUrls: ['./reserva-servicio.scss']
})
export class ReservaServicioAdminComponent {
  reservaServicios: ReservaServicio[] = [
    { id: 1, id_reserva: 101, id_servicio: 201 },
    { id: 2, id_reserva: 102, id_servicio: 203 },
  ];

  reservas = [
    { id: 101 },
    { id: 102 },
    { id: 103 }
  ];

  servicios = [
    { id: 201 },
    { id: 202 },
    { id: 203 }
  ];

  nuevaReservaServicio: NuevaReservaServicio = {
    id_reserva: null,
    id_servicio: null
  };

  modoEdicion = false;
  idEditar: number | null = null;

  agregarReservaServicio() {
    if (this.nuevaReservaServicio.id_reserva === null || this.nuevaReservaServicio.id_servicio === null) return;

    if (this.modoEdicion && this.idEditar !== null) {
      const index = this.reservaServicios.findIndex(rs => rs.id === this.idEditar);
      if (index !== -1) {
        this.reservaServicios[index] = {
          ...this.nuevaReservaServicio as { id_reserva: number, id_servicio: number },
          id: this.idEditar
        };
      }
    } else {
      const nuevo: ReservaServicio = {
        ...this.nuevaReservaServicio as { id_reserva: number, id_servicio: number },
        id: this.generarNuevoId()
      };
      this.reservaServicios.push(nuevo);
    }
    this.resetFormulario();
  }

  editarReservaServicio(rs: ReservaServicio) {
    this.nuevaReservaServicio = { id_reserva: rs.id_reserva, id_servicio: rs.id_servicio };
    this.idEditar = rs.id;
    this.modoEdicion = true;
  }

  eliminarReservaServicio(id: number) {
    this.reservaServicios = this.reservaServicios.filter(rs => rs.id !== id);
    if (this.idEditar === id) {
      this.resetFormulario();
    }
  }

  actualizarReservaServicio() {
    this.agregarReservaServicio();
  }

  private resetFormulario() {
    this.nuevaReservaServicio = { id_reserva: null, id_servicio: null };
    this.idEditar = null;
    this.modoEdicion = false;
  }

  private generarNuevoId(): number {
    return this.reservaServicios.length > 0 ? Math.max(...this.reservaServicios.map(rs => rs.id)) + 1 : 1;
  }
}
