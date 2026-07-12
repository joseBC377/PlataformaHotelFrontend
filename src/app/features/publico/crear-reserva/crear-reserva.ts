import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HabitacionServices } from '../../admin/services/habitacion.services';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';

export const CUSTOM_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-crear-reserva',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatBadgeModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule
  ],
  templateUrl: './crear-reserva.html',
  styleUrl: './crear-reserva.scss',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ]
})
export class CrearReserva implements OnInit {
  habitacionesList: any[] = [];
  habitacionesSeleccionadas: any[] = [];

  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  hoyDate: Date = new Date();
  hoy: string = new Date().toISOString().split('T')[0];

  // Filtros adicionales para mejorar UX/UI premium
  categoriaSeleccionada: string = 'Todos';
  soloDisponibles: boolean = false;

  get categorias(): string[] {
    const cats = new Set(
      this.habitacionesList
        .map(h => h.categoriaHabitacion?.nombre_categoria)
        .filter(Boolean)
    );
    return ['Todos', ...Array.from(cats)];
  }

  get habitacionesFiltradas(): any[] {
    return this.habitacionesList.filter(h => {
      const matchCat = this.categoriaSeleccionada === 'Todos' || 
                       h.categoriaHabitacion?.nombre_categoria === this.categoriaSeleccionada;
      const matchDisp = !this.soloDisponibles || h.estado === 'DISPONIBLE';
      return matchCat && matchDisp;
    });
  }

  get minFechaFin(): Date {
    if (this.fechaInicio) {
      const minDate = new Date(this.fechaInicio);
      minDate.setDate(minDate.getDate() + 1);
      return minDate;
    }
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today;
  }

  onFechaInicioChange() {
    if (this.fechaInicio && this.fechaFin && this.fechaFin <= this.fechaInicio) {
      const nuevaSalida = new Date(this.fechaInicio);
      nuevaSalida.setDate(nuevaSalida.getDate() + 1);
      this.fechaFin = nuevaSalida;
    }
  }

  // en el constructor:
  constructor(
    private habitacionService: HabitacionServices,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  cargarDatos() {
    this.habitacionService.getAllHabitaciones().subscribe(data => {
      this.habitacionesList = data;

      const idPreseleccion = Number(this.route.snapshot.queryParamMap.get('habitacionId'));
      if (idPreseleccion) {
        const habitacion = data.find((h: any) => h.id_habitacion === idPreseleccion);
        if (habitacion && habitacion.estado === 'DISPONIBLE' && !this.estaHabitacionSeleccionada(habitacion.id_habitacion)) {
          this.habitacionesSeleccionadas.push(habitacion);
        }
      }
    });
  }

  ngOnInit() {
    this.hoyDate = new Date();
    this.hoyDate.setHours(0, 0, 0, 0);

    let dataCargada = false;

    if (isPlatformBrowser(this.platformId)) {
      // 1. Try to load from history.state (coming directly from Home via "Reservar" click)
      const navState = window.history.state;
      if (navState && navState.fechaEntrada && navState.fechaSalida) {
        const fechaEntrada = new Date(navState.fechaEntrada);
        fechaEntrada.setHours(0, 0, 0, 0);
        const fechaSalida = new Date(navState.fechaSalida);
        fechaSalida.setHours(0, 0, 0, 0);

        // Check if coming from Home with valid (today or future) dates
        if (fechaEntrada >= this.hoyDate && fechaSalida > fechaEntrada) {
          this.fechaInicio = fechaEntrada;
          this.fechaFin = fechaSalida;
          this.habitacionesSeleccionadas = []; // Clear selection for a new search from Home
          localStorage.removeItem('temp_reserva'); // Clear old cache
          dataCargada = true;
        }
      }

      // 2. If not coming from Home, try to load from localStorage (temp_reserva)
      if (!dataCargada) {
        const guardado = localStorage.getItem('temp_reserva');
        if (guardado) {
          try {
            const data = JSON.parse(guardado);
            const fechaInicioGuardada = data.fechaInicio ? new Date(data.fechaInicio + 'T00:00:00') : null;
            if (fechaInicioGuardada) {
              fechaInicioGuardada.setHours(0, 0, 0, 0);
            }
            const fechaFinGuardada = data.fechaFin ? new Date(data.fechaFin + 'T00:00:00') : null;
            if (fechaFinGuardada) {
              fechaFinGuardada.setHours(0, 0, 0, 0);
            }

            // Restore only if dates are valid (today or future, and end date is after start date)
            if (fechaInicioGuardada && fechaInicioGuardada >= this.hoyDate && fechaFinGuardada && fechaFinGuardada > fechaInicioGuardada) {
              this.fechaInicio = fechaInicioGuardada;
              this.fechaFin = fechaFinGuardada;
              this.habitacionesSeleccionadas = data.habitaciones || [];
              dataCargada = true;
            } else {
              // Old/expired/invalid data: clear cache
              localStorage.removeItem('temp_reserva');
            }
          } catch (e) {
            localStorage.removeItem('temp_reserva');
          }
        }
      }
    }

    // 3. If accessed directly without coming from Home, or if data is invalid/expired,
    // reset form (today and tomorrow) and empty selections, clearing local cache.
    if (!dataCargada) {
      this.fechaInicio = new Date(this.hoyDate);
      const tomorrow = new Date(this.hoyDate);
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.fechaFin = tomorrow;
      this.habitacionesSeleccionadas = [];
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('temp_reserva');
      }
    }

    this.cargarDatos();
  }

  seleccionarHabitacion(h: any) {
    if (h.estado !== 'DISPONIBLE') return;
    const index = this.habitacionesSeleccionadas.findIndex(item => item.id_habitacion === h.id_habitacion);
    if (index > -1) {
      this.habitacionesSeleccionadas.splice(index, 1);
    } else {
      this.habitacionesSeleccionadas.push(h);
    }
  }

  estaHabitacionSeleccionada(id?: number): boolean {
    if (id === undefined || id === null) return false;
    return this.habitacionesSeleccionadas.some(h => h.id_habitacion === id);
  }

  calcularNoches(): number {
    if (!this.fechaInicio || !this.fechaFin) return 0;
    const inicio = new Date(this.fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(this.fechaFin);
    fin.setHours(0, 0, 0, 0);
    const dif = fin.getTime() - inicio.getTime();
    const noches = Math.ceil(dif / (1000 * 3600 * 24));
    return noches > 0 ? noches : 0;
  }

  calcularTotalConNoches(noches: number): number {
    let total = 0;
    this.habitacionesSeleccionadas.forEach(h => {
      total += (h.categoriaHabitacion?.precio || 0) * noches;
    });
    return total;
  }

  formatDateToString(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  irAResumen() {
    const noches = this.calcularNoches();
    if (this.habitacionesSeleccionadas.length === 0 || noches <= 0) {
      alert('Selecciona al menos una habitación y fechas válidas.');
      return;
    }

    const reservaData = {
      habitaciones: this.habitacionesSeleccionadas,
      fechaInicio: this.formatDateToString(this.fechaInicio),
      fechaFin: this.formatDateToString(this.fechaFin),
      noches: noches,
      totalHabitaciones: this.calcularTotalConNoches(noches)
    };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('temp_reserva', JSON.stringify(reservaData));
    }
    this.router.navigate(['/resumen'], { state: { data: reservaData } });
  }
}