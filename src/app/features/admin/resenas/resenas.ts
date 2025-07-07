import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ResenaService } from '../services/resena.service';
import { Observable } from 'rxjs';
import { Resena } from '../../auth/models/resena';
/*
interface Resena {
  id: number;
  calificacion: number;
  fecha: string;
  id_usuario: number;
  id_habitacion: string;
}
*/
@Component({
  selector: 'app-resena-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AsyncPipe],
  templateUrl: './resenas.html',
  styleUrls: ['./resenas.scss']
})
export class ResenaAdminComponent implements OnInit {

  private serv = inject(ResenaService);
  protected rese$!: Observable<Resena[]>;

  resenaForm!: FormGroup;
  resenas: Resena[] = [];
 

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.resenaForm = this.fb.group({
      calificacion: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      fecha: ['', Validators.required],
      id_usuario: [null, Validators.required],
      id_habitacion: [null, Validators.required]

    });


    this.cargarResena();

  }


  cargarResena() {
    this.rese$ = this.serv.listar();
  }

  /*
  agregarResena() {
    if (this.resenaForm.invalid) {
      this.resenaForm.markAllAsTouched();
      return;
    }

    const nueva = {
      ...this.resenaForm.value,
      id: this.idEditar ?? (this.resenas.length > 0 ? Math.max(...this.resenas.map(r => r.id)) + 1 : 1)
    };

    if (this.modoEdicion) {
      const index = this.resenas.findIndex(r => r.id === this.idEditar);
      if (index !== -1) this.resenas[index] = nueva;
    } else {
      this.resenas.push(nueva);
    }

    this.resetFormulario();
  }

  editarResena(r: Resena) {
    this.resenaForm.setValue({
      calificacion: r.calificacion,
      fecha: r.fecha,
      id_usuario: r.id_usuario,
      id_habitacion: r.id_habitacion
    });
    this.idEditar = r.id;
    this.modoEdicion = true;
  }

  eliminarResena(id: number) {
    const confirmacion = confirm('¿Deseas eliminar esta reseña?');
    if (confirmacion) {
      this.resenas = this.resenas.filter(r => r.id !== id);
      if (this.idEditar === id) this.resetFormulario();
    }
  }

  actualizarResena() {
    this.agregarResena();
  }

  resetFormulario() {
    this.resenaForm.reset();
    this.modoEdicion = false;
    this.idEditar = null;
  }

  // Getters para validación
  get calificacion() { return this.resenaForm.get('calificacion'); }
  get fecha() { return this.resenaForm.get('fecha'); }
  get id_usuario() { return this.resenaForm.get('id_usuario'); }
  get id_habitacion() { return this.resenaForm.get('id_habitacion'); }
  */
}
