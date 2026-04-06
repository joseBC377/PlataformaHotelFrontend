import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ReservaService } from '../../admin/services/reserva.services';
import { EstadoReserva } from '../../auth/models/EstadoReserva';
import { Location } from '@angular/common';

@Component({
  selector: 'app-resumen-reserva',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resumen-reserva.html',
  styleUrl: './resumen-reserva.scss'
})
export class ResumenReserva {
  reservaData: any = null;
  usuarioLogueado: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private reservaService: ReservaService,
    private location: Location
  ) {
    // Recuperamos el objeto enviado por el router
    const navigation = this.router.getCurrentNavigation();
    this.reservaData = navigation?.extras.state?.['data'];
  }

  ngOnInit(): void {
    // Seguridad: Si no hay datos, regresar a la selección
    if (!this.reservaData) {
      this.router.navigate(['/publico/crear-reserva']);
      return;
    }
    // Jalamos el ID del cliente logueado
    this.usuarioLogueado = this.authService.getId();
  }

  confirmarYGuardar() {
    if (!this.usuarioLogueado) {
      alert('Debes iniciar sesión para finalizar la reserva.');
      this.router.navigate(['/login']);
      return;
    }

    const bodyFinal = {
      fecha_reserva: new Date().toISOString().split('T')[0],
      usuario: this.usuarioLogueado,
      estado: EstadoReserva.PENDIENTE,
      detallesHabitaciones: [{
        fecha_inicio: this.reservaData.fechaInicio,
        fecha_fin: this.reservaData.fechaFin,
        precio_uni: this.reservaData.habitacion.categoriaHabitacion.precio,
        habitacion: { id: this.reservaData.habitacion.id }
      }],
      detallesServicios: this.reservaData.servicios.map((s: any) => ({
        id: { id_reserva: 0, id_servicio: s.id },
        servicio: { id: s.id },
        precioUnitario: s.precio
      }))
    };

    this.reservaService.postInsertReserva(bodyFinal).subscribe({
      next: (res) => {
        alert('¡Reserva registrada con éxito!');
        this.router.navigate(['/crear-reserva']);
      },
      error: (err) => {
        console.error(err);
        alert('Error al conectar con el servidor.');
      }
    });
  }

  cancelar() {
    this.location.back();
  }

}