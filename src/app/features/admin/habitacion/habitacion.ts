import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { HabitacionServices } from '../services/habitacion.services';
import { CategoriaHabitacionServices } from '../services/categoria_habitacion';
import { Habitacion } from '../../auth/models/habitacion';
import { CategoriaHabitacion } from '../../auth/models/categoria_habitacion';

@Component({
  selector: 'app-habitaciones-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './habitacion.html',
  styleUrl: './habitacion.scss'
})
export class HabitacionesAdminComponent implements OnInit {
  protected habitacion$!: Observable<Habitacion[]>;
  protected categorias$!: Observable<CategoriaHabitacion[]>;

  private fb = inject(FormBuilder);
  private serv = inject(HabitacionServices);
  private catServ = inject(CategoriaHabitacionServices);

  public habitacionForm: FormGroup = this.fb.group({
    id: [null],
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    descripcion: ['', Validators.required],
    estado: ['', Validators.required],
    categoriaHabitacion: [null, Validators.required]
  });

  get nombre() { return this.habitacionForm.get('nombre'); }
  get descripcion() { return this.habitacionForm.get('descripcion'); }
  get estado() { return this.habitacionForm.get('estado'); }
  get categoriaHabitacion() { return this.habitacionForm.get('categoriaHabitacion'); }

  public modoEdicion: boolean = false;
  public idHabitacionEditar: number | null = null;

  registroHabitacion(): void {
    if (this.habitacionForm.invalid) {
      this.habitacionForm.markAllAsTouched();
      console.warn('Formulario inválido');
      return;
    }

    const data = this.habitacionForm.value;
    console.log('Actualizando habitación con ID:', this.idHabitacionEditar);
    console.log('Datos a enviar:', data);

    if (this.modoEdicion) {
      this.serv.putEditarHabitacion(this.idHabitacionEditar!, data).subscribe(() => {
        this.habitacion$ = this.serv.getAllHabitaciones();
        this.resetFormulario();
      });
    } else {
      this.serv.postInsertarHabitacion(data).subscribe(() => {
        this.habitacion$ = this.serv.getAllHabitaciones();
        this.resetFormulario();
      });
    }
  }
  editarHabitacion(hab: Habitacion): void {
    console.log('Editando habitación:', hab);

    this.habitacionForm.patchValue({
      id: hab.id,
      nombre: hab.nombre,
      descripcion: hab.descripcion,
      estado: hab.estado,
      categoriaHabitacion: hab.categoriaHabitacion
    });

    this.idHabitacionEditar = hab.id!;
    this.modoEdicion = true;
  }

  eliminarHabitacion(id: number): void {
    if (confirm('¿Seguro que deseas eliminar esta habitación?')) {
      this.serv.deleteHabitacion(id).subscribe(() => {
        this.habitacion$ = this.serv.getAllHabitaciones();
        if (this.idHabitacionEditar === id) this.resetFormulario();
      });
    }
  }

  resetFormulario(): void {
    this.habitacionForm.reset();
    this.modoEdicion = false;
    this.idHabitacionEditar = null;
  }

  ngOnInit(): void {
    this.habitacion$ = this.serv.getAllHabitaciones();
    this.categorias$ = this.catServ.getAllCategorias();

  }

  compararCategoria = (c1: CategoriaHabitacion, c2: CategoriaHabitacion): boolean => {
    return c1 && c2 ? c1.id === c2.id : c1 === c2;
  }

}
