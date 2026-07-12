import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { ReservaService } from '../services/reserva.services';
import { AdminServices } from '../services/admin.services';
import { ReservaModel } from '../../auth/models/reserva';
import { UsuarioModel } from '../../auth/models/usuario';
import { EstadoReserva } from '../../auth/models/EstadoReserva';

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

  // Lists
  reservas: ReservaModel[] = [];
  usuarios: UsuarioModel[] = [];
  reservasFiltradas: ReservaModel[] = [];
  reservasPaginados: ReservaModel[] = [];
  cargando = true;

  // Search & Filters
  buscarQuery = '';
  filtroEstado = '';

  // Pagination
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  // Modal controls
  mostrarModalReserva = false;
  modoEdicion = false;
  idReservaEditar: number | null = null;
  erroresBackend: any = {};

  public reservaForm: FormGroup = this.fb.group({
    id_reserva: [null],
    fechaCreacion: ['', Validators.required],
    usuario: [null, Validators.required],
    estado: ['', Validators.required]
  });

  get fechaCreacion() { return this.reservaForm.get('fechaCreacion'); }
  get usuario() { return this.reservaForm.get('usuario'); }
  get estado() { return this.reservaForm.get('estado'); }

  get minIndex(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.reservasFiltradas.length);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;
    
    // Load users first to populate select
    this.adminServ.getAllUsers().subscribe({
      next: (users) => {
        this.usuarios = users || [];
      },
      error: (err) => console.error('Error al cargar usuarios', err)
    });

    // Load reservations
    this.listarReservas();
  }

  listarReservas() {
    this.cargando = true;
    this.serv.getAllReservas().subscribe({
      next: (data) => {
        this.reservas = data || [];
        this.actualizarTabla();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar reservas', err);
        this.cargando = false;
      }
    });
  }

  actualizarTabla() {
    let result = [...this.reservas];

    // Search query: filter by user full name or reservation ID
    if (this.buscarQuery.trim()) {
      const q = this.buscarQuery.toLowerCase();
      result = result.filter(r => {
        const fullName = `${r.usuario?.nombre_usuario || ''} ${r.usuario?.apellido_paterno || ''} ${r.usuario?.apellido_materno || ''}`.toLowerCase();
        const idStr = (r.id_reserva || '').toString();
        return fullName.includes(q) || idStr.includes(q);
      });
    }

    // Filter by reservation status
    if (this.filtroEstado) {
      result = result.filter(r => r.estado === this.filtroEstado);
    }

    this.reservasFiltradas = result;

    // Pagination calculations
    this.totalPaginas = Math.ceil(result.length / this.itemsPorPagina) || 1;
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }

    const start = (this.paginaActual - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    this.reservasPaginados = result.slice(start, end);
  }

  cambiarPagina(pagina: number) {
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

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.idReservaEditar = null;
    this.erroresBackend = {};
    
    // Set default date as today
    const todayStr = new Date().toISOString().split('T')[0];
    this.reservaForm.reset({
      fechaCreacion: todayStr,
      estado: 'PENDIENTE',
      usuario: null
    });

    this.mostrarModalReserva = true;
  }

  editarReserva(res: ReservaModel): void {
    this.modoEdicion = true;
    this.idReservaEditar = res.id_reserva ?? null;
    this.erroresBackend = {};

    this.reservaForm.patchValue({
      id_reserva: res.id_reserva,
      fechaCreacion: res.fechaCreacion,
      usuario: res.usuario,
      estado: res.estado
    });

    this.mostrarModalReserva = true;
  }

  cerrarModal() {
    this.mostrarModalReserva = false;
    this.reservaForm.reset();
  }

  registroReserva(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    const form = this.reservaForm.value;

    const reserva: ReservaModel = {
      id_reserva: form.id_reserva,
      fechaCreacion: form.fechaCreacion,
      usuario: form.usuario,
      estado: form.estado
    };

    this.cargando = true;

    if (this.modoEdicion && this.idReservaEditar) {
      this.serv.putUpdateReserva(this.idReservaEditar, reserva).subscribe({
        next: () => {
          this.erroresBackend = {};
          this.cerrarModal();
          this.listarReservas();
        },
        error: err => {
          console.error(err.error);
          this.erroresBackend = err.error || {};
          this.cargando = false;
        }
      });
    } else {
      this.serv.postInsertReserva(reserva).subscribe({
        next: () => {
          this.erroresBackend = {};
          this.cerrarModal();
          this.listarReservas();
        },
        error: err => {
          console.error(err.error);
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
}
