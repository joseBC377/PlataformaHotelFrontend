import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pago',
  imports: [CommonModule, FormsModule],
  templateUrl: './pago.html',
  styleUrl: './pago.scss'
})
export class Pago {
  
  modoEdicion = false;
  idPagoEditar: number | null = null;

  pagos: any[] = [];

  nuevoPago = {
    total: 0,
    metodo_pago: '',
    estado_pago: '',
    fecha_pago: '',
    id_reserva: ''
  };

  agregarPago() {
    const nuevo = {
      ...this.nuevoPago,
      id: this.pagos.length + 1
    };
    this.pagos.push(nuevo);
    this.resetFormulario();
  }

  editarPago(pago: any) {
    this.nuevoPago = { ...pago };
    this.modoEdicion = true;
    this.idPagoEditar = pago.id;
  }

  actualizarPago() {
    if (this.idPagoEditar !== null) {
      const index = this.pagos.findIndex(p => p.id === this.idPagoEditar);
      if (index !== -1) {
        this.pagos[index] = { ...this.nuevoPago, id: this.idPagoEditar };
      }
      this.modoEdicion = false;
      this.idPagoEditar = null;
      this.resetFormulario();
    }
  }

  eliminarPago(id: number) {
    const confirmar = confirm('¿Deseas eliminar este pago?');
    if (confirmar) {
      this.pagos = this.pagos.filter(p => p.id !== id);
      if (this.idPagoEditar === id) {
        this.modoEdicion = false;
        this.idPagoEditar = null;
      }
    }
  }

  resetFormulario() {
    this.nuevoPago = {
      total: 0,
      metodo_pago: '',
      estado_pago: '',
      fecha_pago: '',
      id_reserva: ''
    };
  }

}
