import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { HabitacionServices } from '../services/habitacion.services';
import { CategoriaHabitacionServices } from '../services/categoria-habitacion';
import { Habitacion } from '../../auth/models/habitacion';
import { CategoriaHabitacion } from '../../auth/models/categoria-habitacion';


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
    id_habitacion: [null],
    nombre_habitacion: ['', [Validators.required, Validators.minLength(3)]],
    descripcion_habitacion: ['', Validators.required],
    estado: [null, Validators.required],
    categoriaHabitacion: [null, Validators.required],
    tipo: [null, Validators.required]
  });

  get nombre_habitacion() { return this.habitacionForm.get('nombre_habitacion'); }
  get descripcion_habitacion() { return this.habitacionForm.get('descripcion_habitacion'); }
  get estado() { return this.habitacionForm.get('estado'); }
  get categoriaHabitacion() { return this.habitacionForm.get('categoriaHabitacion'); }
  get tipo() { return this.habitacionForm.get('tipo'); }

  public modoEdicion: boolean = false;
  public idHabitacionEditar: number | null = null;

  registroHabitacion(): void {
    if (this.habitacionForm.invalid) {
      this.habitacionForm.markAllAsTouched();
      console.warn('Formulario inválido');
      return;
    }

    // Construimos el objeto correctamente
    const formValue = this.habitacionForm.value;
    const data: Habitacion = {
      id_habitacion: formValue.id_habitacion,
      nombre_habitacion: formValue.nombre_habitacion,
      descripcion_habitacion: formValue.descripcion_habitacion,
      estado: formValue.estado,
      tipo: formValue.tipo,
      categoriaHabitacion: {
        id_categoria_habitacion: formValue.categoriaHabitacion,
        nombre_categoria: '', // opcional si tu backend solo necesita el id
        descripcion_categoria: '',
        capacidad: 0,
        precio: 0,
        imagen: ''
      }
    };


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
      id_habitacion: hab.id_habitacion,
      nombre_habitacion: hab.nombre_habitacion,
      descripcion_habitacion: hab.descripcion_habitacion,
      estado: hab.estado,
      tipo: hab.tipo,
      categoriaHabitacion: hab.categoriaHabitacion.id_categoria_habitacion
    });

    this.idHabitacionEditar = hab.id_habitacion!;
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
    return c1 && c2 ? c1.id_categoria_habitacion === c2.id_categoria_habitacion : c1 === c2;
  }

}
