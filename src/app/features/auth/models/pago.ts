import { ReservaModel } from "./reserva";

// pago.model.ts - asegúrate que tenga estos campos
export interface PagoModel {
  id_pago?: number;
  total: number;
  igv: number;
  estado_pago: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fecha_pago: string;
  reserva?: any;      // puedes usar ReservaModel si lo necesitas
  metodoPago?: any;   // puedes usar MetodoPagoModel si lo necesitas
}
