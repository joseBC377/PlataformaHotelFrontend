import { Component, HostListener, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { HabitacionServices } from '../../admin/services/habitacion.services';
import { ResenaService } from '../../admin/services/resena.service';
import { AuthService } from '../../../core/services/auth.service';
import { Habitacion } from '../../auth/models/habitacion';
import { Resena } from '../../auth/models/resena';

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
  selector: 'app-inicio',
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink, 
    MatFormFieldModule, 
    MatInputModule, 
    MatDatepickerModule, 
    MatNativeDateModule,
    MatButtonModule
  ],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: CUSTOM_DATE_FORMATS },
    { provide: MAT_DATE_LOCALE, useValue: 'es-PE' }
  ]
})
export class Inicio implements OnInit, OnDestroy {
  private router = inject(Router);
  private habService = inject(HabitacionServices);
  private resenaService = inject(ResenaService);
  private authService = inject(AuthService);
  private platformId = inject(PLATFORM_ID);

  entradaControl = new FormControl(
    (() => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    })()
  );
  salidaControl = new FormControl(
    (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      return d;
    })()
  );
  minDate = (() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  })();
  
  adultos = 1;
  ninos = 0;
  habitaciones = 1;
  dropdownOpen = false;

  // New features variables
  habitacionesDestacadas: Habitacion[] = [];
  cargandoHabitaciones = true;

  resenas: Resena[] = [];
  activeReviewIndex = 0;
  autoplayInterval: any;
  isLoggedIn = false;
  private authSubscription!: Subscription;

  ngOnInit() {
    // Check authentication status
    this.authSubscription = this.authService.isAuth$.subscribe((status) => {
      this.isLoggedIn = status;
    });

    // Date binding logic
    this.entradaControl.valueChanges.subscribe((entrada) => {
      const salida = this.salidaControl.value;
      if (entrada && salida && salida <= entrada) {
        const nuevaSalida = new Date(entrada);
        nuevaSalida.setDate(nuevaSalida.getDate() + 1);
        this.salidaControl.setValue(nuevaSalida);
      }
    });

    // Load featured rooms and reviews
    this.obtenerHabitacionesDestacadas();
    this.obtenerResenas();
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    this.detenerAutoplay();
  }

  // Load 3 random rooms
  obtenerHabitacionesDestacadas() {
    this.cargandoHabitaciones = true;
    this.habService.getAllHabitaciones().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          this.habitacionesDestacadas = shuffled.slice(0, 3);
        }
        this.cargandoHabitaciones = false;
      },
      error: (error) => {
        console.error('Error al obtener habitaciones destacadas:', error);
        this.cargandoHabitaciones = false;
      }
    });
  }

  // Load reviews and initialize autoplay
  obtenerResenas() {
    this.resenaService.listar().subscribe({
      next: (data) => {
        if (data && data.length > 0) {
          this.resenas = data.filter(r => r.comentario && r.comentario.trim().length > 0);
          if (this.resenas.length === 0) {
            this.resenas = data;
          }
          this.iniciarAutoplay();
        }
      },
      error: (error) => {
        console.error('Error al obtener reseñas:', error);
      }
    });
  }

  iniciarAutoplay() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.detenerAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.nextReview();
    }, 6000);
  }

  detenerAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
    }
  }

  nextReview() {
    if (this.resenas.length > 0) {
      this.activeReviewIndex = (this.activeReviewIndex + 1) % this.resenas.length;
    }
  }

  prevReview() {
    if (this.resenas.length > 0) {
      this.activeReviewIndex = (this.activeReviewIndex - 1 + this.resenas.length) % this.resenas.length;
    }
  }

  seleccionarReview(index: number) {
    this.activeReviewIndex = index;
    this.iniciarAutoplay();
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.dropdownOpen = !this.dropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    this.dropdownOpen = false;
  }

  getValor(index: number): number {
    switch (index) {
      case 0: return this.adultos;
      case 1: return this.ninos;
      case 2: return this.habitaciones;
      default: return 0;
    }
  }

  incrementar(index: number): void {
    switch (index) {
      case 0: this.adultos++; break;
      case 1: this.ninos++; break;
      case 2: this.habitaciones++; break;
    }
  }

  decrementar(index: number): void {
    switch (index) {
      case 0: if (this.adultos > 1) this.adultos--; break;
      case 1: if (this.ninos > 0) this.ninos--; break;
      case 2: if (this.habitaciones > 1) this.habitaciones--; break;
    }
  }

  irACrearReserva() {
    if (!this.entradaControl.value || !this.salidaControl.value) {
      alert('Selecciona fechas');
      return;
    }

    if (this.habitaciones < 1) {
      alert('Debe haber al menos 1 habitación');
      return;
    }

    const data = {
      fechaEntrada: this.entradaControl.value,
      fechaSalida: this.salidaControl.value,
      adultos: this.adultos,
      ninos: this.ninos,
      habitaciones: this.habitaciones
    };

    this.router.navigate(['/crear-reserva'], {
      state: data
    });
  }
}

