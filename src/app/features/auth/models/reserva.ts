import { UsuarioModel } from './usuario';

export type EstadoReserva = 'PENDIENTE' | 'CONFIRMADO' | 'CANCELADO';

export interface ReservaModel {
  id_reserva?: number;
  fechaCreacion: string;
  fechaEntrada?: string | Date;
  fechaSalida?: string | Date;
  estado: EstadoReserva;
  usuario: UsuarioModel;
  pago?: any;
}