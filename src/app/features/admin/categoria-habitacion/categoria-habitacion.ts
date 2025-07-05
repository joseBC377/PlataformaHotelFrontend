import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categoria-habitacion-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria-habitacion.html',
  styleUrls: ['./categoria-habitacion.scss']
})
export class CategoriaHabitacionAdminComponent {
  categorias = [
    {
      id: 1,
      nombre: 'Doble',
      descripcion: 'Habitación con cama matrimonial ideal para 2 personas.',
      capacidad: 2,
      precio: 150.00,
      imagen: 'assets/images/habitaciones/doble/habitacion_estandar1.png'
    },
    {
      id: 2,
      nombre: 'Doble Superior',
      descripcion: 'Habitación con cama Queen y mayor espacio, ideal para parejas y un niño.',
      capacidad: 3,
      precio: 180.00,
      imagen: 'assets/images/habitaciones/doble_superior/habitacion_superior1.png'
    },
    {
      id: 3,
      nombre: 'Estándar Triple',
      descripcion: 'Habitación con 3 camas individuales para grupos pequeños o familias.',
      capacidad: 3,
      precio: 200.00,
      imagen: 'assets/images/habitaciones/triple/habitacion_triple1.png'
    },
    {
      id: 4,
      nombre: 'Junior Suite',
      descripcion: 'Espaciosa habitación con cama King, servicios exclusivos y decoración moderna.',
      capacidad: 2,
      precio: 220.00,
      imagen: 'assets/images/habitaciones/suite/habitacion_suite1.png'
    },
    {
      id: 5,
      nombre: 'Superior Twin',
      descripcion: 'Habitación con dos camas semidobles, ideal para amigos o colegas de trabajo.',
      capacidad: 2,
      precio: 190.00,
      imagen: 'assets/images/habitaciones/twin/habitacion_twin1.png'
    }
  ];

  nuevaCategoria = {
    nombre: '',
    descripcion: '',
    capacidad: 0,
    precio: 0,
    imagen: ''
  };

  modoEdicion = false;
  idCategoriaEditar: number | null = null;

  agregarCategoria() {
    if (this.modoEdicion && this.idCategoriaEditar !== null) {
      const index = this.categorias.findIndex(c => c.id === this.idCategoriaEditar);
      if (index !== -1) {
        this.categorias[index] = { ...this.nuevaCategoria, id: this.idCategoriaEditar };
      }
      this.resetFormulario();
    } else {
      const nuevo = {
        ...this.nuevaCategoria,
        id: this.categorias.length > 0 ? Math.max(...this.categorias.map(c => c.id)) + 1 : 1
      };
      this.categorias.push(nuevo);
      this.resetFormulario();
    }
  }

  editarCategoria(categoria: any) {
    this.nuevaCategoria = { ...categoria };
    this.modoEdicion = true;
    this.idCategoriaEditar = categoria.id;
  }

  eliminarCategoria(id: number) {
    this.categorias = this.categorias.filter(c => c.id !== id);
    if (this.idCategoriaEditar === id) {
      this.resetFormulario();
    }
  }

  actualizarCategoria() {
    if (this.idCategoriaEditar !== null) {
      const index = this.categorias.findIndex(c => c.id === this.idCategoriaEditar);
      if (index !== -1) {
        this.categorias[index] = { ...this.nuevaCategoria, id: this.idCategoriaEditar };
      }
      this.resetFormulario();
    }
  }

  private resetFormulario() {
    this.nuevaCategoria = {
      nombre: '',
      descripcion: '',
      capacidad: 0,
      precio: 0,
      imagen: ''
    };
    this.modoEdicion = false;
    this.idCategoriaEditar = null;
  }
}
