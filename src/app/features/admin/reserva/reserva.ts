import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ReservaService } from '../services/reserva.services';
import { ReservaModel } from '../../auth/models/reserva';
import { UsuarioModel } from '../../auth/models/usuario';
import { ConteoRol } from '../../auth/models/conteo-rol';
import { AdminServices } from '../services/admin.services';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-reservas-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reserva.html',
  styleUrl: './reserva.scss'
})
export class ReservasAdminComponent implements OnInit {
  protected reservas$!: Observable<ReservaModel[]>;
  protected usuario$!: Observable<UsuarioModel[]>;
  protected usuarioReserva$!: Observable<UsuarioModel[]>;
  protected contero$!: Observable<ConteoRol[]>;

  private fb = inject(FormBuilder);
  private serv = inject(ReservaService);
  private http = inject(HttpClient); 
  private adminServ = inject(AdminServices);

  public modoEdicion: boolean = false;
  public idReservaEditar: number | null = null;

  public reservaForm: FormGroup = this.fb.group({
    id: [null],
    fecha_inicio: ['', Validators.required],
    fecha_fin: ['', Validators.required],
    usuario: [null, Validators.required] 
  });

  get fecha_inicio() { return this.reservaForm.get('fecha_inicio'); }
  get fecha_fin() { return this.reservaForm.get('fecha_fin'); }
  get usuario() { return this.reservaForm.get('usuario'); }

  ngOnInit(): void {
    this.reservas$ = this.serv.getAllReservas();
    this.usuario$ = this.adminServ.getAllUsers();
  }

  registroReserva(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    });

    const reserva = this.reservaForm.value;

    if (this.modoEdicion) {
      this.serv.putUpdateReserva(this.idReservaEditar!, reserva).subscribe(() => {
        this.reservas$ = this.serv.getAllReservas();
        this.resetFormulario();
      });
    } else {
      this.http.post('http://localhost:8081/api/reservas', reserva, { headers }).subscribe({
        next: () => {
          this.reservas$ = this.serv.getAllReservas();
          this.resetFormulario();
        },
        error: (err) => {
          console.error('Error al registrar reserva:', err);
          alert('No se pudo registrar la reserva. Verifica tus permisos o el token.');
        }
      });
    }
  }

  editarReserva(res: ReservaModel): void {
    this.reservaForm.patchValue({
      id: res.id,
      fecha_inicio: res.fecha_inicio,
      fecha_fin: res.fecha_fin,
      usuario: res.usuario 
    });

    this.idReservaEditar = res.id!;
    this.modoEdicion = true;
  }

eliminarReserva(id: number): void {
  if (confirm('¿Estás seguro que deseas eliminar esta reserva?')) {
    this.serv.deleteReserva(id).subscribe({
      next: () => {
        this.reservas$ = this.serv.getAllReservas();
        if (this.idReservaEditar === id) this.resetFormulario();
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert('Ocurrió un error al intentar eliminar la reserva.');
      }
    });
  }
}



  resetFormulario(): void {
    this.reservaForm.reset();
    this.modoEdicion = false;
    this.idReservaEditar = null;
  }

  compararUsuario = (u1: UsuarioModel, u2: UsuarioModel): boolean => {
    return u1 && u2 ? u1.id === u2.id : u1 === u2;
  }
}
