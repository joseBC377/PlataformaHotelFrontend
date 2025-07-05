import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reserva',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reserva.html',
  styleUrl: './reserva.scss'
})
export class Reserva {
   reservas = [
    {
      id_reserva: 1,
      fecha_inicio: '2025-07-06',
      fecha_fin: '2025-07-08',
      id_usuario: 101
    },
    {
      id_reserva: 2,
      fecha_inicio: '2025-07-10',
      fecha_fin: '2025-07-12',
      id_usuario: 102
    },
    {
      id_reserva: 3,
      fecha_inicio: '2025-07-15',
      fecha_fin: '2025-07-16',
      id_usuario: 103
    }
  ];

  eliminarReserva(id: number) {
    this.reservas = this.reservas.filter(r => r.id_reserva !== id);
  }
}