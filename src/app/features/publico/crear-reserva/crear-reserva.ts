import { Component, OnInit } from '@angular/core';
import { HabitacionServices } from '../../admin/services/habitacion.services';
import { ServicioService } from '../../admin/services/servicio.service';
import { CommonModule } from '@angular/common'; // Importante para ngClass
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-crear-reserva',
  imports: [CommonModule, FormsModule],
  templateUrl: './crear-reserva.html',
  styleUrl: './crear-reserva.scss'
})
export class CrearReserva implements OnInit {
  habitacionesList: any[] = [];
  serviciosList: any[] = [];

  habitacionSeleccionada: any = null;
  serviciosSeleccionados: any[] = [];

  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(
    private habitacionService: HabitacionServices,
    private servicioService: ServicioService,
    private router: Router
  ) { }

  ngOnInit() {
    // 1. Intentamos recuperar los datos del "disco" del navegador
    const guardado = localStorage.getItem('temp_reserva');

    if (guardado) {
      const data = JSON.parse(guardado); // Convertimos el texto de vuelta a objeto
      this.fechaInicio = data.fechaInicio;
      this.fechaFin = data.fechaFin;
      this.habitacionSeleccionada = data.habitacion;
      this.serviciosSeleccionados = data.servicios;
    }

    // 2. Cargamos las listas de la API normalmente
    this.habitacionService.getAllHabitaciones().subscribe(data => this.habitacionesList = data);
    this.servicioService.listar().subscribe(data => this.serviciosList = data);
  }

  seleccionarHabitacion(h: any) {
    this.habitacionSeleccionada = h;
  }

  toggleServicio(servicio: any) {
    const index = this.serviciosSeleccionados.findIndex(s => s.id === servicio.id);
    if (index > -1) {
      this.serviciosSeleccionados.splice(index, 1);
    } else {
      this.serviciosSeleccionados.push(servicio);
    }
  }

  estaSeleccionado(servicio: any): boolean {
    return this.serviciosSeleccionados.some(s => s.id === servicio.id);
  }

  // Método para validar y calcular noches
  calcularNoches(): number {
    if (!this.fechaInicio || !this.fechaFin) return 0;
    const inicio = new Date(this.fechaInicio);
    const fin = new Date(this.fechaFin);
    const dif = fin.getTime() - inicio.getTime();
    return Math.ceil(dif / (1000 * 3600 * 24));
  }

  irAResumen() {
    const noches = this.calcularNoches();

    if (!this.habitacionSeleccionada || !this.fechaInicio || !this.fechaFin) {
      alert('Por favor, selecciona habitación y fechas válidas.');
      return;
    }

    if (noches <= 0) {
      alert('La fecha de fin debe ser posterior a la de inicio.');
      return;
    }
    const reservaData = {
      habitacion: this.habitacionSeleccionada,
      servicios: this.serviciosSeleccionados,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin,
      noches: noches,
      total: this.calcularTotalConNoches(noches)
    };
    localStorage.setItem('temp_reserva', JSON.stringify(reservaData));

    this.router.navigate(['/resumen'], {
      state: { data: reservaData }
    });
  }

  public calcularTotalConNoches(noches: number): number {
    // 1. Obtener precio de la habitación (asegúrate de usar categoriaHabitacion)
    const precioHabitacion = this.habitacionSeleccionada?.categoriaHabitacion?.precio || 0;

    // 2. Calcular subtotal de estancia
    const totalEstancia = precioHabitacion * noches;

    // 3. Sumar servicios
    let totalServicios = 0;
    this.serviciosSeleccionados.forEach(s => totalServicios += s.precio);

    // 4. EL TOTAL REAL
    return totalEstancia + totalServicios;
  }

}