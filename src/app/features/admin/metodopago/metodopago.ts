import { Component, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MetodoPagoModel } from '../../auth/models/metodopago';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MetodoPagoService } from '../services/metodopago.service';

@Component({
  selector: 'app-metodopago',
  imports: [
    CommonModule,
    ReactiveFormsModule  // ← ¿está este? Si no, agrégalo
  ],
  standalone: true,   // ← esto falta
  templateUrl: './metodopago.html',
  styleUrls: ['./metodopago.scss']
})
export class Metodopago {

  protected metodosPago$!: Observable<MetodoPagoModel[]>;

  private fb = inject(FormBuilder);
  private serv = inject(MetodoPagoService);

  public modoEdicion = false;
  public idEditar: number | null = null;

  // Tipos del enum RolMetodoPago — ajusta según los valores reales de tu enum Java
  public tiposPago = ['Efectivo', 'Tarjeta', 'Yape', 'Plin', 'Transferencia'];

  public metodoPagoForm: FormGroup = this.fb.group({
    id_metodo_pago: [null],
    tipo: ['', Validators.required],
    ultimoscuatrodigitos: ['', [Validators.pattern(/^\d{4}$/)]],
    fechaVencimiento: ['', [Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    token: [''],
    activo: [true, Validators.required]
  });

  get tipo() { return this.metodoPagoForm.get('tipo'); }
  get activo() { return this.metodoPagoForm.get('activo'); }

  ngOnInit(): void {
    this.metodosPago$ = this.serv.getAll();
  }

  guardar(): void {
    if (this.metodoPagoForm.invalid) {
      this.metodoPagoForm.markAllAsTouched();
      return;
    }

    const data: MetodoPagoModel = this.metodoPagoForm.value;

    if (this.modoEdicion && this.idEditar) {
      this.serv.put(this.idEditar, data).subscribe({
        next: () => {
          this.metodosPago$ = this.serv.getAll();
          this.resetFormulario();
        },
        error: () => alert('Error al actualizar')
      });
    } else {
      this.serv.post(data).subscribe({
        next: () => {
          this.metodosPago$ = this.serv.getAll();
          this.resetFormulario();
        },
        error: () => alert('Error al registrar')
      });
    }
  }

  editar(mp: MetodoPagoModel): void {
    this.metodoPagoForm.patchValue(mp);
    this.idEditar = mp.id_metodo_pago ?? null;
    this.modoEdicion = true;
  }

  eliminar(id: number): void {
    if (!confirm('¿Eliminar este método de pago?')) return;
    this.serv.delete(id).subscribe({
      next: () => {
        this.metodosPago$ = this.serv.getAll();
        if (this.idEditar === id) this.resetFormulario();
      },
      error: err => console.error('Error al eliminar', err)
    });
  }

  resetFormulario(): void {
    this.metodoPagoForm.reset({ activo: true });
    this.modoEdicion = false;
    this.idEditar = null;
  }
}
