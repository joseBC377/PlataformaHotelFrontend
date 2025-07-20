import { Component, inject, OnInit } from '@angular/core';
import { ResenaService } from '../../admin/services/resena.service';
import { catchError, Observable, of, tap } from 'rxjs';
import { Resena } from '../../auth/models/resena';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-nosotros',
  imports: [AsyncPipe, CommonModule],
  templateUrl: './nosotros.html',
  styleUrl: './nosotros.scss'
})
export class Nosotros implements OnInit {
  private servResena = inject(ResenaService);
  rese$!: Observable<Resena[]>;

  ngOnInit() {
    this.rese$ = this.servResena.listar().pipe(
      tap(data => console.log('Reseñas públicas:', data)),
      catchError(error => {
        console.error('Error cargando reseñas:', error);
        return of([]);
      })
    );
  }
}