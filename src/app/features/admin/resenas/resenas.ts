import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResenaService } from '../services/resena.service';
import { Observable } from 'rxjs';
import { Resena } from '../../auth/models/resena';
import { Habitacion } from '../../auth/models/habitacion';
import { HabitacionServices } from '../services/habitacion.services';
import { AuthService } from '../../../core/services/auth.service';
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


  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.resenaForm = this.fb.group({
      calificacion: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      fecha: ['', Validators.required],
      id_usuario: [null, Validators.required],
      id_habitacion: [null, Validators.required]

    });

    this.cargarUsuarios();
    this.cargarHabitacion();
    this.cargarResena();
  }

  cargarUsuarios() {
    this.user$ = this.servUsuario.getAllUsers();
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
      calificacion: resena.calificacion,
      fecha: resena.fecha,
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
