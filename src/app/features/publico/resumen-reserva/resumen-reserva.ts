import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Location } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { MetodoPago, ResultadoPago } from '../metodo-pago/metodo-pago';

@Component({
  selector: 'app-resumen-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule, MetodoPago],
  templateUrl: './resumen-reserva.html',
  styleUrl: './resumen-reserva.scss'
})
export class ResumenReserva implements OnInit {
  reservaData: any = null;
  usuarioLogueado: number | null = null;
  guardando = false;
  errorMensaje = '';
  resultadoPago: ResultadoPago | null = null;
  metodoPago = {
    tipo: '',
    ultimoscuatrodigitos: '',
    fechaVencimiento: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private location: Location
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.reservaData = navigation?.extras.state?.['data'];
  }

  ngOnInit(): void {
    if (!this.reservaData) {
      this.router.navigate(['/publico/crear-reserva']);
      return;
    }
    this.usuarioLogueado = this.authService.getId();
  }
  onPagoRealizado(resultado: ResultadoPago) {
    this.resultadoPago = resultado;
  }
  confirmarYGuardar() {
    this.errorMensaje = '';

    if (!this.usuarioLogueado) {
      this.errorMensaje = 'Debes iniciar sesión para finalizar la reserva.';
      this.router.navigate(['/login']);
      return;
    }

    if (!this.resultadoPago) {
      this.errorMensaje = 'Completa el pago antes de confirmar.';
      return;
    }

    const igv = +(this.reservaData.total * 0.18).toFixed(2);

    const bodyFinal = {
      idUsuario: this.usuarioLogueado,
      habitaciones: this.reservaData.habitaciones.map((h: any) => ({
        idHabitacion: h.id_habitacion,
        fechaInicio: this.reservaData.fechaInicio,
        fechaFin: this.reservaData.fechaFin,
        precioUnitario: h.categoriaHabitacion.precio
      })),
      servicios: this.reservaData.servicios.map((s: any) => ({
        idServicio: s.idServicio,
        subtotal: s.precio
      })),
      pago: {
        total: this.reservaData.total,
        igv: igv,
        estadoPago: this.resultadoPago.estado, // ahora será 'APROBADO'
        referencia: this.resultadoPago.referencia,
        fechaPago: new Date().toISOString().split('T')[0],
        metodoPago: {
          tipo: this.resultadoPago.tipo,
          detalle: this.resultadoPago.detalle
        }
      }
    };

    this.guardando = true;
    this.http.post(`${environment.API_BASE_URL}/reservas/completa`, bodyFinal).subscribe({
      next: () => {
        this.guardando = false;
        localStorage.removeItem('temp_reserva');
        alert('¡Reserva registrada con éxito!');
        this.router.navigate(['/mis-reservas']);
      },
      error: (err) => {
        this.guardando = false;
        this.errorMensaje = err.error?.message || err.error || 'Error al registrar la reserva. Intenta de nuevo.';
      }
    });
  }

  cancelar() {
    this.location.back();
  }
}