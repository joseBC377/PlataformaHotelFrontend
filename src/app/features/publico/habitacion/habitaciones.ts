import { Component } from '@angular/core';
import { Habitacion } from '../../auth/models/habitacion';
import { HabitacionServices } from '../../admin/services/habitacion.services';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-habitaciones',
  imports: [CommonModule],
  templateUrl: './habitaciones.html',
  styleUrl: './habitaciones.scss'
})
export class Habitaciones {
  habitaciones: Habitacion[] = [];
  habitacionesFiltradas: Habitacion[] = [];
  categoriaSeleccionada: string = 'todos';
  cargando: boolean = true;

  constructor(private habitacionService: HabitacionServices) { }

  ngOnInit(): void {
    this.obtenerHabitaciones();
  }

  obtenerHabitaciones(): void {
    this.cargando = true;
    this.habitacionService.getAllHabitaciones().subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.filtrarPorCategoria(this.categoriaSeleccionada);
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al obtener habitaciones:', error);
        this.habitaciones = [];
        this.habitacionesFiltradas = [];
        this.cargando = false;
      }
    });
  }

  filtrarPorCategoria(categoria: string): void {
    this.categoriaSeleccionada = categoria;
    if (categoria.toLowerCase() === 'todos') {
      this.habitacionesFiltradas = this.habitaciones;
    } else {
      this.habitacionesFiltradas = this.habitaciones.filter(
        h => h.categoriaHabitacion.nombre.toLowerCase() === categoria.toLowerCase()
      );
    }
  }

}
