import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface ResultadoPago {
  tipo: 'YAPE' | 'PLIN' | 'TARJETA';
  estado: 'APROBADO';
  referencia: string;
  detalle: any;
}

@Component({
  selector: 'app-metodo-pago',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './metodo-pago.html',
  styleUrl: './metodo-pago.scss'
})
export class MetodoPago {
  @Input() monto: number = 0;
  @Output() pagoRealizado = new EventEmitter<ResultadoPago>();

  tipoSeleccionado: '' | 'YAPE' | 'PLIN' | 'TARJETA' = '';
  procesando = false;
  pagoCompletado = false;

  // Datos tarjeta
  numeroTarjeta = '';
  nombreTitular = '';
  vencimiento = '';
  cvv = '';
  marcaTarjeta: 'visa' | 'mastercard' | '' = '';

  // Datos Yape/Plin
  codigoOperacion = '';
  qrUrl = '';

  seleccionarMetodo(tipo: 'YAPE' | 'PLIN' | 'TARJETA') {
    this.tipoSeleccionado = tipo;
    this.pagoCompletado = false;
    this.procesando = false;
    this.codigoOperacion = '';

    if (tipo === 'YAPE' || tipo === 'PLIN') {
      const data = `${tipo}-RESERVA-${this.monto}-${Date.now()}`;
      this.qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(data)}`;
    }
  }

  formatearNumeroTarjeta(event: any) {
    let valor = event.target.value.replace(/\D/g, '').slice(0, 16);
    this.detectarMarca(valor);
    const grupos = valor.match(/.{1,4}/g);
    this.numeroTarjeta = grupos ? grupos.join(' ') : valor;
  }

  detectarMarca(numero: string) {
    if (numero.startsWith('4')) {
      this.marcaTarjeta = 'visa';
    } else if (/^5[1-5]/.test(numero)) {
      this.marcaTarjeta = 'mastercard';
    } else {
      this.marcaTarjeta = '';
    }
  }

  formatearVencimiento(event: any) {
    let valor = event.target.value.replace(/\D/g, '').slice(0, 4);
    if (valor.length >= 3) {
      valor = valor.slice(0, 2) + '/' + valor.slice(2);
    }
    this.vencimiento = valor;
  }

  get tarjetaValida(): boolean {
    const numeroLimpio = this.numeroTarjeta.replace(/\s/g, '');
    return numeroLimpio.length === 16 &&
           this.nombreTitular.trim().length > 3 &&
           /^\d{2}\/\d{2}$/.test(this.vencimiento) &&
           this.cvv.length >= 3;
  }

  pagarConTarjeta() {
    if (!this.tarjetaValida) return;
    this.procesando = true;

    // Simulación de llamada a una pasarela real (Culqi/Niubiz/Stripe)
    setTimeout(() => {
      this.procesando = false;
      this.pagoCompletado = true;
      const referencia = 'SIM-' + Math.random().toString(36).substring(2, 10).toUpperCase();

      this.pagoRealizado.emit({
        tipo: 'TARJETA',
        estado: 'APROBADO',
        referencia,
        detalle: {
          ultimosCuatro: this.numeroTarjeta.replace(/\s/g, '').slice(-4),
          marca: this.marcaTarjeta,
          vencimiento: this.vencimiento
        }
      });
    }, 1800);
  }

  confirmarPagoQr() {
    if (!this.codigoOperacion.trim()) return;
    this.procesando = true;

    setTimeout(() => {
      this.procesando = false;
      this.pagoCompletado = true;

      this.pagoRealizado.emit({
        tipo: this.tipoSeleccionado as 'YAPE' | 'PLIN',
        estado: 'APROBADO',
        referencia: this.codigoOperacion.trim(),
        detalle: { codigoOperacion: this.codigoOperacion.trim() }
      });
    }, 1200);
  }
}