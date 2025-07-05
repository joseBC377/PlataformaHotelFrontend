import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-pago',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pago.html',
  styleUrl: './pago.scss'
})
export class Pago {
  pagoForm!: FormGroup; 
  pagos: any[] = [];
  modoEdicion = false;

  metodosDePago = ['Tarjeta de Crédito', 'PayPal', 'Yape', 'Plin','Efectivo'];
  estadosDePago = ['Pendiente', 'Pagado', 'Cancelado', 'Reembolsado'];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0]; 
    this.pagoForm = this.fb.group({
      id: [null], 
      total: [null, [Validators.required, Validators.min(0.01)]], 
      metodo_pago: ['', Validators.required],
      estado_pago: ['', Validators.required],
      fecha_pago: [today, Validators.required],
      id_reserva: [null, [Validators.required, Validators.pattern('^[0-9]+$')]] 
    });
  }

  guardarPago(): void {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      return;
    }

    if (this.modoEdicion) {
      this.actualizarPago();
    } else {
      this.agregarPago();
    }
  }

  agregarPago(): void {
    const nuevoId = this.pagos.length > 0 ? Math.max(...this.pagos.map(p => p.id)) + 1 : 1;
    this.pagos.push({ ...this.pagoForm.value, id: nuevoId });
    this.resetFormulario();
  }

  actualizarPago(): void {
    const id = this.pagoForm.value.id;
    const index = this.pagos.findIndex(p => p.id === id);
    if (index !== -1) {
      this.pagos[index] = this.pagoForm.value;
    }
    this.resetFormulario();
  }

  editarPago(pago: any): void {
    this.modoEdicion = true;
    const fechaFormateada = new Date(pago.fecha_pago).toISOString().split('T')[0];
    this.pagoForm.patchValue({
      ...pago,
      fecha_pago: fechaFormateada
    });
  }

  eliminarPago(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este pago?')) {
      this.pagos = this.pagos.filter(p => p.id !== id);
      if (this.pagoForm.value.id === id) {
        this.resetFormulario();
      }
    }
  }

  resetFormulario(): void {
    this.modoEdicion = false;
    const today = new Date().toISOString().split('T')[0];
    this.pagoForm.reset({
      fecha_pago: today,
      metodo_pago: '',
      estado_pago: ''
    });
  }
  get total() { return this.pagoForm.get('total'); }
  get metodo_pago() { return this.pagoForm.get('metodo_pago'); }
  get estado_pago() { return this.pagoForm.get('estado_pago'); }
  get fecha_pago() { return this.pagoForm.get('fecha_pago'); }
  get id_reserva() { return this.pagoForm.get('id_reserva'); }
}