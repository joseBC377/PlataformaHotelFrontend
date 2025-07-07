import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Servicio } from '../../auth/models/servicio';
import { ServicioService } from '../services/servicio.service';

@Component({
  selector: 'app-servicios-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './servicio.html',
  styleUrls: ['./servicio.scss']
})
export class ServiciosAdminComponent implements OnInit {

  protected servicio$!: Observable<Servicio[]>;
  private serv = inject(ServicioService);

  servicios: any[] = [];

  servicioForm: FormGroup;
  modoEdicion = false;
  idServicioEditar: number | null = null;

  constructor(private fb: FormBuilder) {
    this.servicioForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      precio: [null, [Validators.required, Validators.min(0.01)]],
      imagen: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.obtenerServicios();
  }

  obtenerServicios() {
    this.servicio$ = this.serv.listar(); //Asignacion directa al observable
  }



  agregarServicio() {
    if (this.servicioForm.invalid) {
      this.servicioForm.markAllAsTouched();
      return;
    }

    const nuevoServicio = this.servicioForm.value;

    if (this.modoEdicion && this.idServicioEditar !== null) {
      const index = this.servicios.findIndex(s => s.id === this.idServicioEditar);
      if (index !== -1) {
        this.servicios[index] = { ...nuevoServicio, id: this.idServicioEditar };
      }
    } else {
      const nuevo = {
        ...nuevoServicio,
        id: this.servicios.length > 0 ? Math.max(...this.servicios.map(s => s.id)) + 1 : 1
      };
      this.servicios.push(nuevo);
    }

    this.resetFormulario();
  }

  editarServicio(servicio: any) {
    this.servicioForm.setValue({
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      precio: servicio.precio,
      imagen: servicio.imagen
    });

    this.modoEdicion = true;
    this.idServicioEditar = servicio.id;
  }

  eliminarServicio(id: number) {
    this.servicios = this.servicios.filter(s => s.id !== id);
    if (this.idServicioEditar === id) {
      this.resetFormulario();
    }
  }

  actualizarServicio() {
    this.agregarServicio();
  }

  private resetFormulario() {
    this.servicioForm.reset();
    this.modoEdicion = false;
    this.idServicioEditar = null;
  }

  // ✅ Getters para validación en HTML
  get nombre() { return this.servicioForm.get('nombre'); }
  get descripcion() { return this.servicioForm.get('descripcion'); }
  get precio() { return this.servicioForm.get('precio'); }
  get imagen() { return this.servicioForm.get('imagen'); }
}
