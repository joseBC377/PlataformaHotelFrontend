import { ReservaModel } from "./reserva";

export interface PagoModel {
  idPago: number;
  total: number;
  igv: number;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  fecha_pago: string;
  reserva: ReservaModel;
}
