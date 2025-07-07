import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { PagoModel } from '../../auth/models/pago';
import { PagoService } from '../services/pago.services';

@Component({
  selector: 'app-pago',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pago.html',
  styleUrl: './pago.scss'
})
export class Pago {
  protected pago$!:Observable<PagoModel[]>
  private ser = inject(PagoService);
  private fb = inject(FormBuilder);
  

  public pagoForm:FormGroup =this.fb.group({
      id: [null], 
      total: [null, [Validators.required, Validators.min(0.01)]], 
      metodo_pago: ['', Validators.required],
      estado_pago: ['', Validators.required],
      fecha_pago: [null, Validators.required],
      id_reserva: [null, [Validators.required, Validators.pattern('^[0-9]+$')]] 
  });
  get total() { return this.pagoForm.get('total'); }
  get metodo_pago() { return this.pagoForm.get('metodo_pago'); }
  get estado_pago() { return this.pagoForm.get('estado_pago'); }
  get fecha_pago() { return this.pagoForm.get('fecha_pago'); }
  get id_reserva() { return this.pagoForm.get('id_reserva'); }

  registroFn() {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      console.log('Formulario de registro invalido')
      return;
    }
    console.log('formulario de registro valido', this.pagoForm.value)
  }
  ngOnInit(): void {
    this.pago$ = this.ser.getSelectPago();
  }
  
}