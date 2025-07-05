import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categoria-habitacion-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './categoria-habitacion.html',
  styleUrls: ['./categoria-habitacion.scss']
})
export class CategoriaHabitacionAdminComponent implements OnInit {
  categoriaForm!: FormGroup;
  categorias: any[] = [];
  modoEdicion = false;
  idCategoriaEditar: number | null = null;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.categoriaForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      capacidad: [null, [Validators.required, Validators.min(1)]],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      imagen: ['', Validators.required]
    });

    // ✅ Datos precargados
    this.categorias = [
      {
        id: 1,
        nombre: 'Doble',
        descripcion: 'Habitación con cama matrimonial ideal para 2 personas.',
        capacidad: 2,
        precio: 150.0,
        imagen: 'assets/images/habitaciones/doble/habitacion_estandar1.png'
      },
      {
        id: 2,
        nombre: 'Doble Superior',
        descripcion: 'Habitación con cama Queen y mayor espacio, ideal para parejas y un niño.',
        capacidad: 3,
        precio: 180.0,
        imagen: 'assets/images/habitaciones/doble_superior/habitacion_superior1.png'
      },
      {
        id: 3,
        nombre: 'Estándar Triple',
        descripcion: 'Habitación con 3 camas individuales para grupos pequeños o familias.',
        capacidad: 3,
        precio: 200.0,
        imagen: 'assets/images/habitaciones/triple/habitacion_triple1.png'
      },
      {
        id: 4,
        nombre: 'Junior Suite',
        descripcion: 'Espaciosa habitación con cama King, servicios exclusivos y decoración moderna.',
        capacidad: 2,
        precio: 220.0,
        imagen: 'assets/images/habitaciones/suite/habitacion_suite1.png'
      },
      {
        id: 5,
        nombre: 'Superior Twin',
        descripcion: 'Habitación con dos camas semidobles, ideal para amigos o colegas de trabajo.',
        capacidad: 2,
        precio: 190.0,
        imagen: 'assets/images/habitaciones/twin/habitacion_twin1.png'
      }
    ];
  }

  agregarCategoria() {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      return;
    }

    const nueva = {
      ...this.categoriaForm.value,
      id: this.idCategoriaEditar ?? (this.categorias.length > 0 ? Math.max(...this.categorias.map(c => c.id)) + 1 : 1)
    };

    if (this.modoEdicion) {
      const index = this.categorias.findIndex(c => c.id === this.idCategoriaEditar);
      if (index !== -1) this.categorias[index] = nueva;
    } else {
      this.categorias.push(nueva);
    }

    this.resetFormulario();
  }

  editarCategoria(categoria: any) {
    this.categoriaForm.setValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      capacidad: categoria.capacidad,
      precio: categoria.precio,
      imagen: categoria.imagen
    });
    this.idCategoriaEditar = categoria.id;
    this.modoEdicion = true;
  }

  eliminarCategoria(id: number) {
    const confirmar = confirm('¿Deseas eliminar esta categoría?');
    if (confirmar) {
      this.categorias = this.categorias.filter(c => c.id !== id);
      if (this.idCategoriaEditar === id) this.resetFormulario();
    }
  }

  resetFormulario() {
    this.categoriaForm.reset();
    this.idCategoriaEditar = null;
    this.modoEdicion = false;
  }

  // Getters para validación
  get nombre() { return this.categoriaForm.get('nombre'); }
  get descripcion() { return this.categoriaForm.get('descripcion'); }
  get capacidad() { return this.categoriaForm.get('capacidad'); }
  get precio() { return this.categoriaForm.get('precio'); }
  get imagen() { return this.categoriaForm.get('imagen'); }
}
