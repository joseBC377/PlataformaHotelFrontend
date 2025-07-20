import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PagoModel } from '../../auth/models/pago';
import { ReservaModel } from '../../auth/models/reserva';
import { Observable } from 'rxjs';
import { PagoService } from '../services/pago.services';
import { ReservaService } from '../services/reserva.services';

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

  private fb = inject(FormBuilder);
  private pagoServ = inject(PagoService);
  private reservaServ = inject(ReservaService);

  public pagoForm: FormGroup = this.fb.group({
    idPago: [null],
    total: [0, [Validators.required, Validators.min(1)]],
    metodo_pago: ['', Validators.required],
    estado_pago: ['', Validators.required],
    fecha_pago: ['', Validators.required],
    id_reserva: [null, Validators.required]
  });

  public modoEdicion = false;
  public idPagoEditar: number | null = null;

  get total() { return this.pagoForm.get('total'); }

  ngOnInit(): void {
    this.pagos$ = this.pagoServ.getSelectPago();
    this.reservas$ = this.reservaServ.getAllReservas();
  }

 guardarPago(): void {
  if (this.pagoForm.invalid) {
    this.pagoForm.markAllAsTouched();
    return;
  }

  const data = this.pagoForm.value;

  // Aquí ya data.id_reserva es un objeto ReservaModel seleccionado desde el <select>

  if (this.modoEdicion) {
    this.pagoServ.putUpdatePago(this.idPagoEditar!, data).subscribe(() => {
      this.pagos$ = this.pagoServ.getSelectPago();
      this.resetFormulario();
    });
  } else {
    this.pagoServ.postInsertarPagoConReserva(data).subscribe(() => {
      this.pagos$ = this.pagoServ.getSelectPago();
      this.resetFormulario();
    });
  }
}


  editarPago(pago: PagoModel): void {
    this.pagoForm.patchValue(pago);
    this.idPagoEditar = pago.idPago;
    this.modoEdicion = true;
  }

  eliminarPago(id: number): void {
    if (confirm('¿Eliminar este pago?')) {
      this.pagoServ.deleteIdPago(id).subscribe(() => {
        this.pagos$ = this.pagoServ.getSelectPago();
        if (this.idPagoEditar === id) this.resetFormulario();
      });
    }
  }

  resetFormulario(): void {
    this.pagoForm.reset();
    this.idPagoEditar = null;
    this.modoEdicion = false;
  }
}
