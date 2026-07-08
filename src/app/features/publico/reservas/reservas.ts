import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ReservaService } from '../../admin/services/reserva.services';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss'
})
export class Reservas implements OnInit {
  reservas: any[] = [];
  cargando = true;

  private reservaService = inject(ReservaService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    const idUsuario = this.authService.getId();
    if (!idUsuario) {
      this.cargando = false;
      return;
    }
    this.reservaService.getHistorialPorUsuario(idUsuario).subscribe({
      next: (data) => {
        this.reservas = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  badgeClass(estado: string): string {
  switch (estado) {
    case 'CONFIRMADO':
    case 'APROBADO':
      return 'bg-success';
    case 'PENDIENTE':
      return 'bg-warning';
    case 'CANCELADO':
    case 'RECHAZADO':
      return 'bg-danger';
    default:
      return 'bg-secondary';
  }
}
}