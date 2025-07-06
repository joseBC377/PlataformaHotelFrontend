import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reservas.html',
  styleUrl: './reservas.scss'
})
export class Reservas {
  toggled = false;

  showSignIn() {
    this.toggled = false;
  }

  showSignUp() {
    this.toggled = true;
  }

  private fb = inject(FormBuilder);
  public errorMsg = signal<string | null>(null);

  public reservaForm: FormGroup = this.fb.group({
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
  });

  get codigo() {
    return this.reservaForm.get('codigo');
  }

  get nombre() {
    return this.reservaForm.get('nombre');
  }

  buscarReserva() {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      return;
    }

    this.errorMsg.set(null);
    const { codigo, nombre } = this.reservaForm.value;

    console.log('Buscando reserva con código:', codigo, 'y nombre:', nombre);

    if (codigo !== 'ABC123') {
      this.errorMsg.set('No se encontró ninguna reserva con ese código.');
    }
  }
}
