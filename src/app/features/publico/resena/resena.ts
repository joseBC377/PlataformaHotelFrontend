import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { AdminServices } from '../../admin/services/admin.services';
import { HabitacionServices } from '../../admin/services/habitacion.services';
import { ResenaService } from '../../admin/services/resena.service';
import { Habitacion } from '../../auth/models/habitacion';
import { RequestResenaModel } from '../../auth/models/request-resena-model';
import { Servicio } from '../../auth/models/servicio';
import { UsuarioModel } from '../../auth/models/usuario';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-resena',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './resena.html',
  styleUrl: './resena.scss'
})
export class Resena {

  private servServicio = inject(ResenaService);
  private servHabitacion = inject(HabitacionServices);
  private auth = inject(AuthService);


  protected habit$!: Observable<Habitacion[]>;
  public servicio$!: Observable<Servicio[]>;


  resenaForm!: FormGroup;


  rolLogueado: string = '';
  idUsuarioLogueado: number | null = null;


  calificacionesDisponibles: number[] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.cargarServicios();
    this.rolLogueado = this.auth.getRol() ?? '';
    this.idUsuarioLogueado = this.auth.getId();

    if (this.rolLogueado !== 'CLIENT') {
      alert('Solo los clientes pueden crear reseñas');
      return;
    }

    this.resenaForm = this.fb.group({
      calificacion: ['', [Validators.required, Validators.min(1), Validators.max(5)]],
      fecha: ['', Validators.required],
      comentario: ['', Validators.required],
      id_habitacion: [null, Validators.required],
      id_servicio: [null, Validators.required]
    });

    this.generarCalificaciones();
    this.cargarHabitacion();
  }


  get calificacion() { return this.resenaForm.get('calificacion'); }
  get comentario() { return this.resenaForm.get('comentario'); }
  get fecha() { return this.resenaForm.get('fecha'); }
  get id_habitacion() { return this.resenaForm.get('id_habitacion'); }
  get id_servicio() { return this.resenaForm.get('id_servicio'); }


  cargarServicios() {
    //this.servServicio$ = this.servServicio.listar();
  }

  cargarHabitacion() {
      this.habit$ = this.servHabitacion.getAllHabitaciones();
  }

  generarCalificaciones(): void {
    for (let i = 1; i <= 5; i += 0.5) {
      this.calificacionesDisponibles.push(i);
    }
  }



  // guardarResena() {

  //   if (this.resenaForm.invalid) {
  //     this.resenaForm.markAllAsTouched();
  //     return;
  //   }

  //   const form = this.resenaForm.value;

  //   const resena: RequestResenaModel = {
  //     calificacion: form.calificacion,
  //     comentario: form.comentario,
  //     fecha: form.fecha,

  //     usuario: {
  //       id_usuario: this.idUsuarioLogueado!
  //     },

  //     habitacion: {
  //       id_habitacion: form.id_habitacion
  //     },

  //     servicio: {
  //       id_servicio: form.id_servicio
  //     }
  //   };

  //   this.servResena.insertar(resena).subscribe({
  //     next: () => {
  //       this.resenaForm.reset();
  //       alert('Reseña registrada correctamente');
  //     },
  //     error: () => {
  //       alert('Error al registrar reseña');
  //     }
  //   });
  // }

}
