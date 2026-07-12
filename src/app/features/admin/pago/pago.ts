import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { PagoModel, PagoRequestModel } from '../../auth/models/pago';
import { ReservaModel } from '../../auth/models/reserva';
import { MetodoPagoModel } from '../../auth/models/metodopago';
import { PagoService } from '../services/pago.services';
import { ReservaService } from '../services/reserva.services';
import { MetodoPagoService } from '../services/metodopago.service';

@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './pago.html',
  styleUrl: './pago.scss'
})
export class PagosComponent implements OnInit {
  private fb = inject(FormBuilder);
  private pagoServ = inject(PagoService);
  private reservaServ = inject(ReservaService);
  private metodoPagoServ = inject(MetodoPagoService);

  // Lists
  pagos: PagoModel[] = [];
  reservas: ReservaModel[] = [];
  metodosPago: MetodoPagoModel[] = [];
  pagosFiltrados: PagoModel[] = [];
  pagosPaginados: PagoModel[] = [];
  cargando = true;

  // Search & Filter
  buscarQuery = '';
  filtroEstado = '';

  // Pagination
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  // Modal controls
  mostrarModalPago = false;
  modoEdicion = false;
  idPagoEditar: number | null = null;

  public pagoForm: FormGroup = this.fb.group({
    id_pago: [null],
    total: [0, [Validators.required, Validators.min(1)]],
    estado_pago: ['', Validators.required],
    fecha_pago: ['', Validators.required],
    reserva: [null, Validators.required],
    metodoPago: [null, Validators.required]
  });

  get total() { return this.pagoForm.get('total'); }
  get estado_pago() { return this.pagoForm.get('estado_pago'); }
  get fecha_pago() { return this.pagoForm.get('fecha_pago'); }
  get reserva() { return this.pagoForm.get('reserva'); }
  get metodoPago() { return this.pagoForm.get('metodoPago'); }

  get minIndex(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.pagosFiltrados.length);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    this.cargando = true;

    // Load Metodos Pago
    this.metodoPagoServ.getAll().subscribe({
      next: (m) => this.metodosPago = m || [],
      error: (e) => console.error('Error al cargar metodos de pago', e)
    });

    // Load Reservas
    this.reservaServ.getAllReservas().subscribe({
      next: (r) => this.reservas = r || [],
      error: (e) => console.error('Error al cargar reservas', e)
    });

    // Load Pagos
    this.listarPagos();
  }

  listarPagos() {
    this.cargando = true;
    this.pagoServ.getAll().subscribe({
      next: (data) => {
        this.pagos = data || [];
        this.actualizarTabla();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pagos', err);
        this.cargando = false;
      }
    });
  }

  actualizarTabla() {
    let result = [...this.pagos];

    // Filter by search query
    if (this.buscarQuery.trim()) {
      const q = this.buscarQuery.toLowerCase();
      result = result.filter(p => {
        const clientName = `${p.reserva?.usuario?.nombre_usuario || ''} ${p.reserva?.usuario?.apellido_paterno || ''}`.toLowerCase();
        const idStr = (p.id_pago || '').toString();
        const resIdStr = (p.reserva?.id_reserva || '').toString();
        const tipoPago = (p.metodoPago?.tipo || '').toLowerCase();
        return clientName.includes(q) || idStr.includes(q) || resIdStr.includes(q) || tipoPago.includes(q);
      });
    }

    // Filter by payment status
    if (this.filtroEstado) {
      result = result.filter(p => p.estado_pago === this.filtroEstado);
    }

    this.pagosFiltrados = result;

    // Pagination calculations
    this.totalPaginas = Math.ceil(result.length / this.itemsPorPagina) || 1;
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }

    const start = (this.paginaActual - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    this.pagosPaginados = result.slice(start, end);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarTabla();
    }
  }

  badgeClass(estado: string): string {
    switch (estado) {
      case 'APROBADO':
        return 'badge-success';
      case 'RECHAZADO':
        return 'badge-danger';
      case 'PENDIENTE':
        return 'badge-warning';
      default:
        return 'badge-secondary';
    }
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.idPagoEditar = null;

    const todayStr = new Date().toISOString().split('T')[0];
    this.pagoForm.reset({
      total: 0,
      estado_pago: 'APROBADO',
      fecha_pago: todayStr,
      reserva: null,
      metodoPago: null
    });

    this.mostrarModalPago = true;
  }

  editarPago(pago: PagoModel): void {
    this.modoEdicion = true;
    this.idPagoEditar = pago.id_pago ?? null;

    this.pagoForm.patchValue({
      id_pago: pago.id_pago,
      total: pago.total,
      estado_pago: pago.estado_pago,
      fecha_pago: pago.fecha_pago,
      reserva: pago.reserva,
      metodoPago: pago.metodoPago
    });

    this.mostrarModalPago = true;
  }

  cerrarModal() {
    this.mostrarModalPago = false;
    this.pagoForm.reset();
  }

  guardarPago(): void {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    const formValue = this.pagoForm.value;
    const totalValue = Number(formValue.total);
    const igvValue = +(totalValue * 0.18).toFixed(2);

    const data: PagoRequestModel = {
      total: totalValue,
      igv: igvValue,
      estado_pago: formValue.estado_pago,
      fecha_pago: formValue.fecha_pago,
      reserva: { id_reserva: formValue.reserva.id_reserva },
      metodoPago: { id_metodo_pago: formValue.metodoPago.id_metodo_pago }
    };

    this.cargando = true;

    if (this.modoEdicion && this.idPagoEditar) {
      this.pagoServ.put(this.idPagoEditar, data).subscribe({
        next: () => {
          this.cerrarModal();
          this.listarPagos();
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar el pago');
          this.cargando = false;
        }
      });
    } else {
      this.pagoServ.post(data).subscribe({
        next: () => {
          this.cerrarModal();
          this.listarPagos();
        },
        error: (err) => {
          console.error(err);
          alert('Error al registrar el pago');
          this.cargando = false;
        }
      });
    }
  }

  eliminarPago(id: number): void {
    if (!confirm('¿Eliminar este pago?')) return;

    this.pagoServ.delete(id).subscribe({
      next: () => {
        this.listarPagos();
        if (this.idPagoEditar === id) {
          this.cerrarModal();
        }
      },
      error: (err) => console.error('Error al eliminar pago', err)
    });
  }

  compararReserva(r1: any, r2: any): boolean {
    return r1 && r2 ? r1.id_reserva === r2.id_reserva : r1 === r2;
  }

  compararMetodoPago(m1: any, m2: any): boolean {
    return m1 && m2 ? m1.id_metodo_pago === m2.id_metodo_pago : m1 === m2;
  }
}