import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CategoriaHabitacion } from '../../auth/models/categoria_habitacion';
import { CategoriaHabitacionServices } from '../services/categoria_habitacion';

@Component({
  selector: 'app-categoria-habitacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './categoria-habitacion.html',
  styleUrl: './categoria-habitacion.scss'
})
export class CategoriaHabitacionComponent {
  protected categorias$!: Observable<CategoriaHabitacion[]>;

  private serv = inject(CategoriaHabitacionServices);
  private fb = inject(FormBuilder);

  public categoriaForm: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', Validators.required],
    capacidad: [0, [Validators.required, Validators.min(1)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    imagen: ['', Validators.required]
  });

  public modoEdicion = false;
  public idCategoriaEditar: number | null = null;

  get nombre() { return this.categoriaForm.get('nombre'); }
  get descripcion() { return this.categoriaForm.get('descripcion'); }
  get capacidad() { return this.categoriaForm.get('capacidad'); }
  get precio() { return this.categoriaForm.get('precio'); }
  get imagen() { return this.categoriaForm.get('imagen'); }

  ngOnInit(): void {
    this.categorias$ = this.serv.getAllCategorias();
  }

  registroCategoria(): void {
    if (this.categoriaForm.invalid) {
      this.categoriaForm.markAllAsTouched();
      console.log('Formulario inválido');
      return;
    }

    const data = this.categoriaForm.value;

    if (this.modoEdicion) {
      this.serv.putEditarCategoria(this.idCategoriaEditar!, data).subscribe(() => {
        this.categorias$ = this.serv.getAllCategorias();
        this.resetFormulario();
      });
    } else {
      this.serv.postInsertarCategoria(data).subscribe(() => {
        this.categorias$ = this.serv.getAllCategorias();
        this.resetFormulario();
      });
    }
  }

  editarCategoria(cat: CategoriaHabitacion): void {
    this.categoriaForm.patchValue(cat);
    this.idCategoriaEditar = cat.id ?? null;
    this.modoEdicion = true;
  }

  eliminarCategoria(id: number): void {
    if (confirm('¿Deseas eliminar esta categoría?')) {
      this.serv.deleteCategoria(id).subscribe(() => {
        this.categorias$ = this.serv.getAllCategorias();
        if (this.idCategoriaEditar === id) this.resetFormulario();
      });
    }
  }

  resetFormulario(): void {
    this.categoriaForm.reset();
    this.modoEdicion = false;
    this.idCategoriaEditar = null;
  }
}
