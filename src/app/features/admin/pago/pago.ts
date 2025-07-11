import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PagoModel } from '../../auth/models/pago';
import { PagoService } from '../services/pago.services';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pago.html',
  styleUrl: './pago.scss'
})
export class Pago {
  protected pago$!: Observable<PagoModel[]>
  private serv = inject(PagoService);
  private fb = inject(FormBuilder);


  public pagoForm: FormGroup = this.fb.group({
    id: [null],
    total: [null, [Validators.required, Validators.min(0.01)]],
    metodo_pago: ['', Validators.required],
    estado_pago: ['', Validators.required],
    fecha_pago: [null, Validators.required],
    id_reserva: [null, [Validators.required, Validators.pattern('^[0-9]+$')]]
  });

  public modoEdicion = false;
  public idPagoEditar: number | null = null;

  get total() { return this.pagoForm.get('total'); }
  get metodo_pago() { return this.pagoForm.get('metodo_pago'); }
  get estado_pago() { return this.pagoForm.get('estado_pago'); }
  get fecha_pago() { return this.pagoForm.get('fecha_pago'); }
  get id_reserva() { return this.pagoForm.get('id_reserva'); }

  ngOnInit(): void {
    this.pago$ = this.serv.getSelectPago();
  }

  registroFn(): void {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      console.log('Formulario de registro invalido')
      return;
    }
    
  const data = this.pagoForm.value;

  if(this.modoEdicion) {
    this.serv.putUpdatePago(this.idPagoEditar!, data).subscribe(() => {
      this.pago$ = this.serv.getSelectPago();
      this.resetFormulario();
    });
  } else {
  this.serv.postInsertPago(data).subscribe(() => {
    this.pago$ = this.serv.getSelectPago();
    this.resetFormulario();
  });
  }
  }

editarPago(pago: PagoModel): void {
  this.pagoForm.patchValue(pago);
  this.idPagoEditar = pago.idPago ?? null;
  this.modoEdicion = true;
}

eliminarPago(id: number): void {
  if(confirm('¿Deseas eliminar este pago?')) {
  this.serv.deleteIdPago(id).subscribe(() => {
    this.pago$ = this.serv.getSelectPago();
    if (this.idPagoEditar === id) this.resetFormulario();
  });
}
  }


resetFormulario(): void {
  this.pagoForm.reset();
  this.modoEdicion = false;
  this.idPagoEditar = null;
} 

}