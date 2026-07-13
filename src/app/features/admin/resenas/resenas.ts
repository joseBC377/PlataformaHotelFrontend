import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResenaService } from '../services/resena.service';
import { Observable } from 'rxjs';
import { Resena } from '../../auth/models/resena';
import { Habitacion } from '../../auth/models/habitacion';
import { HabitacionServices } from '../services/habitacion.services';
import { RequestResenaModel } from '../../auth/models/request-resena-model';
import { AdminServices } from '../services/admin.services';
import { UsuarioModel } from '../../auth/models/usuario';
import { Servicio } from '../../auth/models/servicio';
import { ServicioService } from '../services/servicio.service';

@Component({
  selector: 'app-resena-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './resenas.html',
  styleUrls: ['./resenas.scss']
})
export class ResenaAdminComponent implements OnInit {

  private servUsuario = inject(AdminServices)
  private servHabitacion = inject(HabitacionServices);
  private servResena = inject(ResenaService);
  private servServicio = inject(ServicioService);

  protected user$!: Observable<UsuarioModel[]>;
  protected habit$!: Observable<Habitacion[]>;
  public rese$!: Observable<Resena[]>;
  public servicio$!: Observable<Servicio[]>; // Asegúrate de importar el modelo Servicio

  resenaForm!: FormGroup;
  resenas: Resena[] = [];

  // Variables para métricas
  totalResenas = 0;
  promedioCalificacion = 0;
  resenasExcelentes = 0;
  resenasBajas = 0;

  // Control de modal de formulario
  mostrarModalForm = false;

  // ¡NUEVA PROPIEDAD! Array para las opciones del select de calificación
  calificacionesDisponibles: number[] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.resenaForm = this.fb.group({
      calificacion: [
        '', // Valor inicial vacío para el select
        [Validators.required, Validators.min(1), Validators.max(5)]
      ],
      fecha: ['', Validators.required],
      comentario: ['', Validators.required],
      id_usuario: [null, Validators.required],
      id_habitacion: [null, Validators.required],
      id_servicio: [null, Validators.required]
    });

    // Llama a la función para generar las calificaciones al inicializar el componente
    this.generarCalificaciones();

    this.cargarUsuarios();
    this.cargarHabitacion();
    this.cargarServicios();
    this.cargarResena();
  }

  // Getters para los controles del formulario
  get calificacion() { return this.resenaForm.get('calificacion'); }
  get comentario() { return this.resenaForm.get('comentario'); }
  get fecha() { return this.resenaForm.get('fecha'); }
  get id_usuario() { return this.resenaForm.get('id_usuario'); }
  get id_habitacion() { return this.resenaForm.get('id_habitacion'); }

  // ¡NUEVA FUNCIÓN! Para generar las calificaciones de 1 a 5 en incrementos de 0.5
  generarCalificaciones(): void {
    for (let i = 1; i <= 5; i += 0.5) {
      this.calificacionesDisponibles.push(i);
    }
  }

  cargarUsuarios() {
    this.user$ = this.servUsuario.getAllUsers();
    this.user$.subscribe(data => console.log('Usuarios:', data));
  }

  cargarHabitacion() {
    this.habit$ = this.servHabitacion.getAllHabitaciones();
  }

  cargarServicios() {
    this.servicio$ = this.servServicio.listar();
  }

  cargarResena() {
    this.rese$ = this.servResena.listar();
    this.rese$.subscribe({
      next: (data) => {
        this.resenas = data || [];
        this.calcularMetricas();
      }
    });
  }

  calcularMetricas() {
    if (!this.resenas.length) {
      this.totalResenas = 0;
      this.promedioCalificacion = 0;
      this.resenasExcelentes = 0;
      this.resenasBajas = 0;
      return;
    }
    this.totalResenas = this.resenas.length;
    const suma = this.resenas.reduce((acc, r) => acc + (r.calificacion || 0), 0);
    this.promedioCalificacion = suma / this.totalResenas;
    this.resenasExcelentes = this.resenas.filter(r => r.calificacion >= 4).length;
    this.resenasBajas = this.resenas.filter(r => r.calificacion < 3).length;
  }

  editando: boolean = false;
  idEditando!: number;

  abrirModalNuevaResena(): void {
    this.editando = false;
    this.resenaForm.reset({
      calificacion: '',
      fecha: new Date().toISOString().substring(0, 10),
      comentario: '',
      id_usuario: null,
      id_habitacion: null,
      id_servicio: null
    });
    this.mostrarModalForm = true;
  }

  cerrarModal(): void {
    this.mostrarModalForm = false;
    this.resenaForm.reset();
  }

  editarResena(resena: Resena) {
    this.editando = true;
    this.idEditando = resena.id_resena!;

    this.resenaForm.patchValue({
      calificacion: resena.calificacion,
      fecha: resena.fecha,
      comentario: resena.comentario,
      id_usuario: resena.usuario?.id_usuario || null,
      id_habitacion: resena.habitacion?.id_habitacion || null,
      id_servicio: resena.servicio?.id_servicio || null
    });
    this.mostrarModalForm = true;
  }

  guardarResena() {
    if (this.resenaForm.invalid) {
      this.resenaForm.markAllAsTouched();
      return;
    }

    const form = this.resenaForm.value;

    const resena: RequestResenaModel = {
      calificacion: form.calificacion,
      comentario: form.comentario,
      fecha: form.fecha,
      usuario: { id_usuario: form.id_usuario },
      habitacion: { id_habitacion: form.id_habitacion },
      servicio: { idServicio: form.id_servicio }
    };

    if (this.editando) {
      this.servResena.editar(this.idEditando, resena).subscribe({
        next: () => {
          this.editando = false;
          this.idEditando = 0;
          this.mostrarModalForm = false;
          this.resenaForm.reset();
          this.cargarResena();
        },
        error: () => {
          alert('Error al actualizar reseña');
        }
      });
    } else {
      this.servResena.insertar(resena).subscribe({
        next: () => {
          this.mostrarModalForm = false;
          this.resenaForm.reset();
          this.cargarResena();
        },
        error: () => {
          alert('Error al registrar reseña');
        }
      });
    }
  }

  eliminarResena(id: number) {
    if (confirm('¿Deseas eliminar esta reseña?')) {
      this.servResena.eliminar(id).subscribe({
        next: () => this.cargarResena(),
        error: () => alert('Error al eliminar reseña')
      });
    }
  }

  getIniciales(nombre: string): string {
    if (!nombre) return 'U';
    const parts = nombre.split(' ');
    if (parts.length >= 2) {
      return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
    }
    return nombre.substring(0, 2).toUpperCase();
  }

  getEstrellasArray(calificacion: number): number[] {
    const fullStars = Math.floor(calificacion);
    return Array(fullStars).fill(0);
  }

  tieneMediaEstrella(calificacion: number): boolean {
    return calificacion % 1 !== 0;
  }

  getEstrellasVaciasArray(calificacion: number): number[] {
    const fullStars = Math.floor(calificacion);
    const hasHalf = calificacion % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    return Array(emptyStars).fill(0);
  }
}
