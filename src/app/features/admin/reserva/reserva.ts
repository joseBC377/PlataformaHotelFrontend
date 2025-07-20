import { CommonModule, DatePipe } from '@angular/common'; // Mantener DatePipe para el display, no para el formulario input
import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { ReservaService } from '../services/reserva.services';
import { ReservaModel } from '../../auth/models/reserva';
import { UsuarioModel } from '../../auth/models/usuario';
import { AdminServices } from '../services/admin.services'; 
import { HttpClient, HttpHeaders } from '@angular/common/http'; 

@Component({
  selector: 'app-reservas-admin', 
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe], // Agrega DatePipe aquí
  templateUrl: './reserva.html',
  styleUrl: './reserva.scss'
})
export class ReservasAdminComponent implements OnInit {
  protected reservas$!: Observable<ReservaModel[]>;
  protected usuarios$!: Observable<UsuarioModel[]>; 
  private fb = inject(FormBuilder);
  private serv = inject(ReservaService);
  private adminServ = inject(AdminServices);
  private http = inject(HttpClient); // Inyectar HttpClient para la solicitud post directa

  public modoEdicion: boolean = false;
  public idReservaEditar: number | null = null;

  // *** Nuevas validaciones para datetime-local y rangos de fecha ***
  dateTimeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null; // No validar si está vacío, el Validators.required se encargará
      }
      // datetime-local retorna 'YYYY-MM-DDTHH:MM'
      // Intentar crear un objeto Date. Si es 'Invalid Date', el formato es incorrecto.
      const date = new Date(control.value);
      if (isNaN(date.getTime())) {
        return { 'invalidDateTime': true };
      }
      return null;
    };
  }

  futureOrPresentValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (!control.value) {
        return null;
      }
      const selectedDateTime = new Date(control.value);
      const now = new Date();

      // Comparar fechas y horas
      if (selectedDateTime.getTime() < now.getTime()) {
        return { 'futureOrPresent': true };
      }
      return null;
    };
  }

  dateRangeValidator(startControlName: string, endControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): { [key: string]: any } | null => {
      const startDateControl = formGroup.get(startControlName);
      const endDateControl = formGroup.get(endControlName);

      if (!startDateControl || !endDateControl || !startDateControl.value || !endDateControl.value) {
        return null; // No validar si alguna fecha no está presente
      }

      const startDate = new Date(startDateControl.value);
      const endDate = new Date(endDateControl.value);

      if (endDate.getTime() < startDate.getTime()) {
        endDateControl.setErrors({ ...endDateControl.errors, dateRange: true }); // Establece el error en el campo de fecha fin
        return { 'dateRange': true }; // También puedes retornar el error en el formGroup si quieres
      } else {
        // Asegúrate de limpiar el error si ya no es válido
        if (endDateControl.errors && endDateControl.errors['dateRange']) {
          const { dateRange, ...rest } = endDateControl.errors;
          endDateControl.setErrors(Object.keys(rest).length ? rest : null);
        }
      }
      return null;
    };
  }

  // Fin de nuevas validaciones

  public reservaForm: FormGroup = this.fb.group({
    id: [null],
    // Aplicamos las nuevas validaciones
    fecha_inicio: ['', [Validators.required, this.dateTimeValidator(), this.futureOrPresentValidator()]],
    fecha_fin: ['', [Validators.required, this.dateTimeValidator(), this.futureOrPresentValidator()]],
    usuario: [null, Validators.required]
  }, { validators: this.dateRangeValidator('fecha_inicio', 'fecha_fin') }); // Validador de rango aplicado a todo el formulario

  // Getters para fácil acceso a los controles del formulario en el HTML
  get fecha_inicio() { return this.reservaForm.get('fecha_inicio'); }
  get fecha_fin() { return this.reservaForm.get('fecha_fin'); }
  get usuario() { return this.reservaForm.get('usuario'); }

  ngOnInit(): void {
    this.reservas$ = this.serv.getAllReservas();
    this.usuarios$ = this.adminServ.getAllUsers(); // Cambiado de usuario$ a usuarios$
  }

  registroReserva(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      console.warn('Formulario de reserva inválido');
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json'
    });

    // Los valores de fecha_inicio y fecha_fin del formControl ya están en formato ISO 8601 (YYYY-MM-DDTHH:MM)
    // que es compatible con LocalDateTime en Spring Boot si se envía como String.
    const reservaParaBackend: ReservaModel = {
      id: this.reservaForm.value.id, // Asegurarse de enviar el ID en modo edición
      fecha_inicio: this.reservaForm.value.fecha_inicio,
      fecha_fin: this.reservaForm.value.fecha_fin,
      usuario: this.reservaForm.value.usuario
    };

    if (this.modoEdicion) {
      this.serv.putUpdateReserva(this.idReservaEditar!, reservaParaBackend).subscribe({
        next: () => {
          this.reservas$ = this.serv.getAllReservas();
          this.resetFormulario();
        },
        error: (err) => {
          console.error('Error al actualizar reserva:', err);
          alert('No se pudo actualizar la reserva. Verifica tus permisos o el token.');
        }
      });
    } else {
      this.http.post('http://localhost:8081/api/reservas', reservaParaBackend, { headers }).subscribe({
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
    // Al editar, los valores de fecha_inicio y fecha_fin pueden venir del backend
    // en un formato ISO String completo (e.g., "2025-07-20T15:00:00").
    // El input type="datetime-local" espera "YYYY-MM-DDTHH:MM".
    // Si tus fechas del backend tienen segundos o milisegundos, necesitas recortarlas.
    const formattedFechaInicio = res.fecha_inicio ? new Date(res.fecha_inicio).toISOString().slice(0, 16) : null;
    const formattedFechaFin = res.fecha_fin ? new Date(res.fecha_fin).toISOString().slice(0, 16) : null;

    this.reservaForm.patchValue({
      id: res.id,
      fecha_inicio: formattedFechaInicio,
      fecha_fin: formattedFechaFin,
      usuario: res.usuario
    });

    this.idReservaEditar = res.id ?? null;
    this.modoEdicion = true;
  }

  eliminarReserva(id: number): void {
    if (confirm('¿Estás seguro que deseas eliminar esta reserva?')) {
      this.serv.deleteIdReserva(id).subscribe({
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
    // Es buena práctica resetear validadores del formulario si tienes validadores a nivel de formulario
    // this.reservaForm.setErrors(null); // Opcional: para limpiar errores de validadores de formulario
  }

  // compareWith para el select de usuario
  compararUsuario = (u1: UsuarioModel, u2: UsuarioModel): boolean => {
    return u1 && u2 ? u1.id === u2.id : u1 === u2;
  }
}