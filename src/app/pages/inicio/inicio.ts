import { Component } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};
@Component({
  selector: 'app-inicio',
  imports: [CommonModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ]
})
export class Inicio {
  entradaControl = new FormControl(new Date());
  salidaControl = new FormControl(new Date(new Date().setDate(new Date().getDate() + 1)));

  // valida para que la fecha salida sea mayor a la fecha de entrada
  ngOnInit() {
    this.entradaControl.valueChanges.subscribe((entrada) => {
      const salida = this.salidaControl.value;
      if (entrada && salida && salida <= entrada) {
        const nuevaSalida = new Date(entrada);
        nuevaSalida.setDate(nuevaSalida.getDate() + 1);
        this.salidaControl.setValue(nuevaSalida);
      }
    });
  }
  adultos = 1;
  ninos = 0;
  habitaciones = 1;

  getValor(index: number): number {
    switch (index) {
      case 0: return this.adultos;
      case 1: return this.ninos;
      case 2: return this.habitaciones;
      default: return 0;
    }
  }

  incrementar(index: number): void {
    switch (index) {
      case 0: this.adultos++; break;
      case 1: this.ninos++; break;
      case 2: this.habitaciones++; break;
    }
  }

  decrementar(index: number): void {
    switch (index) {
      case 0: if (this.adultos > 1) this.adultos--; break;
      case 1: if (this.ninos > 0) this.ninos--; break;
      case 2: if (this.habitaciones > 1) this.habitaciones--; break;
    }
  }
}
