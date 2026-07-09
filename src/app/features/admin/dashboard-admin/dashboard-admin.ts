import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardServices } from '../services/dashboard.services';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-admin.html',
  styleUrl: './dashboard-admin.scss'
})
export class DashboardAdmin implements OnInit {
  private dashboardService = inject(DashboardServices);

  stats: any = null;
  cargando = true;

  ngOnInit(): void {
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  alturaBarra(total: number): number {
    if (!this.stats?.ingresosPorMes?.length) return 0;
    const max = Math.max(...this.stats.ingresosPorMes.map((m: any) => m.total));
    return max > 0 ? (total / max) * 100 : 0;
  }
}