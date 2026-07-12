import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Servicio } from '../../auth/models/servicio';
import { ServicioService } from '../services/servicio.service';

@Component({
  selector: 'app-servicios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './servicio.html',
  styleUrl: './servicio.scss'
})
export class ServiciosAdminComponent implements OnInit {
  private serv = inject(ServicioService);
  private fb = inject(FormBuilder);

  // Lists
  servicios: Servicio[] = [];
  serviciosFiltrados: Servicio[] = [];
  serviciosPaginados: Servicio[] = [];
  cargando = true;

  // Search
  buscarQuery = '';

  // Pagination
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  // Modal controls
  mostrarModalServicio = false;
  modoEdicion = false;
  idServicioEditar: number | null = null;
  imagenInvalida = false;

  public servicioForm: FormGroup;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor() {
    this.servicioForm = this.fb.group({
      idServicio: [null],
      nombre_servicio: ['', [Validators.required, Validators.minLength(3)]],
      descripcion_servicio: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      imagen: ['', Validators.required]
    });
  }

  get nombre_servicio() { return this.servicioForm.get('nombre_servicio'); }
  get descripcion_servicio() { return this.servicioForm.get('descripcion_servicio'); }
  get precio() { return this.servicioForm.get('precio'); }

  get minIndex(): number {
    return Math.min(this.paginaActual * this.itemsPorPagina, this.serviciosFiltrados.length);
  }

  get paginasArray(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.listarServicios();
  }

  listarServicios(): void {
    this.cargando = true;
    this.serv.listar().subscribe({
      next: (data) => {
        this.servicios = data || [];
        this.actualizarTabla();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar servicios', err);
        this.cargando = false;
      }
    });
  }

  actualizarTabla() {
    let result = [...this.servicios];

    // Filter by search query (name or description)
    if (this.buscarQuery.trim()) {
      const q = this.buscarQuery.toLowerCase();
      result = result.filter(s => 
        (s.nombre_servicio || '').toLowerCase().includes(q) ||
        (s.descripcion_servicio || '').toLowerCase().includes(q)
      );
    }

    this.serviciosFiltrados = result;

    // Pagination calculations
    this.totalPaginas = Math.ceil(result.length / this.itemsPorPagina) || 1;
    if (this.paginaActual > this.totalPaginas) {
      this.paginaActual = this.totalPaginas;
    }

    const start = (this.paginaActual - 1) * this.itemsPorPagina;
    const end = start + this.itemsPorPagina;
    this.serviciosPaginados = result.slice(start, end);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarTabla();
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      this.imagenInvalida = true;
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      this.servicioForm.patchValue({
        imagen: reader.result as string
      });
      this.imagenInvalida = false;
    };

    reader.readAsDataURL(file);
  }

  abrirModalNuevo() {
    this.modoEdicion = false;
    this.idServicioEditar = null;
    this.resetFormulario();
    
    // For new services, image is required
    this.servicioForm.get('imagen')?.setValidators([Validators.required]);
    this.servicioForm.get('imagen')?.updateValueAndValidity();

    this.mostrarModalServicio = true;
  }

  editarServicio(servicio: Servicio): void {
    this.modoEdicion = true;
    this.idServicioEditar = servicio.idServicio ?? null;
    
    this.servicioForm.patchValue({
      idServicio: servicio.idServicio,
      nombre_servicio: servicio.nombre_servicio,
      descripcion_servicio: servicio.descripcion_servicio,
      precio: servicio.precio,
      imagen: servicio.imagen
    });

    this.servicioForm.get('imagen')?.setValidators([Validators.required]);
    this.servicioForm.get('imagen')?.updateValueAndValidity();

    this.mostrarModalServicio = true;
  }

  cerrarModal() {
    this.mostrarModalServicio = false;
    this.resetFormulario();
  }

  guardarServicio(): void {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    const data = this.servicioForm.value;
    this.cargando = true;

    if (this.modoEdicion && this.idServicioEditar) {
      this.serv.editar(this.idServicioEditar, data).subscribe({
        next: () => {
          this.cerrarModal();
          this.listarServicios();
        },
        error: (err) => {
          console.error(err);
          alert('Error al actualizar el servicio');
          this.cargando = false;
        }
      });
    } else {
      this.serv.insertar(data).subscribe({
        next: () => {
          this.cerrarModal();
          this.listarServicios();
        },
        error: (err) => {
          console.error(err);
          alert('Error al insertar el servicio');
          this.cargando = false;
        }
      });
    }
  }

  eliminarServicio(id: number): void {
    if (!confirm('¿Eliminar este servicio?')) return;

    this.serv.eliminar(id).subscribe({
      next: () => {
        this.listarServicios();
        if (this.idServicioEditar === id) {
          this.cerrarModal();
        }
      },
      error: (err) => console.error('Error al eliminar servicio', err)
    });
  }

  resetFormulario(): void {
    this.servicioForm.reset({
      precio: 0
    });
    this.modoEdicion = false;
    this.idServicioEditar = null;
    this.imagenInvalida = false;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
