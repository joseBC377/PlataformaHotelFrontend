import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { HabitacionServices } from '../../admin/services/habitacion.services';
import { ServicioService } from '../../admin/services/servicio.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
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
  serviciosList: any[] = [];

  habitacionesSeleccionadas: any[] = [];
  serviciosSeleccionados: any[] = [];

  fechaInicio: string = '';
  fechaFin: string = '';
  hoy: string = new Date().toISOString().split('T')[0];

  constructor(
    private habitacionService: HabitacionServices,
    private servicioService: ServicioService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

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
          this.serviciosSeleccionados = data.servicios || [];
        } else {
          // Datos viejos/inválidos: limpiar caché
          localStorage.removeItem('temp_reserva');
        }
      }
    }
    this.cargarDatos();
  }

  cargarDatos() {
    this.habitacionService.getAllHabitaciones().subscribe(data => this.habitacionesList = data);
    this.servicioService.listar().subscribe(data => this.serviciosList = data);
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

  estaHabitacionSeleccionada(id: number): boolean {
    return this.habitacionesSeleccionadas.some(h => h.id_habitacion === id);
  }

  toggleServicio(servicio: any) {
    const index = this.serviciosSeleccionados.findIndex(s => s.idServicio === servicio.idServicio);
    if (index > -1) {
      this.serviciosSeleccionados.splice(index, 1);
    } else {
      this.serviciosSeleccionados.push(servicio);
    }
  }

  estaSeleccionado(servicio: any): boolean {
    return this.serviciosSeleccionados.some(s => s.idServicio === servicio.idServicio);
  }

  calcularNoches(): number {
    if (!this.fechaInicio || !this.fechaFin) return 0;
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    const dif = fin.getTime() - inicio.getTime();
    const noches = Math.ceil(dif / (1000 * 3600 * 24));
    return noches > 0 ? noches : 0;
  }

  calcularTotalConNoches(noches: number): number {
    let totalHabitaciones = 0;
    this.habitacionesSeleccionadas.forEach(h => {
      totalHabitaciones += (h.categoriaHabitacion?.precio || 0) * noches;
    });
    let totalServicios = 0;
    this.serviciosSeleccionados.forEach(s => totalServicios += s.precio);
    return totalHabitaciones + totalServicios;
  }

  irAResumen() {
    const noches = this.calcularNoches();
    if (this.habitacionesSeleccionadas.length === 0 || noches <= 0) {
      alert('Selecciona al menos una habitación y fechas válidas.');
      return;
    }

    const reservaData = {
      habitaciones: this.habitacionesSeleccionadas,
      servicios: this.serviciosSeleccionados,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      noches: noches,
      total: this.calcularTotalConNoches(noches)
    };

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('temp_reserva', JSON.stringify(reservaData));
    }

    this.router.navigate(['/resumen'], { state: { data: reservaData } });
  }
}