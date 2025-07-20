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
  protected user$!: Observable<UsuarioModel[]>;
  protected habit$!: Observable<Habitacion[]>;
  protected rese$!: Observable<Resena[]>;

  resenaForm!: FormGroup;
  resenas: Resena[] = [];

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
      descripcion: ['', Validators.required],
      id_usuario: [null, Validators.required],
      id_habitacion: [null, Validators.required]
    });

    // Llama a la función para generar las calificaciones al inicializar el componente
    this.generarCalificaciones();

    this.cargarUsuarios();
    this.cargarHabitacion();
    this.cargarResena();
  }

  // Getters para los controles del formulario
  get calificacion() { return this.resenaForm.get('calificacion'); }
  get descripcion() { return this.resenaForm.get('descripcion'); }
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

  cargarResena() {
    this.rese$ = this.servResena.listar();
  }

  editando: boolean = false;
  idEditando!: number;

  editarResena(resena: Resena) {
    this.editando = true;
    this.idEditando = resena.id!;

    this.resenaForm.patchValue({
      calificacion: resena.calificacion, // Esto asignará el valor numérico a la calificación
      fecha: resena.fecha,
      descripcion: resena.descripcion,
      id_usuario: resena.usuario.id,
      id_habitacion: resena.habitacion.id,
    });
  }

  guardarResena() {
    if (this.resenaForm.invalid) {
      this.resenaForm.markAllAsTouched();
      return;
    }

    const form = this.resenaForm.value;

    const resena: RequestResenaModel = {
      calificacion: form.calificacion,
      descripcion: form.descripcion,
      fecha: form.fecha,
      usuario: { id: form.id_usuario },
      habitacion: { id: form.id_habitacion }
    };

    if (this.editando) {
      this.servResena.editar(this.idEditando, resena).subscribe({
        next: () => {
          this.editando = false
          this.idEditando = 0;
          this.resenaForm.reset();
          this.cargarResena();
        },
        error: () => {
          alert('Error al actualizar reseña')
        }
      });
    } else {
      this.servResena.insertar(resena).subscribe({
        next: () => {
          this.resenaForm.reset();
          this.cargarResena();
        },
        error: () => {
          alert('Error al registrar reseña')
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
}