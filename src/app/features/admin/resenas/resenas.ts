import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';

interface Resena {
  id: number;
  calificacion: number;
  fecha: string;
  id_usuario: number;
  id_habitacion: string;
}

@Component({
  selector: 'app-resena-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './resenas.html',
  styleUrls: ['./resenas.scss']
})
export class ResenaAdminComponent implements OnInit {
  resenaForm!: FormGroup;
  resenas: Resena[] = [];
  usuarios = [{ id: 101 }, { id: 102 }, { id: 103 }];
  habitaciones = [{ id: 'H101' }, { id: 'H102' }, { id: 'H103' }];


  modoEdicion = false;
  idEditar: number | null = null;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.resenaForm = this.fb.group({
      calificacion: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      fecha: ['', Validators.required],
      id_usuario: [null, Validators.required],
      id_habitacion: [null, Validators.required]
    });

    // Carga inicial de reseñas
    this.resenas = [
      { id: 1, calificacion: 4.5, fecha: '2025-07-01', id_usuario: 101,  id_habitacion: 'H101' },
      { id: 2, calificacion: 5.0, fecha: '2025-07-02', id_usuario: 102,  id_habitacion: 'H102' },
      { id: 3, calificacion: 5.0, fecha: '2025-07-02', id_usuario: 103,  id_habitacion: 'H103' }
    ];

  }

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
}
