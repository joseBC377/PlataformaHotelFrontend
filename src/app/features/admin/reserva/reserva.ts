import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ReservaService } from '../services/reserva.services';
// import { AuthService } from '../../../core/services/auth.service'; 
import { ReservaModel } from '../../auth/models/reserva';
import { UsuarioModel } from '../../auth/models/usuario';
import { AdminServices } from '../../admin/services/admin.services';
import { error } from 'console';


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
  private datePipe = inject(DatePipe);
  //validador para fechas futuras o presentes
  dateFutureOrPresentValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const selectedDate = new Date(control.value);
      selectedDate.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        return { 'futureOrPresent': { value: control.value } }
      }
      return null;
    };
  }
  public reservaForm: FormGroup = this.fb.group({
    id: [null],
    fecha_inicio: ['', [Validators.required, this.dateFutureOrPresentValidator()]],
    fecha_fin: ['', [Validators.required, this.dateFutureOrPresentValidator()]],
    usuario: ['',Validators.required]
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
    const formValue = this.reservaForm.value;
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      console.warn('Formulario de reserva inválido');
      return;
    }
    //formato de fechas
    const fechaInicioFormateada = this.datePipe.transform(formValue.fecha_inicio, 'yyyy-MM-dd HH:mm:ss');
    const fechaFinFormateada = this.datePipe.transform(formValue.fecha_fin, 'yyyy-MM-dd HH:mm:ss');
    // Manejo básico si por alguna razón el pipe devuelve null (aunque Validators.required ya ayuda)
    if (!fechaInicioFormateada || !fechaFinFormateada) {
      console.error('Error al formatear fechas. Fechas recibidas:', formValue.fecha_inicio, formValue.fecha_fin);
      return;
    }

    // const data = this.reservaForm.value;
    const reservaParaBackend: ReservaModel = {
      fecha_inicio: fechaInicioFormateada,
      fecha_fin: fechaFinFormateada,
      usuario: formValue.usuario
    };


    if (this.modoEdicion) {
      this.serv.putUpdateReserva(this.idReservaEditar!, reservaParaBackend).subscribe(() => { // Usa reservaParaBackend
        this.reservas$ = this.serv.getAllReservas();
        this.resetFormulario();
      });
    } else {
      this.serv.postInsertReserva(reservaParaBackend).subscribe(() => { // Usa reservaParaBackend
        this.reservas$ = this.serv.getAllReservas();
        this.resetFormulario();
      });
    }

  }

  editarReserva(r: ReservaModel): void {
    const formattedFechaInicio = this.datePipe.transform(r.fecha_inicio, 'yyyy-MM-dd');
    const formattedFechaFin = this.datePipe.transform(r.fecha_fin, 'yyyy-MM-dd');

    this.reservaForm.patchValue({
      id: r.id,
      fecha_inicio: formattedFechaInicio, // Usa la fecha formateada sin hora
      fecha_fin: formattedFechaFin,     // Usa la fecha formateada sin hora
      usuario: r.usuario
    });

    this.idReservaEditar = r.id ?? null;
    this.modoEdicion = true;
  }

  eliminarReserva(id: number): void {
    if (confirm('¿Deseas eliminar esta reserva?')) {
      this.serv.deleteIdReserva(id).subscribe({
        next: () => {
          console.log(`Reserva con ID ${id} eliminada exitosamente.`);
          this.reservas$ = this.serv.getAllReservas();
          if (this.idReservaEditar === id) this.resetFormulario();
        },
        error: (error) => {
          console.error('Error al eliminar reserva:', error);
        }
      });
    }
  }

  resetFormulario(): void {
    this.reservaForm.reset();
    this.modoEdicion = false;
    this.idReservaEditar = null;
  }
}
