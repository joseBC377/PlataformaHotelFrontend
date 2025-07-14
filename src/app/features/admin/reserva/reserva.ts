import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ReservaService } from '../services/reserva.services';
// import { AuthService } from '../../../core/services/auth.service'; 
import { ReservaModel } from '../../auth/models/reserva'; 
import { UsuarioModel } from '../../auth/models/usuario';   
import { AdminServices } from '../../admin/services/admin.services';


@Component({
  selector: 'app-reserva',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reserva.html',
  styleUrl: './reserva.scss'
})
export class ReservaComponent implements OnInit {
  protected reservas$!: Observable<ReservaModel[]>;
  protected usuarios$!: Observable<UsuarioModel[]>;

  private fb = inject(FormBuilder);
  private serv = inject(ReservaService);
//   private usuarioServ = inject(AuthService);
  private adminServ = inject(AdminServices);

  public reservaForm: FormGroup = this.fb.group({
    id: [null],
    fecha_inicio: [null, Validators.required],
    fecha_fin: [null, Validators.required],
    usuario: [null, Validators.required] 
  });

  get fecha_inicio() { return this.reservaForm.get('fecha_inicio'); }
  get fecha_fin() { return this.reservaForm.get('fecha_fin'); }
  get usuario() { return this.reservaForm.get('usuario'); }

  public modoEdicion: boolean = false;
  public idReservaEditar: number | null = null;

  ngOnInit(): void {
    this.reservas$ = this.serv.getAllReservas();
   this.usuarios$ = this.adminServ.getSeletAllUsers(); 
  }

  registrarReserva(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      console.warn('Formulario de reserva inválido');
      return;
    }

    const data = this.reservaForm.value;

    if (this.modoEdicion) {
      this.serv.putUpdateReserva(this.idReservaEditar!, data).subscribe(() => {
        this.reservas$ = this.serv.getAllReservas();
        this.resetFormulario();
      });
    } else {
      this.serv.postInsertReserva(data).subscribe(() => {
        this.reservas$ = this.serv.getAllReservas();
        this.resetFormulario();
      });
    }
  }

  editarReserva(r: ReservaModel): void {
    this.reservaForm.patchValue(r);
    this.idReservaEditar = r.id ?? null;
    this.modoEdicion = true;
  }

  eliminarReserva(id: number): void {
    if (confirm('¿Deseas eliminar esta reserva?')) {
      this.serv.deleteIdReserva(id).subscribe(() => {
        this.reservas$ = this.serv.getAllReservas();
        if (this.idReservaEditar === id) this.resetFormulario();
      });
    }
  }

  resetFormulario(): void {
    this.reservaForm.reset();
    this.modoEdicion = false;
    this.idReservaEditar = null;
  }
}
