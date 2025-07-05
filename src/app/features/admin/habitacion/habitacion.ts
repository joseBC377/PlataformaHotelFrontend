import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-habitaciones-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './habitacion.html',
  styleUrls: ['./habitacion.scss']
})
export class HabitacionesAdminComponent implements OnInit {
  habitacionForm!: FormGroup;
  categorias = ['Doble', 'Doble Superior', 'Estándar Triple', 'Junior Suite', 'Superior Twin'];
  habitaciones: any[] = [];
  modoEdicion = false;
  idHabitacionEditar: number | null = null;


  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.habitacionForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      estado: ['', Validators.required],
      categoria: [null, Validators.required]
    });

    // ✅ Carga inicial de habitaciones (con descripción completa)
    this.habitaciones = [
      {
        id: 1,
        nombre: 'Estándar Doble',
        descripcion: 'Acogedora y moderna habitación, excelente para negocios o placer, recomendada para una o dos personas. Mide entre 16 M² y 18 M², con 1 cama matrimonial, vista interna o a la calle. Incluye cerradura electrónica con sistema de apertura de proximidad, ventana termoacústica, aire acondicionado central con termostato individual, sistema de calentamiento de agua central, Wifi GRATIS, baño, mini-frigorífico, TV, caja de seguridad digital, radio reloj con Bluetooth y puerto USB.',
        estado: 'Disponible',
        categoria: 'Doble',
      },
      {
        id: 2,
        nombre: 'Superior Doble',
        descripcion: 'Magnífica y confortable habitación ideal para parejas y un niño. Miden entre 18 M² y 24 M², con cama Queen, vista interna o a la calle. Cuenta con cerradura electrónica, ventanas termoacústicas, aire acondicionado central con termostato individual, sistema de calentamiento de agua central, Wifi GRATIS, baño, mini-frigorífico, TV, caja de seguridad digital, radio reloj con Bluetooth y puerto USB.',
        estado: 'Ocupada',
        categoria: 'Doble Superior',
      },
      {
        id: 3,
        nombre: 'Superior Twin',
        descripcion: 'Cómodas habitaciones de 18 M² a 19 M² con dos camas semidobles, vista interna. Incluye cerradura electrónica con sistema de apertura por proximidad, ventanas termoacústicas, aire acondicionado central con termostato individual, baño con ducha y calentador de agua central, TV, Wifi GRATIS, mini-frigorífico, caja de seguridad digital, radio reloj con Bluetooth y puerto USB.',
        estado: 'Disponible',
        categoria: 'Superior Twin',
      },
      {
        id: 4,
        nombre: 'Estándar Triple',
        descripcion: 'Habitaciones de 19 M² con 3 camas de 1 metro, vista interna. Cuenta con cerradura electrónica con sistema de apertura por proximidad, ventanas termoacústicas, aire acondicionado central con termostato individual, sistema central de calentamiento de agua, Internet Wifi e Internet por cable GRATIS, minibar a solicitud, caja de seguridad digital, radio reloj con Bluetooth y puerto USB.',
        estado: 'Ocupada',
        categoria: 'Estándar Triple',
      },
      {
        id: 5,
        nombre: 'Junior Suite',
        descripcion: 'Placentera y espaciosa habitación, la más amplia del hotel con 32 M², vista interna, con 1 cama King o dos camas semidobles. Cerradura electrónica con sistema de apertura por proximidad, ventanería termoacústica, aire acondicionado central con termostato individual, doble armario, sistema de calentamiento de agua central, Wifi GRATIS, baño, mini-frigorífico, TV, caja de seguridad digital, radio reloj con Bluetooth y puerto USB.',
        estado: 'Disponible',
        categoria: 'Junior Suite',
      }
    ];
  }
  agregarHabitacion() {
    if (this.habitacionForm.invalid) {
      this.habitacionForm.markAllAsTouched(); // Solo marca si está inválido al presionar "Agregar"
      return;
    }

    const nueva = {
      ...this.habitacionForm.value,
      id: this.idHabitacionEditar ?? (this.habitaciones.length > 0 ? Math.max(...this.habitaciones.map(h => h.id)) + 1 : 1)
    };

    if (this.modoEdicion) {
      const index = this.habitaciones.findIndex(h => h.id === this.idHabitacionEditar);
      if (index !== -1) this.habitaciones[index] = nueva;
    } else {
      this.habitaciones.push(nueva);
    }

    this.resetFormulario();
  }

  editarHabitacion(h: any) {
    this.habitacionForm.setValue({
      nombre: h.nombre,
      descripcion: h.descripcion,
      estado: h.estado,
      categoria: h.categoria
    });
    this.idHabitacionEditar = h.id;
    this.modoEdicion = true;
  }

  eliminarHabitacion(id: number) {
    const confirmar = confirm('¿Deseas eliminar esta habitación?');
    if (confirmar) {
      this.habitaciones = this.habitaciones.filter(h => h.id !== id);
      if (this.idHabitacionEditar === id) this.resetFormulario();
    }
  }

  resetFormulario() {
    this.habitacionForm.reset();
    this.modoEdicion = false;
    this.idHabitacionEditar = null;
  }

  // Getters para validación
  get nombre() { return this.habitacionForm.get('nombre'); }
  get descripcion() { return this.habitacionForm.get('descripcion'); }
  get estado() { return this.habitacionForm.get('estado'); }
  get categoria() { return this.habitacionForm.get('categoria'); }
}
