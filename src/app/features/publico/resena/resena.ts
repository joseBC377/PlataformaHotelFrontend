import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { HabitacionServices } from '../../admin/services/habitacion.services';
import { ResenaService } from '../../admin/services/resena.service';
import { Habitacion } from '../../auth/models/habitacion';
import { RequestResenaModel } from '../../auth/models/request-resena-model';
import { Servicio } from '../../auth/models/servicio';
import { AuthService } from '../../../core/services/auth.service';
import { ServicioService } from '../../admin/services/servicio.service';
import { Router } from '@angular/router';
import { Resena as ResenaModel } from '../../auth/models/resena';

@Component({
  selector: 'app-resena',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './resena.html',
  styleUrl: './resena.scss'
})
export class Resena implements OnInit {

  private router = inject(Router);
  private servServicio = inject(ServicioService);
  private servHabitacion = inject(HabitacionServices);
  private servResena = inject(ResenaService);
  private auth = inject(AuthService);

  protected habit$!: Observable<Habitacion[]>;
  public servicio$!: Observable<Servicio[]>;

  resenaForm!: FormGroup;

  rolLogueado: string = '';
  idUsuarioLogueado: number | null = null;

  calificacionesDisponibles: number[] = [];
  
  // Custom states
  misResenas: ResenaModel[] = [];
  editandoResenaId: number | null = null;
  cargandoHistorial: boolean = false;
  cargandoSubmit: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';
  
  // Star rating control
  calificacionValue: number = 0;
  hoverValue: number = 0;

  mostrarModalRestriccion = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.resenaForm = this.fb.group({
      calificacion: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      comentario: ['', Validators.required],
      id_habitacion: [null, Validators.required],
      id_servicio: [null, Validators.required]
    });

    this.cargarServicios();

    this.rolLogueado = this.auth.getRol() ?? '';
    this.idUsuarioLogueado = this.auth.getId();

    if (this.rolLogueado !== 'CLIENT') {
      this.mostrarModalRestriccion = true;
      return;
    }

    this.generarCalificaciones();
    this.cargarHabitacion();
    this.obtenerMisResenas();
  }

  cerrarModalRestriccion() {
    this.mostrarModalRestriccion = false;
    this.router.navigate(['/']);
  }

  get calificacion() { return this.resenaForm.get('calificacion'); }
  get comentario() { return this.resenaForm.get('comentario'); }
  get fecha() { return this.resenaForm.get('fecha'); }
  get id_habitacion() { return this.resenaForm.get('id_habitacion'); }
  get id_servicio() { return this.resenaForm.get('id_servicio'); }

  cargarServicios() {
    this.servicio$ = this.servServicio.listar();
  }

  cargarHabitacion() {
    this.habit$ = this.servHabitacion.getAllHabitaciones();
  }

  generarCalificaciones(): void {
    for (let i = 1; i <= 5; i += 0.5) {
      this.calificacionesDisponibles.push(i);
    }
  }

  // Star selector methods
  seleccionarEstrellas(stars: number) {
    this.calificacionValue = stars;
    this.resenaForm.get('calificacion')?.setValue(stars);
    this.resenaForm.get('calificacion')?.markAsDirty();
    this.resenaForm.get('calificacion')?.markAsTouched();
  }

  hoverEstrellas(stars: number) {
    this.hoverValue = stars;
  }

  get displayedStars(): number {
    return this.hoverValue > 0 ? this.hoverValue : this.calificacionValue;
  }

  // API Integration Methods
  obtenerMisResenas() {
    if (!this.idUsuarioLogueado) return;
    this.cargandoHistorial = true;
    this.servResena.listar().subscribe({
      next: (data) => {
        if (data) {
          this.misResenas = data.filter(
            (r) => r.usuario && r.usuario.id_usuario === this.idUsuarioLogueado
          );
        }
        this.cargandoHistorial = false;
      },
      error: (err) => {
        console.error('Error al listar mis reseñas:', err);
        this.cargandoHistorial = false;
      }
    });
  }

  guardarResena() {
    if (this.resenaForm.invalid) {
      this.resenaForm.markAllAsTouched();
      this.mensajeError = 'Por favor, complete todos los campos requeridos.';
      this.clearMessages();
      return;
    }

    if (this.rolLogueado !== 'CLIENT') {
      this.mensajeError = 'Solo los clientes pueden registrar reseñas.';
      this.clearMessages();
      return;
    }

    this.cargandoSubmit = true;
    this.mensajeExito = '';
    this.mensajeError = '';

    const form = this.resenaForm.value;

    const resena: RequestResenaModel = {
      calificacion: form.calificacion,
      comentario: form.comentario,
      fecha: form.fecha,
      usuario: {
        id_usuario: this.idUsuarioLogueado!
      },
      habitacion: form.id_habitacion ? { id_habitacion: form.id_habitacion } : undefined,
      servicio: form.id_servicio ? { idServicio: form.id_servicio } : undefined
    };

    if (this.editandoResenaId) {
      this.servResena.editar(this.editandoResenaId, resena).subscribe({
        next: () => {
          this.mensajeExito = 'Reseña actualizada con éxito.';
          this.cargandoSubmit = false;
          this.cancelarEdicion();
          this.obtenerMisResenas();
          this.clearMessages();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError = 'Error al actualizar la reseña.';
          this.cargandoSubmit = false;
          this.clearMessages();
        }
      });
    } else {
      this.servResena.insertar(resena).subscribe({
        next: () => {
          this.mensajeExito = 'Reseña registrada con éxito.';
          this.cargandoSubmit = false;
          this.resenaForm.reset();
          this.calificacionValue = 0;
          this.resenaForm.patchValue({
            id_habitacion: null,
            id_servicio: null,
            fecha: new Date().toISOString().split('T')[0]
          });
          this.obtenerMisResenas();
          this.clearMessages();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError = 'Error al registrar la reseña.';
          this.cargandoSubmit = false;
          this.clearMessages();
        }
      });
    }
  }

  editarResena(res: ResenaModel) {
    this.editandoResenaId = res.id_resena || null;
    this.calificacionValue = res.calificacion;
    
    let fechaFormateada = '';
    if (res.fecha) {
      fechaFormateada = res.fecha.split('T')[0];
    }

    this.resenaForm.patchValue({
      calificacion: res.calificacion,
      fecha: fechaFormateada,
      comentario: res.comentario,
      id_habitacion: res.habitacion?.id_habitacion || null,
      id_servicio: res.servicio?.id_servicio || null
    });

    const formElement = document.getElementById('resena-form-card');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  }

  eliminarResena(id: number) {
    if (confirm('¿Está seguro de que desea eliminar esta reseña?')) {
      this.servResena.eliminar(id).subscribe({
        next: () => {
          this.mensajeExito = 'Reseña eliminada con éxito.';
          this.obtenerMisResenas();
          this.clearMessages();
        },
        error: (err) => {
          console.error(err);
          this.mensajeError = 'Error al eliminar la reseña.';
          this.clearMessages();
        }
      });
    }
  }

  cancelarEdicion() {
    this.editandoResenaId = null;
    this.calificacionValue = 0;
    this.resenaForm.reset();
    this.resenaForm.patchValue({
      id_habitacion: null,
      id_servicio: null,
      fecha: new Date().toISOString().split('T')[0]
    });
  }

  clearMessages() {
    setTimeout(() => {
      this.mensajeExito = '';
      this.mensajeError = '';
    }, 6000);
  }

}
