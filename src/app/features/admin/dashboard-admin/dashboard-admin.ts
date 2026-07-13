import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { forkJoin, Observable } from 'rxjs';
import { RouterLink } from '@angular/router';
import { jsPDF } from 'jspdf';
import { DashboardServices } from '../services/dashboard.services';
import { ReservaService } from '../services/reserva.services';
import { PagoService } from '../services/pago.services';
import { HabitacionServices } from '../services/habitacion.services';
import { AdminServices } from '../services/admin.services';
import { ReservaHabitacion } from '../../auth/models/reservaHabitacion';
import { Habitacion } from '../../auth/models/habitacion';
import { UsuarioModel } from '../../auth/models/usuario';
import { ReservaModel } from '../../auth/models/reserva';
import { EstadoReserva } from '../../auth/models/EstadoReserva';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.scss'
})
export class DashboardAdmin implements OnInit {
  private fb = inject(FormBuilder);
  private dashboardService = inject(DashboardServices);
  private reservaService = inject(ReservaService);
  private pagoService = inject(PagoService);
  private habitacionService = inject(HabitacionServices);
  private adminService = inject(AdminServices);

  stats: any = null;
  cargando = true;

  reservasHabitaciones: ReservaHabitacion[] = [];
  habitaciones: Habitacion[] = [];
  clientes: UsuarioModel[] = [];

  // Sistema de Notificaciones de la Campana
  mostrarNotificaciones = false;
  notificaciones: any[] = [];

  get unreadNotificationsCount(): number {
    return this.notificaciones.filter(n => !n.read).length;
  }

  toggleNotificaciones(): void {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
  }

  marcarTodasComoLeidas(): void {
    this.notificaciones.forEach(n => n.read = true);
  }

  agregarNotificacion(text: string, icon: string): void {
    this.notificaciones.unshift({
      id: Date.now().toString(),
      text,
      time: 'Hace un momento',
      icon,
      read: false
    });
  }

  // Modal de nueva reserva
  mostrarModalReserva = false;
  reservaForm!: FormGroup;
  noches = 0;
  precioPorNoche = 0;
  total = 0;
  errorMensaje: string | null = null;
  cruceFechasDetectado = false;

  // Modal de estado de habitación
  mostrarModalEstadoHabitacion = false;
  habitacionSeleccionada: Habitacion | null = null;
  nuevoEstadoComercial = '';
  nuevoEstadoOperativo = '';

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

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;
    forkJoin({
      stats: this.dashboardService.getStats(),
      reservasHab: this.reservaService.getReservasHabitaciones(),
      habs: this.habitacionService.getAllHabitaciones(),
      cls: this.adminService.getAllUsers()
    }).subscribe({
      next: ({ stats, reservasHab, habs, cls }) => {
        this.stats = stats;
        this.reservasHabitaciones = reservasHab || [];
        this.habitaciones = habs || [];
        this.clientes = cls || [];
        
        // Generar feed de notificaciones iniciales dinámicas
        this.generarNotificacionesIniciales();

        this.initForm();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard administrativo:', err);
        this.cargando = false;
      }
    });
  }

  generarNotificacionesIniciales(): void {
    this.notificaciones = [];

    // 1. Nuevas Reservas (las últimas 3 ordenadas por reserva ID desc)
    const reservasOrdenadas = [...this.reservasHabitaciones]
      .filter(rh => rh.reserva && rh.reserva.id_reserva)
      .sort((a, b) => (b.reserva!.id_reserva! - a.reserva!.id_reserva!));
      
    const ultimasReservas = reservasOrdenadas.slice(0, 3);
    ultimasReservas.forEach(rh => {
      const huesped = rh.reserva?.usuario?.nombre_usuario 
        ? `${rh.reserva.usuario.nombre_usuario} ${rh.reserva.usuario.apellido_paterno || ''}` 
        : 'Huésped';
      const habitacion = rh.habitacion?.nombre_habitacion || 'habitación';
      this.notificaciones.push({
        id: `res-${rh.reserva!.id_reserva}`,
        text: `Nueva reserva #${rh.reserva!.id_reserva}: ${huesped} asignado a la ${habitacion}.`,
        time: `Check-in: ${rh.fechaInicio}`,
        icon: 'booking',
        read: false
      });
    });

    // 2. Nuevos Clientes (los últimos 3 ordenadas por ID desc)
    const clientesOrdenados = [...this.clientes]
      .filter(c => c.id_usuario)
      .sort((a, b) => (b.id_usuario! - a.id_usuario!));

    const ultimosClientes = clientesOrdenados.slice(0, 3);
    ultimosClientes.forEach(c => {
      this.notificaciones.push({
        id: `cli-${c.id_usuario}`,
        text: `Nuevo cliente registrado: ${c.nombre_usuario} ${c.apellido_paterno || ''}.`,
        time: 'Cuenta creada recientemente',
        icon: 'user',
        read: false
      });
    });
  }

  alturaBarra(total: number): number {
    if (!this.stats?.ingresosPorMes?.length) return 0;
    const max = Math.max(...this.stats.ingresosPorMes.map((m: any) => m.total));
    return max > 0 ? (total / max) * 100 : 0;
  }

  // Métodos de Reserva y Cálculo
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

    this.reservaForm.valueChanges.subscribe(val => {
      this.actualizarCalculos(val);
    });

    this.actualizarCalculos(this.reservaForm.value);
  }

  actualizarCalculos(val: any): void {
    if (!val) return;
    const { idHabitacion, fechaInicio, fechaFin } = val;
    this.errorMensaje = null;
    this.cruceFechasDetectado = false;

    const room = this.habitaciones.find(h => h.id_habitacion === Number(idHabitacion));
    this.precioPorNoche = room?.categoriaHabitacion?.precio || 0;

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

    if (idHabitacion && fechaInicio && fechaFin) {
      const crossover = this.tieneCruceDeFechas(Number(idHabitacion), fechaInicio, fechaFin);
      if (crossover) {
        this.cruceFechasDetectado = true;
        this.errorMensaje = '¡Alerta! Existe un cruce de fechas con una reserva activa para esta habitación.';
      }
    }
  }

  private parseLocalDate(dateStr: string): Date {
    if (!dateStr) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const cleanStr = dateStr.substring(0, 10);
    if (cleanStr.includes('-')) {
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        return new Date(year, month, day, 0, 0, 0, 0);
      }
    }
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    return d;
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

      return nuevoInicio < existFin && nuevoFin > existInicio;
    });
  }

  // Helpers de Estado Visual
  getRoomVisualState(room: Habitacion): 'libre' | 'reservada' | 'ocupada' | 'limpieza' | 'mantenimiento' {
    const estadoHabitacion = (room.estado || '').toString().toUpperCase();
    const tipoHabitacion = (room.tipo || '').toString().toUpperCase();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (tipoHabitacion === 'MANTENIMIENTO') {
      return 'mantenimiento';
    }

    if (tipoHabitacion === 'EN_LIMPIEZA' || tipoHabitacion === 'SUCIO') {
      return 'limpieza';
    }

    if (estadoHabitacion === 'OCUPADA') {
      return 'ocupada';
    }

    const roomReservations = this.reservasHabitaciones.filter(rh => 
      rh.habitacion?.id_habitacion === room.id_habitacion && 
      rh.reserva?.estado !== 'CANCELADO'
    );

    const hasActiveNow = roomReservations.some(rh => {
      if (!rh.fechaInicio || !rh.fechaFin) return false;
      const inicio = this.parseLocalDate(rh.fechaInicio);
      const fin = this.parseLocalDate(rh.fechaFin);
      return inicio.getTime() <= hoy.getTime() && fin.getTime() >= hoy.getTime();
    });

    if (hasActiveNow) {
      return 'ocupada';
    }

    const hasActiveFuture = roomReservations.some(rh => {
      if (!rh.fechaInicio) return false;
      const inicio = this.parseLocalDate(rh.fechaInicio);
      return inicio.getTime() > hoy.getTime();
    });

    if (hasActiveFuture) {
      return 'reservada';
    }

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

  // Interacción con Habitaciones
  seleccionarHabitacion(room: Habitacion): void {
    this.abrirModalEstadoHabitacion(room);
  }

  abrirModalEstadoHabitacion(room: Habitacion): void {
    this.habitacionSeleccionada = room;
    this.nuevoEstadoComercial = room.estado || 'DISPONIBLE';
    this.nuevoEstadoOperativo = room.tipo || 'LIMPIO';
    this.mostrarModalEstadoHabitacion = true;
  }

  cerrarModalEstadoHabitacion(): void {
    this.mostrarModalEstadoHabitacion = false;
    this.habitacionSeleccionada = null;
  }

  guardarEstadoHabitacion(): void {
    if (!this.habitacionSeleccionada || !this.habitacionSeleccionada.id_habitacion) return;

    const updatedRoom: Habitacion = {
      ...this.habitacionSeleccionada,
      estado: this.nuevoEstadoComercial as any,
      tipo: this.nuevoEstadoOperativo as any
    };

    this.cargando = true;
    this.habitacionService.putEditarHabitacion(this.habitacionSeleccionada.id_habitacion, updatedRoom).subscribe({
      next: () => {
        this.agregarNotificacion(`Habitación ${this.habitacionSeleccionada?.nombre_habitacion} actualizada a ${this.nuevoEstadoComercial} - ${this.nuevoEstadoOperativo}`, 'update');
        alert('¡El estado de la habitación ha sido actualizado con éxito!');
        this.cerrarModalEstadoHabitacion();
        this.cargarDatos();
      },
      error: (err) => {
        console.error('Error al actualizar el estado de la habitación:', err);
        alert('No se pudo actualizar el estado de la habitación.');
        this.cargando = false;
      }
    });
  }

  irAReservarHabitacion(): void {
    if (this.habitacionSeleccionada) {
      const room = this.habitacionSeleccionada;
      this.cerrarModalEstadoHabitacion();
      this.abrirModalReserva(room);
    }
  }

  // Modal Reserva Helpers
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
            const roomToUpdate = this.habitaciones.find(h => h.id_habitacion === Number(formVal.idHabitacion));
            if (roomToUpdate && roomToUpdate.id_habitacion) {
              const updatedRoom: Habitacion = {
                ...roomToUpdate,
                estado: 'OCUPADA' as any
              };
              this.habitacionService.putEditarHabitacion(roomToUpdate.id_habitacion, updatedRoom).subscribe({
                next: () => {
                  this.agregarNotificacion(`Reserva creada para ${client.nombre_usuario} en la habitación ${roomToUpdate.nombre_habitacion}`, 'booking');
                  alert('¡Reserva creada con éxito y estado de la habitación actualizado a OCUPADA!');
                  this.cerrarModalReserva();
                  this.cargarDatos();
                },
                error: (err) => {
                  console.error('Error al actualizar el estado de la habitación en la BD:', err);
                  alert('¡Reserva registrada con éxito, pero no se pudo cambiar el estado de la habitación a OCUPADA!');
                  this.cerrarModalReserva();
                  this.cargarDatos();
                }
              });
            } else {
              this.agregarNotificacion(`Reserva creada con éxito para ${client.nombre_usuario}`, 'booking');
              alert('¡Reserva creada con éxito en el sistema!');
              this.cerrarModalReserva();
              this.cargarDatos();
            }
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

  descargarReporte(): void {
    if (!this.stats) {
      alert('Los datos del reporte aún no están listos.');
      return;
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const primaryNavy = [10, 25, 44]; 
    const accentGold = [197, 160, 89]; 
    const secondaryNavy = [30, 62, 98]; 
    const textGray = [74, 85, 104]; 

    doc.setFillColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setFillColor(accentGold[0], accentGold[1], accentGold[2]);
    doc.rect(0, 42, 210, 1.5, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('ROYAL SUITE HOTEL', 15, 20);

    doc.setTextColor(accentGold[0], accentGold[1], accentGold[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('INFORME ESTADÍSTICO ADMINISTRATIVO', 15, 28);

    const fecha = new Date().toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`Generado: ${fecha}`, 210 - 15, 20, { align: 'right' });
    doc.text('Área de Administración General', 210 - 15, 26, { align: 'right' });

    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('1. Indicadores Clave de Rendimiento (KPIs)', 15, 58);

    doc.setFillColor(244, 246, 249);
    doc.roundedRect(15, 64, 85, 25, 3, 3, 'F');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('INGRESOS DEL MES', 20, 71);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`S/ ${this.stats.ingresosMes?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 20, 81);

    doc.setFillColor(244, 246, 249);
    doc.roundedRect(110, 64, 85, 25, 3, 3, 'F');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('OCUPACIÓN DE HABITACIONES', 115, 71);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${this.stats.porcentajeOcupacion?.toFixed(1)}%`, 115, 81);

    doc.setFillColor(244, 246, 249);
    doc.roundedRect(15, 94, 85, 25, 3, 3, 'F');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('RESERVAS DEL MES', 20, 101);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${this.stats.reservasMes || 0}`, 20, 111);

    doc.setFillColor(244, 246, 249);
    doc.roundedRect(110, 94, 85, 25, 3, 3, 'F');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('CLIENTES REGISTRADOS', 115, 101);
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(`${this.stats.totalClientes || 0}`, 115, 111);

    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('2. Desglose de Ingresos Mensuales', 15, 134);

    let currentY = 142;
    doc.setFillColor(secondaryNavy[0], secondaryNavy[1], secondaryNavy[2]);
    doc.rect(15, currentY, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Mes de Registro', 20, currentY + 5.5);
    doc.text('Ingreso Neto Registrado', 120, currentY + 5.5);
    currentY += 8;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    const ingresos = this.stats.ingresosPorMes || [];
    ingresos.forEach((item: any, idx: number) => {
      if (idx % 2 === 0) {
        doc.setFillColor(250, 251, 252);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(15, currentY, 180, 8, 'F');
      doc.text(item.mes || 'Sin mes', 20, currentY + 5.5);
      doc.text(`S/ ${item.total?.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`, 120, currentY + 5.5);
      currentY += 8;
    });

    currentY += 8;
    doc.setTextColor(primaryNavy[0], primaryNavy[1], primaryNavy[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('3. Distribución Operativa de Habitaciones', 15, currentY);
    currentY += 8;

    doc.setFillColor(secondaryNavy[0], secondaryNavy[1], secondaryNavy[2]);
    doc.rect(15, currentY, 180, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Estado Físico / Operativo', 20, currentY + 5.5);
    doc.text('Cantidad de Unidades', 120, currentY + 5.5);
    currentY += 8;

    const estadosHab = [
      { name: 'Disponibles / Limpias', count: this.countLibres },
      { name: 'Ocupadas / Activas', count: this.countOcupadas },
      { name: 'En Limpieza / Sucias', count: this.countLimpieza },
      { name: 'Mantenimiento inhabilitante', count: this.countMantenimiento }
    ];

    estadosHab.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(250, 251, 252);
      } else {
        doc.setFillColor(255, 255, 255);
      }
      doc.rect(15, currentY, 180, 8, 'F');
      doc.setTextColor(textGray[0], textGray[1], textGray[2]);
      doc.text(item.name, 20, currentY + 5.5);
      doc.text(`${item.count} unidades`, 120, currentY + 5.5);
      currentY += 8;
    });

    doc.setDrawColor(accentGold[0], accentGold[1], accentGold[2]);
    doc.setLineWidth(0.5);
    doc.line(15, 280, 195, 280);

    doc.setTextColor(textGray[0], textGray[1], textGray[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Documento de confidencialidad administrativa - Royal Suite Hotel', 15, 285);
    doc.text('Página 1 de 1', 195, 285, { align: 'right' });

    doc.save(`reporte-royal-suite-${new Date().toISOString().split('T')[0]}.pdf`);
  }
}