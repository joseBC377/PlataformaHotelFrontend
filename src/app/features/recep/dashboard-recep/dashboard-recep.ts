import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ReservaService } from '../../admin/services/reserva.services';
import { PagoService } from '../../admin/services/pago.services';
import { ReservaServicioService } from '../../admin/services/reserva-servicio.service';
import { HabitacionServices } from '../../admin/services/habitacion.services';
import { AdminServices } from '../../admin/services/admin.services';
import { ReservaHabitacion } from '../../auth/models/reservaHabitacion';
import { Habitacion } from '../../auth/models/habitacion';
import { UsuarioModel } from '../../auth/models/usuario';
import { ReservaModel } from '../../auth/models/reserva';
import { EstadoReserva } from '../../auth/models/EstadoReserva';
import { PagoModel } from '../../auth/models/pago';

@Component({
  selector: 'app-dashboard-recep',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard-recep.html',
  styleUrl: './dashboard-recep.scss'
})
export class DashboardRecep implements OnInit {
  private fb = inject(FormBuilder);
  private reservaService = inject(ReservaService);
  private pagoService = inject(PagoService);
  private reservaServicioService = inject(ReservaServicioService);
  private habitacionService = inject(HabitacionServices);
  private adminService = inject(AdminServices);

  reservasHabitaciones: ReservaHabitacion[] = [];
  pagos: PagoModel[] = [];
  habitaciones: Habitacion[] = [];
  clientes: UsuarioModel[] = [];
  cargando = true;
  totalReservasCount = 0;
  totalIngresos = 0;

  entradasPendientesCount = 0;
  entradasPendientesList: ReservaHabitacion[] = [];

  salidasProgramadasCount = 0;
  salidasProgramadasList: ReservaHabitacion[] = [];

  proximasLlegadas: ReservaHabitacion[] = [];

  // Modal de nueva reserva
  mostrarModalReserva = false;
  reservaForm!: FormGroup;
  noches = 0;
  precioPorNoche = 0;
  total = 0;
  errorMensaje: string | null = null;
  cruceFechasDetectado = false;

  // Búsqueda en tiempo real
  buscarQuery = '';

  // Notas del conserje en memoria
  notasConserje: string[] = [
    'El huésped de la 301 solicita almohadas de plumas adicionales a las 20:00.',
    'Limpieza profunda programada para suite presidencial 405 a las 12:00.',
    'Huésped VIP de la 204 requiere late check-out a las 15:00.'
  ];

  agregarNota(): void {
    const nota = prompt('Ingrese una nueva nota para el conserje:');
    if (nota && nota.trim()) {
      this.notasConserje.unshift(nota.trim());
    }
  }

  // Getters para conteos rápidos de habitaciones
  get countLibres(): number {
    return this.habitaciones.filter(h => this.getRoomVisualState(h) === 'libre').length;
  }

  get countOcupadas(): number {
    return this.habitaciones.filter(h => this.getRoomVisualState(h) === 'ocupada').length;
  }

  get countReservadas(): number {
    return this.habitaciones.filter(h => this.getRoomVisualState(h) === 'reservada').length;
  }

  get countLimpieza(): number {
    return this.habitaciones.filter(h => this.getRoomVisualState(h) === 'limpieza').length;
  }

  get countMantenimiento(): number {
    return this.habitaciones.filter(h => this.getRoomVisualState(h) === 'mantenimiento').length;
  }

  get proximasSalidas(): ReservaHabitacion[] {
    return [...this.salidasProgramadasList].sort((a, b) => {
      const dateA = this.parseLocalDate(a.fechaFin).getTime();
      const dateB = this.parseLocalDate(b.fechaFin).getTime();
      return dateA - dateB;
    });
  }

  // Listas filtradas por la barra de búsqueda
  get habitacionesFiltradas(): Habitacion[] {
    if (!this.buscarQuery.trim()) return this.habitaciones;
    const q = this.buscarQuery.toLowerCase();
    return this.habitaciones.filter(h => 
      h.nombre_habitacion?.toLowerCase().includes(q) ||
      h.categoriaHabitacion?.nombre_categoria?.toLowerCase().includes(q)
    );
  }

  get llegadasFiltradas(): ReservaHabitacion[] {
    if (!this.buscarQuery.trim()) return this.proximasLlegadas;
    const q = this.buscarQuery.toLowerCase();
    return this.proximasLlegadas.filter(rh => {
      const nombre = this.getNombreCliente(rh).toLowerCase();
      const num = rh.reserva?.id_reserva?.toString() || '';
      const hab = rh.habitacion?.nombre_habitacion?.toLowerCase() || '';
      return nombre.includes(q) || num.includes(q) || hab.includes(q);
    });
  }

  get salidasFiltradas(): ReservaHabitacion[] {
    if (!this.buscarQuery.trim()) return this.proximasSalidas;
    const q = this.buscarQuery.toLowerCase();
    return this.proximasSalidas.filter(rh => {
      const nombre = this.getNombreCliente(rh).toLowerCase();
      const num = rh.reserva?.id_reserva?.toString() || '';
      const hab = rh.habitacion?.nombre_habitacion?.toLowerCase() || '';
      return nombre.includes(q) || num.includes(q) || hab.includes(q);
    });
  }

  ngOnInit(): void {
    this.cargarDatos();
    this.initForm();
  }

  cargarDatos(): void {
    this.cargando = true;
    forkJoin({
      reservasServicio: this.reservaServicioService.listar(),
      pagos: this.pagoService.getAll(),
      reservasHab: this.reservaService.getReservasHabitaciones(),
      habs: this.habitacionService.getAllHabitaciones(),
      cls: this.adminService.getAllUsers()
    }).subscribe({
      next: ({ reservasServicio, pagos, reservasHab, habs, cls }) => {
        this.reservasHabitaciones = reservasHab || [];
        this.pagos = this.normalizarPagos(pagos);
        this.habitaciones = habs || [];
        this.clientes = cls || [];
        this.totalReservasCount = Array.isArray(reservasServicio) ? reservasServicio.length : 0;
        this.totalIngresos = this.calcularTotalIngresos(this.pagos);
        this.calcularKPIs();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard', err);
        this.cargando = false;
      }
    });
  }

  private calcularTotalIngresos(pagos: PagoModel[]): number {
    const totalAprobado = pagos
      .filter(pago => (pago.estado_pago || '').toString().toUpperCase() === 'APROBADO')
      .reduce((acumulado, pago) => acumulado + Number(pago.total || 0), 0);

    if (totalAprobado > 0) {
      return totalAprobado;
    }

    const totalBruto = pagos.reduce((acumulado, pago) => acumulado + Number(pago.total || 0), 0);
    if (totalBruto > 0) {
      return totalBruto;
    }

    return this.calcularTotalIngresosDesdeReservas();
  }

  private calcularTotalIngresosDesdeReservas(): number {
    const seen = new Set<number>();
    return this.reservasHabitaciones.reduce((acumulado, rh) => {
      const idReserva = rh.reserva?.id_reserva;
      const pago = rh.reserva?.pago;
      if (!idReserva || seen.has(idReserva) || !pago) {
        return acumulado;
      }

      seen.add(idReserva);
      const estado = (pago.estado_pago || '').toString().toUpperCase();
      if (estado === 'APROBADO' || Number(pago.total || 0) > 0) {
        return acumulado + Number(pago.total || 0);
      }

      return acumulado;
    }, 0);
  }

  private normalizarPagos(payload: any): PagoModel[] {
    if (Array.isArray(payload)) {
      return payload;
    }

    if (Array.isArray(payload?.content)) {
      return payload.content;
    }

    if (Array.isArray(payload?.data)) {
      return payload.data;
    }

    if (Array.isArray(payload?.items)) {
      return payload.items;
    }

    return [];
  }

  initForm(): void {
    const hoyStr = new Date().toISOString().split('T')[0];
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    const mananaStr = manana.toISOString().split('T')[0];

    this.reservaForm = this.fb.group({
      idCliente: [null, Validators.required],
      idHabitacion: [null, Validators.required],
      fechaInicio: [hoyStr, Validators.required],
      fechaFin: [mananaStr, Validators.required]
    });

    // Listen to changes to perform calculations and crossover check
    this.reservaForm.valueChanges.subscribe(val => {
      this.actualizarCalculos(val);
    });

    // Run initial calculations
    this.actualizarCalculos(this.reservaForm.value);
  }

  actualizarCalculos(val: any): void {
    if (!val) return;
    const { idHabitacion, fechaInicio, fechaFin } = val;
    this.errorMensaje = null;
    this.cruceFechasDetectado = false;

    // Get room details to extract price
    const room = this.habitaciones.find(h => h.id_habitacion === Number(idHabitacion));
    this.precioPorNoche = room?.categoriaHabitacion?.precio || 0;

    // Calculate nights
    this.noches = this.calcularNoches(fechaInicio, fechaFin);
    this.total = this.precioPorNoche * this.noches;

    if (fechaInicio && fechaFin) {
      const inicio = this.parseLocalDate(fechaInicio);
      const fin = this.parseLocalDate(fechaFin);
      if (fin.getTime() <= inicio.getTime()) {
        this.errorMensaje = 'La fecha de fin debe ser posterior a la fecha de inicio.';
        return;
      }
      if (this.noches === 0) {
        this.errorMensaje = 'El número de noches no puede ser cero.';
        return;
      }
    }

    // Check crossover
    if (idHabitacion && fechaInicio && fechaFin) {
      const crossover = this.tieneCruceDeFechas(Number(idHabitacion), fechaInicio, fechaFin);
      if (crossover) {
        this.cruceFechasDetectado = true;
        this.errorMensaje = '¡Alerta! Existe un cruce de fechas con una reserva activa para esta habitación.';
      }
    }
  }

  private parseLocalDate(dateStr: string): Date {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // 0-based month
      const day = parseInt(parts[2], 10);
      return new Date(year, month, day, 0, 0, 0, 0);
    }
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private calcularKPIs(): void {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 1. Entradas Pendientes
    const reservasEntradas = this.reservasHabitaciones.filter(rh => {
      if (!rh.fechaInicio || !rh.reserva) return false;
      const inicio = this.parseLocalDate(rh.fechaInicio);
      const estado = rh.reserva.estado;
      return inicio.getTime() > hoy.getTime() && estado !== 'CANCELADO';
    });

    const uniqueEntradasIds = new Set(
      reservasEntradas
        .map(rh => rh.reserva?.id_reserva)
        .filter((id): id is number => id !== undefined && id !== null)
    );
    this.entradasPendientesCount = uniqueEntradasIds.size;

    const seenEntradasIds = new Set<number>();
    this.entradasPendientesList = reservasEntradas.filter(rh => {
      if (!rh.reserva?.id_reserva) return false;
      if (seenEntradasIds.has(rh.reserva.id_reserva)) return false;
      seenEntradasIds.add(rh.reserva.id_reserva);
      return true;
    });

    // 2. Salidas Programadas
    const reservasSalidas = this.reservasHabitaciones.filter(rh => {
      if (!rh.fechaFin || !rh.reserva) return false;
      const fin = this.parseLocalDate(rh.fechaFin);
      const estado = rh.reserva.estado;
      return fin.getTime() >= hoy.getTime() && estado !== 'CANCELADO';
    });

    const uniqueSalidasIds = new Set(
      reservasSalidas
        .map(rh => rh.reserva?.id_reserva)
        .filter((id): id is number => id !== undefined && id !== null)
    );
    this.salidasProgramadasCount = uniqueSalidasIds.size;

    const seenSalidasIds = new Set<number>();
    this.salidasProgramadasList = reservasSalidas.filter(rh => {
      if (!rh.reserva?.id_reserva) return false;
      if (seenSalidasIds.has(rh.reserva.id_reserva)) return false;
      seenSalidasIds.add(rh.reserva.id_reserva);
      return true;
    });

    // 3. Próximas Llegadas (Sorted by fechaInicio ascending)
    this.proximasLlegadas = [...reservasEntradas].sort((a, b) => {
      const dateA = this.parseLocalDate(a.fechaInicio).getTime();
      const dateB = this.parseLocalDate(b.fechaInicio).getTime();
      return dateA - dateB;
    });
  }

  getRoomVisualState(room: Habitacion): 'libre' | 'reservada' | 'ocupada' | 'limpieza' | 'mantenimiento' {
    const estadoHabitacion = (room.estado || '').toString().toUpperCase();
    const tipoHabitacion = (room.tipo || '').toString().toUpperCase();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    // 1. Estado operativo de la habitación
    if (tipoHabitacion === 'MANTENIMIENTO') {
      return 'mantenimiento';
    }

    // 2. Limpieza
    if (tipoHabitacion === 'EN_LIMPIEZA' || tipoHabitacion === 'SUCIO') {
      return 'limpieza';
    }

    if (estadoHabitacion === 'OCUPADA') {
      return 'ocupada';
    }

    // Filter non-canceled reservations for this specific room
    const roomReservations = this.reservasHabitaciones.filter(rh => 
      rh.habitacion?.id_habitacion === room.id_habitacion && 
      rh.reserva?.estado !== 'CANCELADO'
    );

    // 3. Ocupada
    const hasActiveNow = roomReservations.some(rh => {
      if (!rh.fechaInicio || !rh.fechaFin) return false;
      const inicio = this.parseLocalDate(rh.fechaInicio);
      const fin = this.parseLocalDate(rh.fechaFin);
      return inicio.getTime() <= hoy.getTime() && fin.getTime() >= hoy.getTime();
    });

    if (hasActiveNow) {
      return 'ocupada';
    }

    // 4. Reservada
    const hasActiveFuture = roomReservations.some(rh => {
      if (!rh.fechaInicio) return false;
      const inicio = this.parseLocalDate(rh.fechaInicio);
      return inicio.getTime() > hoy.getTime();
    });

    if (hasActiveFuture) {
      return 'reservada';
    }

    // 5. Libre
    return 'libre';
  }

  getRoomStatusText(state: string): string {
    switch (state) {
      case 'mantenimiento': return 'MAN';
      case 'limpieza': return 'LIM';
      case 'ocupada': return 'OCU';
      case 'reservada': return 'RES';
      default: return 'LIB';
    }
  }

  seleccionarHabitacion(room: Habitacion): void {
    const estadoVisual = this.getRoomVisualState(room);
    if (estadoVisual === 'libre') {
      this.abrirModalReserva(room);
    } else {
      console.log('La habitación no está libre. Estado:', estadoVisual);
    }
  }

  formatFecha(fechaStr: string): string {
    if (!fechaStr) return '';
    const parts = fechaStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return fechaStr;
  }

  getNombreCliente(rh: ReservaHabitacion): string {
    const usuario = rh.reserva?.usuario;
    if (!usuario) return 'Huésped';
    const nombre = usuario.nombre_usuario || '';
    const apellido = usuario.apellido_paterno || '';
    return `${nombre} ${apellido}`.trim() || 'Huésped';
  }

  getInicialesCliente(rh: ReservaHabitacion): string {
    const usuario = rh.reserva?.usuario;
    if (!usuario) return 'H';
    const n = usuario.nombre_usuario?.charAt(0) || '';
    const a = usuario.apellido_paterno?.charAt(0) || '';
    return (n + a).toUpperCase() || 'H';
  }

  badgeClass(estado: string): string {
    switch (estado) {
      case 'CONFIRMADO':
      case 'APROBADO':
        return 'badge-success';
      case 'PENDIENTE':
        return 'badge-warning';
      case 'CANCELADO':
      case 'RECHAZADO':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  get fechaHoyFormateada(): string {
    const opciones: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = new Date().toLocaleDateString('es-ES', opciones);
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  }

  // Métodos del modal
  abrirModalReserva(room?: Habitacion): void {
    this.initForm();
    if (room && room.id_habitacion) {
      this.reservaForm.patchValue({
        idHabitacion: room.id_habitacion
      });
    }
    this.mostrarModalReserva = true;
  }

  cerrarModalReserva(): void {
    this.mostrarModalReserva = false;
  }

  get habitacionesDisponiblesParaReserva(): Habitacion[] {
    return this.habitaciones.filter(h => 
      h.tipo !== 'EN_LIMPIEZA' && 
      h.tipo !== 'SUCIO' && 
      h.tipo !== 'MANTENIMIENTO'
    );
  }

  calcularNoches(inicioStr: string, finStr: string): number {
    if (!inicioStr || !finStr) return 0;
    const inicio = this.parseLocalDate(inicioStr);
    const fin = this.parseLocalDate(finStr);
    const diff = fin.getTime() - inicio.getTime();
    if (diff <= 0) return 0;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  tieneCruceDeFechas(idHabitacion: number, inicioStr: string, finStr: string): boolean {
    if (!idHabitacion || !inicioStr || !finStr) return false;
    const nuevoInicio = this.parseLocalDate(inicioStr).getTime();
    const nuevoFin = this.parseLocalDate(finStr).getTime();

    return this.reservasHabitaciones.some(rh => {
      if (!rh.habitacion || rh.habitacion.id_habitacion !== idHabitacion) return false;
      if (!rh.fechaInicio || !rh.fechaFin || !rh.reserva) return false;
      if (rh.reserva.estado === 'CANCELADO') return false;

      const existInicio = this.parseLocalDate(rh.fechaInicio).getTime();
      const existFin = this.parseLocalDate(rh.fechaFin).getTime();

      // Cruce: nuevoInicio < existFin && nuevoFin > existInicio
      return nuevoInicio < existFin && nuevoFin > existInicio;
    });
  }

  onSubmitReserva(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    if (this.errorMensaje && !this.cruceFechasDetectado) {
      return;
    }

    const formVal = this.reservaForm.value;
    const client = this.clientes.find(c => c.id_usuario === Number(formVal.idCliente));
    if (!client) {
      this.errorMensaje = 'No se pudo encontrar al cliente seleccionado.';
      return;
    }

    const reserva: ReservaModel = {
      fechaCreacion: new Date().toISOString().split('T')[0],
      estado: EstadoReserva.PENDIENTE,
      usuario: client
    };

    this.cargando = true;
    this.reservaService.postInsertReserva(reserva).subscribe({
      next: (resCreada) => {
        if (!resCreada || !resCreada.id_reserva) {
          this.errorMensaje = 'Error al crear el registro de reserva en el backend.';
          this.cargando = false;
          return;
        }

        const reservaHabitacion = {
          fechaInicio: formVal.fechaInicio,
          fechaFin: formVal.fechaFin,
          precioUnitario: this.precioPorNoche,
          reserva: { id_reserva: resCreada.id_reserva },
          habitacion: { id_habitacion: Number(formVal.idHabitacion) }
        };

        this.reservaService.postInsertReservaHabitacion(reservaHabitacion).subscribe({
          next: () => {
            alert('¡Reserva creada con éxito en el sistema!');
            this.cerrarModalReserva();
            this.cargarDatos(); // Actualiza dashboard y listado automáticamente sin recargar
          },
          error: (err) => {
            console.error('Error al asociar la habitación a la reserva:', err);
            this.errorMensaje = err.error?.message || err.error || 'Error al guardar la relación de la habitación.';
            this.cargando = false;
          }
        });
      },
      error: (err) => {
        console.error('Error al crear la reserva base:', err);
        this.errorMensaje = err.error?.message || err.error || 'Error al crear la reserva base en el backend.';
        this.cargando = false;
      }
    });
  }
}
