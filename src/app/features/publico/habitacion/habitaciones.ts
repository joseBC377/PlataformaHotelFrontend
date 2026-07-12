import { Component, OnInit } from '@angular/core';
import { Habitacion } from '../../auth/models/habitacion';
import { HabitacionServices } from '../../admin/services/habitacion.services';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-habitaciones',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './habitaciones.html',
  styleUrl: './habitaciones.scss'
})
export class Habitaciones implements OnInit {
  habitaciones: Habitacion[] = [];
  habitacionesFiltradas: Habitacion[] = [];
  categoriaSeleccionada: string = 'Todos';
  cargando: boolean = true;

  constructor(private habitacionService: HabitacionServices) { }

  ngOnInit(): void {
    this.obtenerHabitaciones();
  }

  get categorias(): string[] {
    const cats = new Set(
      this.habitaciones
        .map(h => h.categoriaHabitacion?.nombre_categoria)
        .filter(Boolean)
    );
    return ['Todos', ...Array.from(cats)];
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
        h => h.categoriaHabitacion?.nombre_categoria?.toLowerCase() === categoria.toLowerCase()
      );
    }
  }
}
