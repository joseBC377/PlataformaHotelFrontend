import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { ServicioService } from '../../admin/services/servicio.service';
import { Location } from '@angular/common';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-resumen-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resumen-reserva.html',
  styleUrl: './resumen-reserva.scss'
})
export class ResumenReserva implements OnInit {
  reservaData: any = null;
  usuarioLogueado: number | null = null;

  pasoActual: 1 | 2 | 3 = 1;
  guardando = false;
  errorMensaje = '';
  mostrarConfirmacion = false;


  // Paso 1
  infoPersonal = {
    nombreCompleto: '',
    email: '',
    telefono: ''
  };
  numeroHuespedes = 1;
  capacidadMaxima = 1;

  // Paso 2
  serviciosList: any[] = [];
  serviciosSeleccionados: any[] = [];

  // Paso 3
  metodoPago = {
    tipo: '',
    numeroTarjeta: '',
    nombreTarjeta: '',
    fechaVencimiento: '',
    cvv: ''
  };

  // Pago QR simulado (Yape/Plin)
  qrUrl = '';
  codigoOperacion = '';
  verificandoPago = false;
  pagoQrVerificado = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private servicioService: ServicioService,
    private http: HttpClient,
    private location: Location
  ) {
    const navigation = this.router.getCurrentNavigation();
    this.reservaData = navigation?.extras.state?.['data'];
  }

  ngOnInit(): void {
    // Si no viene por navegación (ej: volvió del login), intenta recuperar del localStorage
    if (!this.reservaData) {
      const guardado = localStorage.getItem('temp_reserva');
      if (guardado) {
        this.reservaData = JSON.parse(guardado);
      }
    }

    if (!this.reservaData) {
      this.router.navigate(['/crear-reserva']);
      return;
    }

    this.usuarioLogueado = this.authService.getId();

    // Autocompletar nombre desde el usuario logueado (si ya inició sesión)
    if (this.usuarioLogueado) {
      const nombre = this.authService.getNombre() || '';
      const apellido = this.authService.getApellidoPaterno() || '';
      this.infoPersonal.nombreCompleto = `${nombre} ${apellido}`.trim();
    }

    // Capacidad máxima según la(s) habitación(es) elegidas
    this.capacidadMaxima = this.reservaData.habitaciones.reduce(
      (max: number, h: any) => Math.max(max, h.categoriaHabitacion?.capacidad || 1), 1
    );

    this.servicioService.listar().subscribe(data => this.serviciosList = data);
  }

  toggleServicio(servicio: any) {
    const index = this.serviciosSeleccionados.findIndex(s => s.idServicio === servicio.idServicio);
    if (index > -1) {
      this.serviciosSeleccionados.splice(index, 1);
    } else {
      this.serviciosSeleccionados.push(servicio);
    }
  }

  estaSeleccionado(servicio: any): boolean {
    return this.serviciosSeleccionados.some(s => s.idServicio === servicio.idServicio);
  }
  onTipoPagoChange() {
    this.errorMensaje = '';
    this.pagoQrVerificado = false;
    this.codigoOperacion = '';

    if (this.metodoPago.tipo === 'YAPE' || this.metodoPago.tipo === 'PLIN') {
      const data = `${this.metodoPago.tipo}-RESERVA-${this.totalFinal}-${Date.now()}`;
      this.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
    }
  }

  verificarPagoQr() {
    if (!this.codigoOperacion.trim()) return;
    this.verificandoPago = true;

    setTimeout(() => {
      this.verificandoPago = false;
      this.pagoQrVerificado = true;
    }, 1200);
  }
  get totalServicios(): number {
    return this.serviciosSeleccionados.reduce((sum, s) => sum + s.precio, 0);
  }

  get totalFinal(): number {
    return this.reservaData.totalHabitaciones + this.totalServicios;
  }

  irAPaso(paso: 1 | 2 | 3) {
    this.errorMensaje = '';

    if (paso > this.pasoActual) {
      // Validar antes de avanzar
      if (this.pasoActual === 1) {
        if (!this.infoPersonal.nombreCompleto || !this.infoPersonal.email || !this.infoPersonal.telefono) {
          this.errorMensaje = 'Completa tu información personal.';
          return;
        }
        if (this.numeroHuespedes < 1 || this.numeroHuespedes > this.capacidadMaxima) {
          this.errorMensaje = `El número de huéspedes debe estar entre 1 y ${this.capacidadMaxima}.`;
          return;
        }
      }
    }
    this.pasoActual = paso;
  }

  // Guarda el estado actual antes de mandar al usuario a loguearse/registrarse
  irALogin() {
    localStorage.setItem('temp_reserva', JSON.stringify(this.reservaData));
    this.router.navigate(['/login'], { queryParams: { returnUrl: '/resumen' } });
  }

  irARegistro() {
    localStorage.setItem('temp_reserva', JSON.stringify(this.reservaData));
    this.router.navigate(['/registro'], { queryParams: { returnUrl: '/resumen' } });
  }

  confirmarYGuardar() {
    this.errorMensaje = '';

    if (!this.usuarioLogueado) {
      this.errorMensaje = 'Debes iniciar sesión para finalizar la reserva.';
      return;
    }

    if (!this.metodoPago.tipo) {
      this.errorMensaje = 'Selecciona un método de pago.';
      return;
    }

    if (this.metodoPago.tipo === 'TARJETA' &&
      (!this.metodoPago.numeroTarjeta || this.metodoPago.numeroTarjeta.length < 4 ||
        !this.metodoPago.nombreTarjeta || !this.metodoPago.fechaVencimiento || !this.metodoPago.cvv)) {
      this.errorMensaje = 'Completa todos los datos de la tarjeta.';
      return;
    }
    if ((this.metodoPago.tipo === 'YAPE' || this.metodoPago.tipo === 'PLIN') && !this.pagoQrVerificado) {
      this.errorMensaje = 'Verifica tu pago antes de continuar.';
      return;
    }
    const igv = +(this.totalFinal * 0.18).toFixed(2);

    // Solo se envían los últimos 4 dígitos; el número completo nunca se transmite
    const ultimosCuatro = this.metodoPago.tipo === 'TARJETA'
      ? this.metodoPago.numeroTarjeta.replace(/\s/g, '').slice(-4)
      : null;

    const bodyFinal = {
      idUsuario: this.usuarioLogueado,
      emailContacto: this.infoPersonal.email,
      habitaciones: this.reservaData.habitaciones.map((h: any) => ({
        idHabitacion: h.id_habitacion,
        fechaInicio: this.reservaData.fechaInicio,
        fechaFin: this.reservaData.fechaFin,
        precioUnitario: h.categoriaHabitacion.precio
      })),
      servicios: this.serviciosSeleccionados.map((s: any) => ({
        idServicio: s.idServicio,
        subtotal: s.precio
      })),
      pago: {
        total: this.totalFinal,
        igv: igv,
        estadoPago: 'APROBADO',
        fechaPago: new Date().toISOString().split('T')[0],
        metodoPago: {
          tipo: this.metodoPago.tipo,
          ultimoscuatrodigitos: ultimosCuatro,
          fechaVencimiento: this.metodoPago.tipo === 'TARJETA' ? this.metodoPago.fechaVencimiento : null,
          codigoOperacion: (this.metodoPago.tipo === 'YAPE' || this.metodoPago.tipo === 'PLIN') ? this.codigoOperacion : null
        }
      }
    };

    this.guardando = true;
    this.http.post(`${environment.API_BASE_URL}/reservas/completa`, bodyFinal).subscribe({
      next: () => {
        this.guardando = false;
        localStorage.removeItem('temp_reserva');
        this.mostrarConfirmacion = true;
      },
      error: (err) => {
        this.guardando = false;
        this.errorMensaje = err.error?.message || err.error || 'Error al registrar la reserva. Intenta de nuevo.';
      }
    });
  }

  volverAlInicio() {
    this.router.navigate(['/']);
  }

  cancelar() {
    this.location.back();
  }
}