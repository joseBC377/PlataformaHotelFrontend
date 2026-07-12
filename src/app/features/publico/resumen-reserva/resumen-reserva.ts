import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
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
export class ResumenReserva implements OnInit {
  reservaData: any = null;
  usuarioLogueado: any = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private reservaService: ReservaService,
    private location: Location,
    @Inject(PLATFORM_ID) private platformId: Object // Inyección necesaria para SSR
  ) {
    const navigation = this.router.getCurrentNavigation();
    
    // Solo accedemos a localStorage si estamos en el navegador
    if (isPlatformBrowser(this.platformId)) {
      this.reservaData = navigation?.extras.state?.['data'] || 
                         JSON.parse(localStorage.getItem('temp_reserva') || 'null');
    }
  }

  ngOnInit(): void {
    if (!this.reservaData) {
      this.router.navigate(['/publico/crear-reserva']);
      return;
    }
    this.usuarioLogueado = this.authService.getId();
  }

  private formatToISO(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  confirmarYGuardar() {
    if (!this.usuarioLogueado) {
      alert('Debes iniciar sesión para finalizar la reserva.');
      this.router.navigate(['/login']);
      return;
    }

    // Validación del array de habitaciones
    if (!this.reservaData?.habitaciones || this.reservaData.habitaciones.length === 0) {
      alert('Error: Los datos de la habitación no están completos.');
      return;
    }

    const detalles = this.reservaData.habitaciones.map((h: any) => ({
      fecha_inicio: this.formatToISO(this.reservaData.fechaInicio),
      fecha_fin: this.formatToISO(this.reservaData.fechaFin),
      precio_uni: h.categoriaHabitacion?.precio || 0,
      habitacion: { id: h.id }
    }));

    const bodyFinal = {
      fechaCreacion: this.formatToISO(new Date()),
      usuario: { id_usuario: this.usuarioLogueado }, 
      estado: EstadoReserva.PENDIENTE,
      pago: null,
      detallesHabitaciones: detalles,
      detallesServicios: this.reservaData.servicios?.map((s: any) => ({
        id: { id_reserva: 0, id_servicio: s.id },
        servicio: { id: s.id },
        precioUnitario: s.precio
      })) || []
    };

    this.reservaService.postInsertReserva(bodyFinal as any).subscribe({
      next: (res) => {
        alert('¡Reserva registrada con éxito!');
        
        // Limpiamos el almacenamiento local de forma segura
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('temp_reserva');
        }
        
        this.router.navigate(['/crear-reserva']);
      },
      error: (err) => {
        console.error('Error del servidor:', err);
        alert('Error al conectar con el servidor.');
      }
    });
  }

  cancelar() {
    this.location.back();
  }
}