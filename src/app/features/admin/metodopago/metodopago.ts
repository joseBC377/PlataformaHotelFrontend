import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MetodoPagoModel } from '../../auth/models/metodopago';
import { MetodoPagoService } from '../services/metodopago.service';

@Component({
  selector: 'app-metodopago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './metodopago.html',
  styleUrl: './metodopago.scss'
})
export class Metodopago implements OnInit {
  private fb = inject(FormBuilder);
  private serv = inject(MetodoPagoService);

  // Lists
  metodosPago: MetodoPagoModel[] = [];
  metodosPagoFiltrados: MetodoPagoModel[] = [];
  metodosPagoPaginados: MetodoPagoModel[] = [];
  cargando = true;

  // Search & Filter
  buscarQuery = '';
  filtroActivo = '';

  // Pagination
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  // Modal controls
  mostrarModalMetodo = false;
  modoEdicion = false;
  idEditar: number | null = null;

  public tiposPago = ['Efectivo', 'Tarjeta', 'Yape', 'Plin', 'Transferencia'];

  public metodoPagoForm: FormGroup = this.fb.group({
    id_metodo_pago: [null],
    tipo: ['', Validators.required],
    ultimoscuatrodigitos: ['', [Validators.pattern(/^\d{4}$/)]],
    fechaVencimiento: ['', [Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    token: [''],
    activo: [true, Validators.required]
  });

  get tipo() { return this.metodoPagoForm.get('tipo'); }
  get activo() { return this.metodoPagoForm.get('activo'); }

  get minIndex(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.metodosPagoFiltrados.length);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.listarMetodos();
  }

  listarMetodos() {
    this.cargando = true;
    this.serv.getAll().subscribe({
      next: (data) => {
        this.metodosPago = data || [];
        this.actualizarTabla();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar métodos de pago', err);
        this.cargando = false;
      }
    });
  }

  actualizarTabla() {
    let result = [...this.metodosPago];

    // Filter by search query
    if (this.buscarQuery.trim()) {
      const q = this.buscarQuery.toLowerCase();
      result = result.filter(mp => 
        (mp.tipo || '').toLowerCase().includes(q) ||
        (mp.ultimoscuatrodigitos || '').includes(q)
      );
    }

    // Filter by active status
    if (this.filtroActivo) {
      const isActivo = this.filtroActivo === 'true';
      result = result.filter(mp => mp.activo === isActivo);
    }

    this.metodosPagoFiltrados = result;

    // Pagination calculations
    this.totalPaginas = Math.ceil(result.length / this.itemsPorPagina) || 1;
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }

    const start = (this.paginaActual - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    this.metodosPagoPaginados = result.slice(start, end);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarTabla();
    }
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.idEditar = null;
    this.metodoPagoForm.reset({ activo: true, tipo: '' });
    this.mostrarModalMetodo = true;
  }

  editar(mp: MetodoPagoModel): void {
    this.modoEdicion = true;
    this.idEditar = mp.id_metodo_pago ?? null;
    this.metodoPagoForm.patchValue(mp);
    this.mostrarModalMetodo = true;
  }

  cerrarModal() {
    this.mostrarModalMetodo = false;
    this.metodoPagoForm.reset();
  }

  guardar(): void {
    if (this.metodoPagoForm.invalid) {
      this.metodoPagoForm.markAllAsTouched();
      return;
    }

    const data: MetodoPagoModel = this.metodoPagoForm.value;
    this.cargando = true;

    if (this.modoEdicion && this.idEditar) {
      this.serv.put(this.idEditar, data).subscribe({
        next: () => {
          this.cerrarModal();
          this.listarMetodos();
        },
        error: () => {
          alert('Error al actualizar');
          this.cargando = false;
        }
      });
    } else {
      this.serv.post(data).subscribe({
        next: () => {
          this.cerrarModal();
          this.listarMetodos();
        },
        error: () => {
          alert('Error al registrar');
          this.cargando = false;
        }
      });
    }
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este método de pago?')) return;
    this.serv.delete(id).subscribe({
      next: () => {
        this.listarMetodos();
        if (this.idEditar === id) {
          this.cerrarModal();
        }
      },
      error: err => console.error('Error al eliminar', err)
    });
  }

  resetFormulario(): void {
    this.metodoPagoForm.reset({ activo: true });
    this.modoEdicion = false;
    this.idEditar = null;
  }
}
