import { MetodoPagoModel } from "./metodopago";
import { ReservaModel } from "./reserva";

// pago.model.ts - asegúrate que tenga estos campos
export interface PagoModel {
  id_pago?: number;
  total: number;
  igv: number;
  estado_pago: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fecha_pago: string;
  reserva?: ReservaModel;      // puedes usar ReservaModel si lo necesitas
  metodoPago?: MetodoPagoModel;   // puedes usar MetodoPagoModel si lo necesitas
}
export interface PagoRequestModel {
  total: number;
  igv: number;
  estado_pago: string;
  fecha_pago: string;
  reserva: { id_reserva: number };
  metodoPago: { id_metodo_pago: number };
}