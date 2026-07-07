import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitacionServices } from '../../admin/services/habitacion.services';
import { Habitacion } from '../../auth/models/habitacion';

@Component({
  selector: 'app-detalle-habitacion',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle-habitacion.html',
  styleUrl: './detalle-habitacion.scss'
})
export class DetalleHabitacion implements OnInit {
  habitacion: Habitacion | null = null;
  cargando = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private habitacionService: HabitacionServices
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.habitacionService.getHabitacionById(id).subscribe({
      next: (data) => {
        this.habitacion = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  reservarAhora() {
    this.router.navigate(['/crear-reserva'], {
      queryParams: { habitacionId: this.habitacion?.id_habitacion }
    });
  }
}