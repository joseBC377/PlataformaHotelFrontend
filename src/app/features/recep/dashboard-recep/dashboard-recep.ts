import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecepcionServices } from '../../admin/services/recepcion.service';

@Component({
  selector: 'app-dashboard-recep',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-recep.html',
  styleUrl: './dashboard-recep.scss'
})
export class DashboardRecep implements OnInit {
  private recepcionService = inject(RecepcionServices);

  stats: any = null;
  cargando = true;
  fechaHoy: string = new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

  ngOnInit(): void {
    this.recepcionService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  claseEstado(estado: string): string {
    switch (estado) {
      case 'OCUPADA': return 'occupied';
      case 'DISPONIBLE': return 'vacant';
      default: return 'vacant';
    }
  }

  etiquetaEstado(estado: string): string {
    switch (estado) {
      case 'OCUPADA': return 'OCC';
      case 'DISPONIBLE': return 'VAC';
      default: return 'VAC';
    }
  }
}