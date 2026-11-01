import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { ReservaService } from '../services/reserva.services';
import { AdminServices } from '../services/admin.services';
import { HabitacionServices } from '../services/habitacion.services';
import { ReservaModel } from '../../auth/models/reserva';
import { ReservaHabitacion } from '../../auth/models/reservaHabitacion';
import { UsuarioModel } from '../../auth/models/usuario';
import { Habitacion } from '../../auth/models/habitacion';

interface ResumenEstadia {
  entrada: string;
  salida: string;
  habitaciones: string;
}

@Component({
  selector: 'app-reservas-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './reserva.html',
  styleUrl: './reserva.scss'
})
export class ReservasAdminComponent implements OnInit {
  private fb = inject(FormBuilder);
  private serv = inject(ReservaService);
  private adminServ = inject(AdminServices);
  private habServ = inject(HabitacionServices);

  // Listados principales
  reservas: ReservaModel[] = [];
  reservasHabitaciones: ReservaHabitacion[] = [];
  usuarios: UsuarioModel[] = [];
  habitacionesDisponibles: Habitacion[] = [];
  reservasFiltradas: ReservaModel[] = [];
  reservasPaginados: ReservaModel[] = [];
  cargando = true;

  // Mapa de relación: id_reserva -> Estadía
  private estadiaPorReserva = new Map<number, ResumenEstadia>();

  // Filtros
  buscarQuery = '';
  filtroEstado = '';

  // Paginación
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  // Modal
  mostrarModalReserva = false;
  modoEdicion = false;
  idReservaEditar: number | null = null;
  erroresBackend: any = {};

  // Formulario reactivo
  public reservaForm: FormGroup = this.fb.group({
    id_reserva: [null],
    fechaCreacion: ['', Validators.required],
    usuario: [null, Validators.required],
    estado: ['', Validators.required],
    habitacion: [null],
    fechaEntrada: [''],
    fechaSalida: ['']
  });

  get fechaCreacion() { return this.reservaForm.get('fechaCreacion'); }
  get usuario() { return this.reservaForm.get('usuario'); }
  get estado() { return this.reservaForm.get('estado'); }
  get habitacion() { return this.reservaForm.get('habitacion'); }
  get fechaEntrada() { return this.reservaForm.get('fechaEntrada'); }
  get fechaSalida() { return this.reservaForm.get('fechaSalida'); }

  get minIndex(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.reservasFiltradas.length);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.cargando = true;

    // Cargar usuarios
    this.adminServ.getAllUsers().pipe(
      catchError(err => {
        console.error('Error al cargar usuarios', err);
        return of([] as UsuarioModel[]);
      })
    ).subscribe({
      next: (users) => {
        this.usuarios = users || [];
      }
    });

    // Cargar habitaciones usando HabitacionServices
    this.habServ.getAllHabitaciones().pipe(
      catchError(err => {
        console.warn('Error al cargar habitaciones', err);
        return of([] as Habitacion[]);
      })
    ).subscribe({
      next: (habs) => {
        this.habitacionesDisponibles = habs || [];
      }
    });

    this.listarReservas();
  }

  listarReservas(): void {
    this.cargando = true;

    forkJoin({
      reservas: this.serv.getAllReservas().pipe(
        catchError(err => {
          console.error('Error al cargar reservas', err);
          return of([] as ReservaModel[]);
        })
      ),
      habitaciones: this.serv.getReservasHabitaciones().pipe(
        catchError(err => {
          console.error('Error al cargar fechas de habitaciones', err);
          return of([] as ReservaHabitacion[]);
        })
      )
    }).subscribe({
      next: ({ reservas, habitaciones }) => {
        this.reservas = reservas || [];
        this.reservasHabitaciones = habitaciones || [];

        this.construirEstadias();
        this.actualizarTabla();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error en forkJoin', err);
        this.cargando = false;
      }
    });
  }

  private soloFecha(valor: unknown): string {
    if (!valor) return '';
    if (typeof valor === 'string') {
      if (valor.includes('T')) return valor.split('T')[0];
      if (valor.length >= 10) return valor.substring(0, 10);
      return valor;
    }
    if (Array.isArray(valor)) {
      const [year, month, day] = valor;
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }
    return '';
  }

  private construirEstadias(): void {
    this.estadiaPorReserva.clear();

    if (!this.reservasHabitaciones || this.reservasHabitaciones.length === 0) {
      return;
    }

    for (const rh of this.reservasHabitaciones as any[]) {
      let idReserva: number | null = null;

      for (const key of Object.keys(rh)) {
        const keyLower = key.toLowerCase();
        if (keyLower === 'id_reserva' || keyLower === 'idreserva' || keyLower === 'reservaid') {
          idReserva = Number(rh[key]);
          break;
        }
      }

      if (!idReserva && rh.reserva) {
        if (typeof rh.reserva === 'object') {
          for (const key of Object.keys(rh.reserva)) {
            const keyLower = key.toLowerCase();
            if (keyLower === 'id_reserva' || keyLower === 'idreserva' || keyLower === 'id') {
              idReserva = Number(rh.reserva[key]);
              break;
            }
          }
        } else if (!isNaN(Number(rh.reserva))) {
          idReserva = Number(rh.reserva);
        }
      }

      if (!idReserva || isNaN(idReserva)) {
        continue;
      }

      let rawInicio: any = null;
      let rawFin: any = null;

      for (const key of Object.keys(rh)) {
        const k = key.toLowerCase();
        if (k.includes('inicio') || k.includes('entrada') || k.includes('checkin')) {
          rawInicio = rh[key];
        }
        if (k.includes('fin') || k.includes('salida') || k.includes('checkout')) {
          rawFin = rh[key];
        }
      }

      const inicio = this.soloFecha(rawInicio);
      const fin = this.soloFecha(rawFin);

      const nombreHab = rh.habitacion?.nombre_habitacion 
                     ?? rh.habitacion?.nombreHabitacion 
                     ?? rh.habitacion?.nombre 
                     ?? (rh.id_habitacion ? `Hab. ${rh.id_habitacion}` : '');

      const estadiaExistente = this.estadiaPorReserva.get(idReserva);

      if (!estadiaExistente) {
        this.estadiaPorReserva.set(idReserva, {
          entrada: inicio,
          salida: fin,
          habitaciones: nombreHab
        });
      } else {
        if (inicio && (!estadiaExistente.entrada || inicio < estadiaExistente.entrada)) {
          estadiaExistente.entrada = inicio;
        }
        if (fin && (!estadiaExistente.salida || fin > estadiaExistente.salida)) {
          estadiaExistente.salida = fin;
        }
        if (nombreHab && !estadiaExistente.habitaciones.includes(nombreHab)) {
          estadiaExistente.habitaciones = estadiaExistente.habitaciones 
            ? `${estadiaExistente.habitaciones}, ${nombreHab}` 
            : nombreHab;
        }
      }
    }
  }

  fechaEntradaDe(r: ReservaModel): string {
    if (!r?.id_reserva) return '';
    return this.estadiaPorReserva.get(Number(r.id_reserva))?.entrada || '';
  }

  fechaSalidaDe(r: ReservaModel): string {
    if (!r?.id_reserva) return '';
    return this.estadiaPorReserva.get(Number(r.id_reserva))?.salida || '';
  }

  habitacionesDe(r: ReservaModel): string {
    if (!r?.id_reserva) return '';
    return this.estadiaPorReserva.get(Number(r.id_reserva))?.habitaciones || '';
  }

  nochesDe(r: ReservaModel): number {
    const e = this.fechaEntradaDe(r);
    const sal = this.fechaSalidaDe(r);
    if (!e || !sal) return 0;

    const fechaIni = new Date(e + 'T12:00:00');
    const fechaFin = new Date(sal + 'T12:00:00');
    const diffMs = fechaFin.getTime() - fechaIni.getTime();
    const noches = Math.round(diffMs / (1000 * 60 * 60 * 24));
    return noches > 0 ? noches : 0;
  }

  actualizarTabla(): void {
    let result = [...this.reservas];

    if (this.buscarQuery.trim()) {
      const q = this.buscarQuery.toLowerCase();
      result = result.filter(r => {
        const fullName = `${r.usuario?.nombre_usuario || ''} ${r.usuario?.apellido_paterno || ''} ${r.usuario?.apellido_materno || ''}`.toLowerCase();
        const idStr = (r.id_reserva || '').toString();
        return fullName.includes(q) || idStr.includes(q);
      });
    }

    if (this.filtroEstado) {
      result = result.filter(r => r.estado === this.filtroEstado);
    }

    this.reservasFiltradas = result;
    this.totalPaginas = Math.ceil(result.length / this.itemsPorPagina) || 1;
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }

    const start = (this.paginaActual - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    this.reservasPaginados = result.slice(start, end);
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarTabla();
    }
  }

  getInicialesCliente(r: ReservaModel): string {
    if (!r.usuario) return 'H';
    const n = r.usuario.nombre_usuario?.charAt(0) || '';
    const a = r.usuario.apellido_paterno?.charAt(0) || '';
    return (n + a).toUpperCase() || 'H';
  }

  badgeClass(estado: string): string {
    switch (estado) {
      case 'CONFIRMADO':
        return 'badge-success';
      case 'PENDIENTE':
        return 'badge-warning';
      case 'CANCELADO':
        return 'badge-danger';
      default:
        return 'badge-secondary';
    }
  }

  abrirModalNuevo(): void {
    this.modoEdicion = false;
    this.idReservaEditar = null;
    this.erroresBackend = {};

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    this.reservaForm.get('habitacion')?.setValidators([Validators.required]);
    this.reservaForm.get('fechaEntrada')?.setValidators([Validators.required]);
    this.reservaForm.get('fechaSalida')?.setValidators([Validators.required]);
    this.reservaForm.get('habitacion')?.updateValueAndValidity();
    this.reservaForm.get('fechaEntrada')?.updateValueAndValidity();
    this.reservaForm.get('fechaSalida')?.updateValueAndValidity();

    this.reservaForm.reset({
      fechaCreacion: todayStr,
      fechaEntrada: todayStr,
      fechaSalida: tomorrowStr,
      estado: 'PENDIENTE',
      usuario: null,
      habitacion: null
    });

    this.mostrarModalReserva = true;
  }

  editarReserva(res: ReservaModel): void {
    this.modoEdicion = true;
    this.idReservaEditar = res.id_reserva ?? null;
    this.erroresBackend = {};

    this.reservaForm.get('habitacion')?.clearValidators();
    this.reservaForm.get('fechaEntrada')?.clearValidators();
    this.reservaForm.get('fechaSalida')?.clearValidators();
    this.reservaForm.get('habitacion')?.updateValueAndValidity();
    this.reservaForm.get('fechaEntrada')?.updateValueAndValidity();
    this.reservaForm.get('fechaSalida')?.updateValueAndValidity();

    this.reservaForm.patchValue({
      id_reserva: res.id_reserva,
      fechaCreacion: this.soloFecha(res.fechaCreacion),
      fechaEntrada: this.fechaEntradaDe(res),
      fechaSalida: this.fechaSalidaDe(res),
      usuario: res.usuario,
      estado: res.estado
    });

    this.mostrarModalReserva = true;
  }

  cerrarModal(): void {
    this.mostrarModalReserva = false;
    this.reservaForm.reset();
  }

  registroReserva(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    const form = this.reservaForm.value;
    const reservaBase: ReservaModel = {
      id_reserva: form.id_reserva,
      fechaCreacion: form.fechaCreacion,
      usuario: form.usuario,
      estado: form.estado
    };

    this.cargando = true;

    if (this.modoEdicion && this.idReservaEditar) {
      this.serv.putUpdateReserva(this.idReservaEditar, reservaBase).subscribe({
        next: () => {
          this.cerrarModal();
          this.listarReservas();
        },
        error: err => {
          this.erroresBackend = err.error || {};
          this.cargando = false;
        }
      });
    } else {
      // 1. Guardar la cabecera en reserva
      this.serv.postInsertReserva(reservaBase).pipe(
        switchMap((reservaCreada: any) => {
          const idCreado = reservaCreada.id_reserva ?? reservaCreada.idReserva ?? reservaCreada.id;

          if (!form.habitacion) {
            return of(null);
          }

          // 2. Extraer precio de categoria_habitacion y asociar en reserva_habitacion
          const hab = form.habitacion as any;
          const precioFinal = hab.categoriaHabitacion?.precio 
                           ?? hab.categoria?.precio 
                           ?? hab.precio 
                           ?? hab.precio_noche 
                           ?? 100.0;
          const idHab = hab.id_habitacion ?? hab.id;

          const reservaHabitacionPayload: any = {
            fechaInicio: form.fechaEntrada,
            fechaFin: form.fechaSalida,
            precioUnitario: precioFinal,
            reserva: { id_reserva: idCreado },
            habitacion: { id_habitacion: idHab }
          };

          return this.serv.postInsertReservaHabitacion(reservaHabitacionPayload).pipe(
            catchError(err => {
              console.warn('Fallo al asociar habitacion en reserva_habitacion', err);
              return of(null);
            })
          );
        })
      ).subscribe({
        next: () => {
          this.cerrarModal();
          this.listarReservas();
        },
        error: err => {
          this.erroresBackend = err.error || {};
          this.cargando = false;
        }
      });
    }
  }

  eliminarReserva(id: number): void {
    if (!confirm('¿Desea eliminar esta reserva?')) return;

    this.serv.deleteIdReserva(id).subscribe({
      next: () => {
        this.listarReservas();
        if (this.idReservaEditar === id) {
          this.cerrarModal();
        }
      },
      error: err => console.error('Error al eliminar reserva', err)
    });
  }

  compararUsuario = (u1: UsuarioModel, u2: UsuarioModel): boolean => {
    return u1 && u2 ? u1.id_usuario === u2.id_usuario : u1 === u2;
  }

  compararHabitacion = (h1: any, h2: any): boolean => {
    if (!h1 || !h2) return false;
    const id1 = h1.id_habitacion ?? h1.id;
    const id2 = h2.id_habitacion ?? h2.id;
    return id1 === id2;
  }

  exportarExcel(): void {
    if (this.reservas.length === 0) {
      alert('No hay reservas para exportar.');
      return;
    }

    const filas = this.reservas.map(r => ({
      ID_Reserva: r.id_reserva,
      Huesped: `${r.usuario?.nombre_usuario ?? ''} ${r.usuario?.apellido_paterno ?? ''} ${r.usuario?.apellido_materno ?? ''}`
        .replace(/\s+/g, ' ')
        .trim(),
      Correo: r.usuario?.correo ?? '',
      FechaCreacion: this.soloFecha(r.fechaCreacion),
      FechaEntrada: this.fechaEntradaDe(r),
      FechaSalida: this.fechaSalidaDe(r),
      Noches: this.nochesDe(r),
      Habitaciones: this.habitacionesDe(r),
      Estado: r.estado
    }));

    const hoja = XLSX.utils.json_to_sheet(filas);
    hoja['!cols'] = [
      { wch: 12 }, { wch: 34 }, { wch: 30 },
      { wch: 14 }, { wch: 14 }, { wch: 14 }, { wch: 10 }, { wch: 28 }, { wch: 12 }
    ];

    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, 'Reservas');
    XLSX.writeFile(libro, 'reservas_export.xlsx');
  }
}