import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { CategoriaHabitacion } from '../../auth/models/categoria-habitacion';
import { CategoriaHabitacionServices } from '../services/categoria-habitacion';
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
    id_categoria_habitacion: [null],
    nombre_categoria: ['', [Validators.required, Validators.minLength(3)]],
    descripcion_categoria: ['', Validators.required],
    capacidad: [0, [Validators.required, Validators.min(1)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    imagen: ['', Validators.required],
    habitacion: [[]] // Inicializamos como array vacío
  });

  public modoEdicion = false;
  public idCategoriaEditar: number | null = null;
  selectedFile: File | null = null; imagenInvalida = false;
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  get nombre_categoria() { return this.categoriaForm.get('nombre_categoria'); }
  get descripcion_categoria() { return this.categoriaForm.get('descripcion_categoria'); }
  get capacidad() { return this.categoriaForm.get('capacidad'); }
  get precio() { return this.categoriaForm.get('precio'); }
  get imagen() { return this.categoriaForm.get('imagen'); }
  get habitacion() { return this.categoriaForm.get('habitacion'); }

  ngOnInit(): void {
    this.categorias$ = this.serv.getAllCategorias();
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        this.categoriaForm.patchValue({ imagen: base64 });
        this.imagenInvalida = false;
      };
      reader.readAsDataURL(file);
    } else {
      this.imagenInvalida = true;
    }
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
    this.idCategoriaEditar = cat.id_categoria_habitacion ?? null;
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
    this.selectedFile = null;
    this.imagenInvalida = false;

    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }
}
