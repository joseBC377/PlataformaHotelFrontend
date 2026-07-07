import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HabitacionServices } from '../../admin/services/habitacion.services';
import { ServicioService } from '../../admin/services/servicio.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-reserva.html',
  styleUrl: './crear-reserva.scss'
})
export class CrearReserva implements OnInit {
  habitacionesList: any[] = [];
  habitacionesSeleccionadas: any[] = [];

  fechaInicio: string = '';
  fechaFin: string = '';
  hoy: string = new Date().toISOString().split('T')[0];

  // en el constructor:
  constructor(
    private habitacionService: HabitacionServices,
    private router: Router,
    private route: ActivatedRoute, // nuevo
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
    if (isPlatformBrowser(this.platformId)) {
      const guardado = localStorage.getItem('temp_reserva');
      if (guardado) {
        const data = JSON.parse(guardado);
        const fechaInicioGuardada = new Date(data.fechaInicio);
        const hoy = new Date(this.hoy);

        // Solo restaura si la fecha de entrada guardada sigue siendo válida (hoy o futura)
        if (data.fechaInicio && fechaInicioGuardada >= hoy) {
          this.fechaInicio = data.fechaInicio || '';
          this.fechaFin = data.fechaFin || '';
          this.habitacionesSeleccionadas = data.habitaciones || [];
        } else {
          // Datos viejos/inválidos: limpiar caché
          localStorage.removeItem('temp_reserva');
        }
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
    const fin = new Date(this.fechaFin);
    const dif = fin.getTime() - inicio.getTime();
    const noches = Math.ceil(dif / (1000 * 3600 * 24));
    return noches > 0 ? noches : 0;
  }

  // crear-reserva.ts simplificado (sin servicios)
  calcularTotalConNoches(noches: number): number {
    let total = 0;
    this.habitacionesSeleccionadas.forEach(h => {
      total += (h.categoriaHabitacion?.precio || 0) * noches;
    });
    return total;
  }

  irAResumen() {
    const noches = this.calcularNoches();
    if (this.habitacionesSeleccionadas.length === 0 || noches <= 0) {
      alert('Selecciona al menos una habitación y fechas válidas.');
      return;
    }

    const reservaData = {
      habitaciones: this.habitacionesSeleccionadas,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      noches: noches,
      totalHabitaciones: this.calcularTotalConNoches(noches)
    };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('temp_reserva', JSON.stringify(reservaData));
    }
    this.router.navigate(['/resumen'], { state: { data: reservaData } });
  }
}