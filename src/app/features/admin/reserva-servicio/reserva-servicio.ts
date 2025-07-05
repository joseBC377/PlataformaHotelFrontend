import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

interface ReservaServicio {
  id: number;
  id_reserva: string;   // 🔧 corregido: string en lugar de number
  id_servicio: number;
}

@Component({
  selector: 'app-reserva-servicio-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reserva-servicio.html',
  styleUrls: ['./reserva-servicio.scss']
})
export class ReservaServicioAdminComponent implements OnInit {
  reservaServicioForm!: FormGroup;
  reservaServicios: ReservaServicio[] = [];
  reservas = [{ id: 'R001' }, { id: 'R002' }, { id: 'R003' }];
  servicios = [{ id: 1 }, { id: 2 }, { id: 3 }];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.reservaServicioForm = this.fb.group({
      id_reserva: ['', Validators.required],
      id_servicio: [null, Validators.required]
    });

    this.reservaServicios = [
      { id: 1, id_reserva: 'R001', id_servicio: 1 },
      { id: 2, id_reserva: 'R002', id_servicio: 2 },
      { id: 3, id_reserva: 'R003', id_servicio: 3 }
    ];
  }

  agregarReservaServicio() {
    if (this.reservaServicioForm.invalid) {
      this.reservaServicioForm.markAllAsTouched();
      return;
    }

    const nuevo = {
      ...this.reservaServicioForm.value,
      id: this.reservaServicios.length > 0 ? Math.max(...this.reservaServicios.map(rs => rs.id)) + 1 : 1
    };

    this.reservaServicios.push(nuevo);
    this.reservaServicioForm.reset();
  }

  eliminarReservaServicio(id: number) {
    const confirmar = confirm('¿Deseas eliminar este servicio reservado?');
    if (confirmar) {
      this.reservaServicios = this.reservaServicios.filter(rs => rs.id !== id);
    }
  }

  // Getters para validación
  get id_reserva() {
    return this.reservaServicioForm.get('id_reserva');
  }

  get id_servicio() {
    return this.reservaServicioForm.get('id_servicio');
  }
}
