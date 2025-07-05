import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-habitaciones-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './habitacion.html',
  styleUrls: ['./habitacion.scss']
})
export class HabitacionesAdminComponent {
  categorias = [
    'Doble',
    'Doble Superior',
    'Estándar Triple',
    'Junior Suite',
    'Superior Twin'
  ];

  habitaciones = [
    {
      id: 1,
      nombre: 'Estándar Doble',
      descripcion: 'Acogedora y Moderna Habitación, excelente para negocios o placer, recomendada para una o dos personas, desde 16 M² hasta 18 M², con 1 Cama Matrimonial, vista interna o a la calle. Incluye cerradura electrónica con sistema de apertura de proximidad, ventana termoacústica, aire acondicionado central con termostato individual, sistema de calentamiento de agua central, Wifi GRATIS, baño, mini-frigorífico, TV, caja de seguridad digital, radio reloj con Bluetooth y puerto USB',
      estado: 'Disponible',
      categoria: 'Doble',
    },
    {
      id: 2,
      nombre: 'Superior Doble',
      descripcion: 'Magnífica y confortable habitación ideal para parejas y un niño. Miden entre 18 M² y 24 M², con cama Queen, vista interna o a la calle. Cuenta con cerradura electrónica, ventanas termoacústicas, aire acondicionado central con termostato individual, sistema de calentamiento de agua central, Wifi GRATIS, baño, mini-frigorífico, TV, caja de seguridad digital, radio reloj con Bluetooth y puerto USB',
      estado: 'Ocupada',
      categoria: 'Doble Superior',
    },
    {
      id: 3,
      nombre: 'Superior Twin',
      descripcion: 'Cómodas habitaciones de 18 M² a 19 M² con dos camas semidobles, vista interna, cerradura electrónica con sistema de apertura por proximidad, ventanas termoacústicas, aire acondicionado central con termostato individual, baño con ducha y calentador de agua central, TV, Wifi GRATIS, mini-frigorífico, caja de seguridad digital, radio reloj con Bluetooth y puerto USB',
      estado: 'Disponible',
      categoria: 'Superior Twin',
    },
    {
      id: 4,
      nombre: 'Estándar Triple',
      descripcion: 'Habitaciones de 19 M² con 3 camas de 1 metro, vista interna, cerradura electrónica con sistema de apertura por proximidad, ventanas termoacústicas, aire acondicionado central con termostato individual, sistema central de calentamiento de agua, Internet Wifi e Internet por cable GRATIS, minibar a solicitud, caja de seguridad digital, radio reloj con Bluetooth y puerto USB',
      estado: 'Ocupada',
      categoria: 'Estándar Triple',
    },
    {
      id: 5,
      nombre: 'Junior Suite',
      descripcion: 'Placentera y espaciosa habitación, la más amplia del hotel con 32 M², vista interna, con 1 cama King o dos camas semidobles. Cerradura electrónica con sistema de apertura por proximidad, ventanería termoacústica, aire acondicionado central con termostato individual, doble armario, sistema de calentamiento de agua central, Wifi GRATIS, baño, mini-frigorífico, TV, caja de seguridad digital, radio reloj con Bluetooth y puerto USB',
      estado: 'Disponible',
      categoria: 'Junior Suite',
    }
  ];

  nuevaHabitacion = {
    nombre: '',
    descripcion: '',
    estado: '',
    categoria: this.categorias[0],
  };

  modoEdicion = false;
  idHabitacionEditar: number | null = null;

  agregarHabitacion() {
    if (this.modoEdicion && this.idHabitacionEditar !== null) {
      const index = this.habitaciones.findIndex(h => h.id === this.idHabitacionEditar);
      if (index !== -1) {
        this.habitaciones[index] = { ...this.nuevaHabitacion, id: this.idHabitacionEditar };
      }
      this.resetFormulario();
    } else {
      const nuevo = { ...this.nuevaHabitacion, id: this.habitaciones.length + 1 };
      this.habitaciones.push(nuevo);
      this.resetFormulario();
    }
  }

  editarHabitacion(h: any) {
    this.nuevaHabitacion = { ...h };
    this.modoEdicion = true;
    this.idHabitacionEditar = h.id;
  }

  eliminarHabitacion(id: number) {
    this.habitaciones = this.habitaciones.filter(h => h.id !== id);
    if (this.idHabitacionEditar === id) {
      this.resetFormulario();
    }
  }

  actualizarHabitacion() {
    if (this.idHabitacionEditar !== null) {
      const index = this.habitaciones.findIndex(h => h.id === this.idHabitacionEditar);
      if (index !== -1) {
        this.habitaciones[index] = { ...this.nuevaHabitacion, id: this.idHabitacionEditar };
      }
      this.resetFormulario();
    }
  }

  private resetFormulario() {
    this.modoEdicion = false;
    this.idHabitacionEditar = null;
    this.nuevaHabitacion = {
      nombre: '',
      descripcion: '',
      estado: '',
      categoria: this.categorias[0],
    };
  }
}
