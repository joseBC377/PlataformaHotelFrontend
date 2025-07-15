import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResenaService } from '../services/resena.service';
import { Observable } from 'rxjs';
import { Resena } from '../../auth/models/resena';
import { Habitacion } from '../../auth/models/habitacion';
import { HabitacionServices } from '../services/habitacion.services';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-resena-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './resenas.html',
  styleUrls: ['./resenas.scss']
})
export class ResenaAdminComponent implements OnInit {

  private authService = inject(AuthService);
  private servHabitacion = inject(HabitacionServices);
  private servResena = inject(ResenaService);
  protected rese$!: Observable<Resena[]>;
  protected habit$!: Observable<Habitacion[]>;

  resenaForm!: FormGroup;
  resenas: Resena[] = [];
  modoEdicion = false;
  idEditar: number | null = null;

  //Captura el idUsuario del localStorage
  idUsuario = this.authService.getId();


  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.resenaForm = this.fb.group({
      calificacion: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      fecha: ['', Validators.required],
      id_usuario: [null, Validators.required],
      id_habitacion: [null, Validators.required]

    });

    this.cargarResena();
    this.cargarHabitacion();
  }


  cargarResena() {
    this.rese$ = this.servResena.listar();
  }

  cargarHabitacion() {
    this.habit$ = this.servHabitacion.getAllHabitaciones();
  }

}
