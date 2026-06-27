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
  public erroresBackend: any = {};

  public reservaForm: FormGroup = this.fb.group({
    id_reserva: [null],
    fechaCreacion: ['', Validators.required], // unificado con backend
    usuario: [null, Validators.required],
    estado: ['', Validators.required],
    pago: this.fb.group({
      total: [0, Validators.required],
      igv: [0, Validators.required],
      estado_pago: ['', Validators.required],
      fecha_pago: ['', Validators.required]
    })

  });

  get fechaCreacion() {
    return this.reservaForm.get('fechaCreacion');
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

    this.reservas$.subscribe(data => console.log('Reservas:', data));
  }


  registroReserva(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    const form = this.reservaForm.value;

    const reserva: ReservaModel = {
      id_reserva: form.id_reserva,
      fechaCreacion: form.fechaCreacion,
      usuario: form.usuario,
      estado: form.estado,
      pago: form.pago
    };


    if (this.modoEdicion && this.idReservaEditar) {
      this.serv.putUpdateReserva(this.idReservaEditar, reserva).subscribe({
        next: () => {
          this.erroresBackend = {};
          this.resetFormulario();
          this.reservas$ = this.serv.getAllReservas();
        },
        error: err => {
          console.log(err.error);
          this.erroresBackend = err.error;
        }
      });
    } else {
      this.serv.postInsertReserva(reserva).subscribe({
        next: () => {
          this.erroresBackend = {};
          this.resetFormulario();
          this.reservas$ = this.serv.getAllReservas();
        },
        error: err => {
          console.log(err.error);
          this.erroresBackend = err.error;
        }
      });
    }
  }


  editarReserva(res: ReservaModel): void {
    this.reservaForm.patchValue({
      id_reserva: res.id_reserva,
      fechaCreacion: res.fechaCreacion,
      usuario: res.usuario,
      estado: res.estado,
      pago: res.pago
    });
    this.idReservaEditar = res.id_reserva ?? null;
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
