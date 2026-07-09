import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagoModel, PagoRequestModel } from '../../auth/models/pago';
import { ReservaModel } from '../../auth/models/reserva';
import { MetodoPagoModel } from '../../auth/models/metodopago';
import { Observable } from 'rxjs';
import { PagoService } from '../services/pago.services';
import { ReservaService } from '../services/reserva.services';
import { MetodoPagoService } from '../services/metodopago.service';;
@Component({
  selector: 'app-pagos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pago.html',
  styleUrl: './pago.scss'
})
export class PagosComponent implements OnInit {
  protected pagos$!: Observable<PagoModel[]>;
  protected reservas$!: Observable<ReservaModel[]>;
  protected metodosPago$!: Observable<MetodoPagoModel[]>;

  private fb = inject(FormBuilder);
  private pagoServ = inject(PagoService);
  private reservaServ = inject(ReservaService);
  private metodoPagoServ = inject(MetodoPagoService);

  public pagoForm: FormGroup = this.fb.group({
    id_pago: [null],
    total: [0, [Validators.required, Validators.min(1)]],
    estado_pago: ['', Validators.required],
    fecha_pago: ['', Validators.required],
    reserva: [null, Validators.required],
    metodoPago: [null, Validators.required]
  });

  public modoEdicion = false;
  public idPagoEditar: number | null = null;

  get total() { return this.pagoForm.get('total'); }

  ngOnInit(): void {
    this.pagos$ = this.pagoServ.getAll();
    this.reservas$ = this.reservaServ.getAllReservas();
    this.metodosPago$ = this.metodoPagoServ.getAll();
  }

  guardarPago(): void {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    const formValue = this.pagoForm.value;
    const total = Number(formValue.total);
    const igv = +(total * 0.18).toFixed(2);

    const data: PagoRequestModel = {
      total: total,
      igv: igv,
      estado_pago: formValue.estado_pago,
      fecha_pago: formValue.fecha_pago,
      reserva: { id_reserva: formValue.reserva.id_reserva },
      metodoPago: { id_metodo_pago: formValue.metodoPago.id_metodo_pago }
    };

    if (this.modoEdicion) {
      this.pagoServ.put(this.idPagoEditar!, data).subscribe(() => {
        this.pagos$ = this.pagoServ.getAll();
        this.resetFormulario();
      });
    } else {
      this.pagoServ.post(data).subscribe(() => {
        this.pagos$ = this.pagoServ.getAll();
        this.resetFormulario();
      });
    }
  }

  editarPago(pago: PagoModel): void {
    this.pagoForm.patchValue({
      id_pago: pago.id_pago,
      total: pago.total,
      estado_pago: pago.estado_pago,
      fecha_pago: pago.fecha_pago,
      reserva: pago.reserva,
      metodoPago: pago.metodoPago
    });
    this.idPagoEditar = pago.id_pago ?? null;
    this.modoEdicion = true;
  }

  eliminarPago(id: number): void {
    if (confirm('¿Eliminar este pago?')) {
      this.pagoServ.delete(id).subscribe(() => {
        this.pagos$ = this.pagoServ.getAll();
        if (this.idPagoEditar === id) this.resetFormulario();
      });
    }
  }

  resetFormulario(): void {
    this.pagoForm.reset();
    this.idPagoEditar = null;
    this.modoEdicion = false;
  }

  compararReserva(r1: any, r2: any): boolean {
    return r1 && r2 ? r1.id_reserva === r2.id_reserva : r1 === r2;
  }

  compararMetodoPago(m1: any, m2: any): boolean {
    return m1 && m2 ? m1.id_metodo_pago === m2.id_metodo_pago : m1 === m2;
  }
}