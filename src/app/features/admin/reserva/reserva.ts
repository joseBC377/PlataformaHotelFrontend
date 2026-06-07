import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { ReservaService } from '../services/reserva.services';
import { AdminServices } from '../services/admin.services';
import { ReservaModel } from '../../auth/models/reserva';
import { UsuarioModel } from '../../auth/models/usuario';
import { EstadoReserva } from '../../auth/models/EstadoReserva';

@Component({
  selector: 'app-reservas-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './reserva.html',
  styleUrl: './reserva.scss'
})
export class ReservasAdminComponent implements OnInit {

  protected reservas$!: Observable<ReservaModel[]>;
  protected usuarios$!: Observable<UsuarioModel[]>;

  private fb = inject(FormBuilder);
  private serv = inject(ReservaService);
  private adminServ = inject(AdminServices);
  private http = inject(HttpClient);

  public modoEdicion: boolean = false;
  public idReservaEditar: number | null = null;

  public reservaForm: FormGroup = this.fb.group({
    id: [null],
    fecha_reserva: ['', Validators.required],
    usuario: [null, Validators.required],
    estado: ['', Validators.required]
  });


  get fecha_reserva() {
    return this.reservaForm.get('fecha_reserva');
  }

  get usuario() {
    return this.reservaForm.get('usuario');
  }

  get estado() {
    return this.reservaForm.get('estado');
  }


  ngOnInit(): void {
    this.reservas$ = this.serv.getAllReservas();
    this.usuarios$ = this.adminServ.getAllUsers();
  }

 registroReserva(): void {
  if (this.reservaForm.invalid) {
    this.reservaForm.markAllAsTouched();
    return;
  }

  const form = this.reservaForm.value;

  const reserva: ReservaModel = {
    fecha_reserva: form.fecha_reserva,
    usuario: form.usuario,
    estado: form.estado  
  };

  if (this.modoEdicion && this.idReservaEditar) {
    this.serv.putUpdateReserva(this.idReservaEditar, reserva).subscribe({
      next: () => {
        this.resetFormulario();
        this.reservas$ = this.serv.getAllReservas();
      },
      error: () => alert('Error al editar reserva')
    });
  } else {
    this.serv.postInsertReserva(reserva).subscribe({
      next: () => {
        this.resetFormulario();
        this.reservas$ = this.serv.getAllReservas();
      },
      error: () => alert('Error al registrar reserva')
    });
  }
}


editarReserva(res: ReservaModel): void {
  this.reservaForm.patchValue({
    id: res.id,
    fecha_reserva: res.fecha_reserva,
    usuario: res.usuario
  });

  this.estado?.setValue(res.estado);
  this.idReservaEditar = res.id ?? null;
  this.modoEdicion = true;
}

  eliminarReserva(id: number): void {
    if (!confirm('¿Desea eliminar esta reserva?')) return;

    this.serv.deleteIdReserva(id).subscribe({
      next: () => {
        this.reservas$ = this.serv.getAllReservas();
        if (this.idReservaEditar === id) this.resetFormulario();
      },
      error: err => console.error('Error al eliminar reserva', err)
    });
  }

  resetFormulario(): void {
    this.reservaForm.reset({
      estado: EstadoReserva.CANCELADO
    });
    this.modoEdicion = false;
    this.idReservaEditar = null;
  }


  compararUsuario = (u1: UsuarioModel, u2: UsuarioModel): boolean => {
    return u1 && u2 ? u1.id_usuario === u2.id_usuario : u1 === u2;
  }
}